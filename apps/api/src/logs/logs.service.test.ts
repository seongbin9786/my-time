import { beforeEach, describe, expect, it } from "vitest";

import type { LogRevision, LogsRepository } from "./logs.repository";
import { LogsService } from "./logs.service";

class InMemoryLogsRepository implements LogsRepository {
  currentRevisionId: string | null = null;
  revisions = new Map<string, LogRevision>();

  async listCurrentLogs(userId: string) {
    const rows = Array.from(this.revisions.values())
      .filter(
        (revision) =>
          revision.userId === userId &&
          revision.revisionId === this.currentRevisionId
      )
      .map((revision) => ({
        userId: revision.userId,
        date: revision.date,
        content: revision.content,
        contentHash: revision.contentHash,
        parentHash: revision.baseContentHash ?? null,
        currentRevisionId: revision.revisionId,
        updatedAt: revision.createdAt,
        version: 1,
      }));

    return rows;
  }

  async getCurrentLog(userId: string, date: string) {
    if (!this.currentRevisionId) return null;
    const revision = this.revisions.get(this.currentRevisionId);
    if (!revision || revision.userId !== userId || revision.date !== date) {
      return null;
    }

    return {
      userId,
      date,
      content: revision.content,
      contentHash: revision.contentHash,
      parentHash: revision.baseContentHash ?? null,
      currentRevisionId: revision.revisionId,
      updatedAt: revision.createdAt,
      version: 1,
    };
  }

  async saveRevision(input: {
    userId: string;
    date: string;
    content: string;
    contentHash: string;
    baseRevisionId: string | null;
    baseContentHash: string | null;
    source: "edit" | "restore" | "import";
    clientMutationId: string | null;
  }) {
    const current = await this.getCurrentLog(input.userId, input.date);
    const shouldPromote =
      (!current && !input.baseRevisionId && !input.baseContentHash) ||
      (!!current &&
        (input.baseRevisionId === current.currentRevisionId ||
          input.baseContentHash === current.contentHash));

    const revision: LogRevision = {
      revisionId: `revision-${this.revisions.size + 1}`,
      userId: input.userId,
      date: input.date,
      content: input.content,
      contentHash: input.contentHash,
      baseRevisionId: input.baseRevisionId,
      source: input.source,
      promoted: shouldPromote,
      createdAt: `2026-06-21T00:00:0${this.revisions.size}.000Z`,
    };

    this.revisions.set(revision.revisionId, revision);
    if (shouldPromote) {
      this.currentRevisionId = revision.revisionId;
    }

    const currentAfterSave = await this.getCurrentLog(input.userId, input.date);

    return {
      revision,
      current: currentAfterSave,
      promoted: shouldPromote,
      reason: shouldPromote ? undefined : ("STALE_BASE" as const),
    };
  }

  async listRevisions(userId: string, date: string) {
    return Array.from(this.revisions.values()).filter(
      (revision) => revision.userId === userId && revision.date === date
    );
  }
}

describe("LogsService", () => {
  let repository: InMemoryLogsRepository;
  let service: LogsService;

  beforeEach(() => {
    repository = new InMemoryLogsRepository();
    service = new LogsService(repository);
  });

  it("promotes the first revision when there is no current log", async () => {
    const result = await service.saveLog("u1", {
      date: "2026-06-21",
      content: "first",
      contentHash: "hash-first",
      parentHash: null,
    });

    expect(result.promoted).toBe(true);
    expect(result.data.content).toBe("first");
    expect(result.data.currentRevisionId).toBe("revision-1");
  });

  it("preserves a stale save as an unpromoted revision without changing current", async () => {
    await service.saveLog("u1", {
      date: "2026-06-21",
      content: "current",
      contentHash: "hash-current",
      parentHash: null,
    });

    const result = await service.saveLog("u1", {
      date: "2026-06-21",
      content: "stale local edit",
      contentHash: "hash-stale",
      baseRevisionId: "old-revision",
      parentHash: "old-hash",
    });

    expect(result.promoted).toBe(false);
    expect(result.reason).toBe("STALE_BASE");
    expect(result.data.content).toBe("current");
    expect(repository.revisions.get("revision-2")?.content).toBe(
      "stale local edit"
    );
    expect(repository.currentRevisionId).toBe("revision-1");
  });
});
