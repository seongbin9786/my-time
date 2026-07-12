import { Inject, Injectable } from "@nestjs/common";

import { calculateHashSync } from "./hash";
import {
  CurrentLog,
  LogRevision,
  LOGS_REPOSITORY,
  LogsRepository,
  RevisionSource,
} from "./logs.repository";

export interface SaveLogRequest {
  date: string;
  content?: string;
  contentHash?: string;
  parentHash?: string | null;
  baseRevisionId?: string | null;
  baseContentHash?: string | null;
  source?: RevisionSource;
  clientMutationId?: string | null;
}

export interface SaveLogResponse {
  success: true;
  data: CurrentLog & {
    revisionId: string;
    promoted: boolean;
    reason?: "STALE_BASE";
  };
  revision: LogRevision;
  promoted: boolean;
  reason?: "STALE_BASE";
}

@Injectable()
export class LogsService {
  constructor(
    @Inject(LOGS_REPOSITORY) private readonly repository: LogsRepository
  ) {}

  async getAllLogs(userId: string): Promise<CurrentLog[]> {
    return this.repository.listCurrentLogs(userId);
  }

  async getLog(userId: string, date: string): Promise<CurrentLog | null> {
    return this.repository.getCurrentLog(userId, date);
  }

  async saveLog(
    userId: string,
    request: SaveLogRequest
  ): Promise<SaveLogResponse> {
    const content = request.content ?? "";
    const contentHash = request.contentHash ?? calculateHashSync(content);
    const baseRevisionId = request.baseRevisionId ?? null;
    const baseContentHash =
      request.baseContentHash ?? request.parentHash ?? null;

    const result = await this.repository.saveRevision({
      userId,
      date: request.date,
      content,
      contentHash,
      baseRevisionId,
      baseContentHash,
      source: request.source ?? "edit",
      clientMutationId: request.clientMutationId ?? null,
    });

    const data = result.current ?? {
      userId,
      date: request.date,
      content,
      contentHash,
      parentHash: baseContentHash,
      currentRevisionId: result.revision.revisionId,
      updatedAt: result.revision.createdAt,
      version: 0,
    };

    return {
      success: true,
      data: {
        ...data,
        revisionId: result.revision.revisionId,
        promoted: result.promoted,
        reason: result.reason,
      },
      revision: result.revision,
      promoted: result.promoted,
      reason: result.reason,
    };
  }

  async bulkSaveLogs(userId: string, logs: SaveLogRequest[]) {
    const saved = [];
    for (const log of logs) {
      saved.push(await this.saveLog(userId, log));
    }

    return {
      success: true,
      data: saved.map((result) => result.data),
    };
  }

  async getLogBackups(userId: string, date: string) {
    const current = await this.repository.getCurrentLog(userId, date);
    const revisions = await this.repository.listRevisions(userId, date);

    return revisions
      .filter((revision) => revision.revisionId !== current?.currentRevisionId)
      .map((revision, index) => ({
        userId,
        backupId: revision.revisionId,
        date,
        content: revision.content,
        originalUpdatedAt: revision.createdAt,
        originalVersion: revisions.length - index,
        backedUpAt: revision.createdAt,
      }));
  }
}
