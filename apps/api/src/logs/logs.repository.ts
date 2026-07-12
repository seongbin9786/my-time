import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../db/prisma.service";

export const LOGS_REPOSITORY = Symbol("LOGS_REPOSITORY");

export type RevisionSource = "edit" | "restore" | "import";

export interface CurrentLog {
  userId: string;
  date: string;
  content: string;
  contentHash: string;
  parentHash: string | null;
  currentRevisionId: string;
  updatedAt: string;
  version: number;
}

export interface LogRevision {
  revisionId: string;
  userId: string;
  date: string;
  content: string;
  contentHash: string;
  baseRevisionId: string | null;
  baseContentHash?: string | null;
  source: RevisionSource;
  promoted: boolean;
  createdAt: string;
}

export interface SaveRevisionInput {
  userId: string;
  date: string;
  content: string;
  contentHash: string;
  baseRevisionId: string | null;
  baseContentHash: string | null;
  source: RevisionSource;
  clientMutationId: string | null;
}

export interface SaveRevisionResult {
  revision: LogRevision;
  current: CurrentLog | null;
  promoted: boolean;
  reason?: "STALE_BASE";
}

export interface LogsRepository {
  listCurrentLogs(userId: string): Promise<CurrentLog[]>;
  getCurrentLog(userId: string, date: string): Promise<CurrentLog | null>;
  saveRevision(input: SaveRevisionInput): Promise<SaveRevisionResult>;
  listRevisions(userId: string, date: string): Promise<LogRevision[]>;
}

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

type RevisionRecord = {
  revisionId: string;
  userId: string;
  logDate: string;
  content: string;
  contentHash: string;
  baseRevisionId: string | null;
  baseContentHash: string | null;
  source: RevisionSource;
  promoted: boolean;
  createdAt: Date;
};

function mapRevision(revision: RevisionRecord): LogRevision {
  return {
    revisionId: revision.revisionId,
    userId: revision.userId,
    date: revision.logDate,
    content: revision.content,
    contentHash: revision.contentHash,
    baseRevisionId: revision.baseRevisionId,
    baseContentHash: revision.baseContentHash,
    source: revision.source,
    promoted: revision.promoted,
    createdAt: revision.createdAt.toISOString(),
  };
}

@Injectable()
export class PrismaLogsRepository implements LogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listCurrentLogs(userId: string): Promise<CurrentLog[]> {
    const rows = await this.prisma.currentLog.findMany({
      where: { userId },
      include: { revision: true },
      orderBy: { logDate: "asc" },
    });

    return Promise.all(
      rows.map(async (row) => ({
        userId: row.userId,
        date: row.logDate,
        content: row.revision.content,
        contentHash: row.revision.contentHash,
        parentHash: row.revision.baseContentHash,
        currentRevisionId: row.currentRevisionId,
        updatedAt: row.updatedAt.toISOString(),
        version: await this.prisma.logRevision.count({
          where: { userId: row.userId, logDate: row.logDate, promoted: true },
        }),
      }))
    );
  }

  getCurrentLog(userId: string, date: string): Promise<CurrentLog | null> {
    return this.getCurrentLogWithClient(this.prisma, userId, date);
  }

  async saveRevision(input: SaveRevisionInput): Promise<SaveRevisionResult> {
    return this.runSerializableTransaction(async (transaction) => {
      await transaction.$queryRaw`
        SELECT current_revision_id
        FROM current_logs
        WHERE user_id = ${input.userId} AND log_date = ${input.date}
        FOR UPDATE
      `;

      const current = await this.getCurrentLogWithClient(
        transaction,
        input.userId,
        input.date
      );
      const shouldPromote =
        !current ||
        input.source === "import" ||
        input.source === "restore" ||
        input.baseRevisionId === current.currentRevisionId ||
        input.baseContentHash === current.contentHash;

      const revisionRecord = await transaction.logRevision.create({
        data: {
          revisionId: randomUUID(),
          userId: input.userId,
          logDate: input.date,
          content: input.content,
          contentHash: input.contentHash,
          baseRevisionId: input.baseRevisionId,
          baseContentHash: input.baseContentHash,
          source: input.source,
          promoted: shouldPromote,
          clientMutationId: input.clientMutationId,
        },
      });

      if (shouldPromote) {
        await transaction.currentLog.upsert({
          where: {
            userId_logDate: { userId: input.userId, logDate: input.date },
          },
          create: {
            userId: input.userId,
            logDate: input.date,
            currentRevisionId: revisionRecord.revisionId,
          },
          update: { currentRevisionId: revisionRecord.revisionId },
        });
      }

      const currentAfterSave = shouldPromote
        ? await this.getCurrentLogWithClient(
            transaction,
            input.userId,
            input.date
          )
        : current;

      return {
        revision: mapRevision(revisionRecord),
        current: currentAfterSave,
        promoted: shouldPromote,
        reason: shouldPromote ? undefined : "STALE_BASE",
      };
    });
  }

  async listRevisions(userId: string, date: string): Promise<LogRevision[]> {
    const revisions = await this.prisma.logRevision.findMany({
      where: { userId, logDate: date },
      orderBy: { createdAt: "desc" },
    });

    return revisions.map(mapRevision);
  }

  private async getCurrentLogWithClient(
    client: PrismaClientLike,
    userId: string,
    date: string
  ): Promise<CurrentLog | null> {
    const row = await client.currentLog.findUnique({
      where: { userId_logDate: { userId, logDate: date } },
      include: { revision: true },
    });
    if (!row) return null;

    const version = await client.logRevision.count({
      where: { userId, logDate: date, promoted: true },
    });

    return {
      userId: row.userId,
      date: row.logDate,
      content: row.revision.content,
      contentHash: row.revision.contentHash,
      parentHash: row.revision.baseContentHash,
      currentRevisionId: row.currentRevisionId,
      updatedAt: row.updatedAt.toISOString(),
      version,
    };
  }

  private async runSerializableTransaction<T>(
    callback: (transaction: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await this.prisma.$transaction(callback, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (error) {
        const shouldRetry =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034" &&
          attempt < maxAttempts;
        if (!shouldRetry) throw error;
      }
    }

    throw new Error("Serializable transaction retry exhausted");
  }
}
