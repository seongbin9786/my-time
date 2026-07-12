import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { calculateHashSync } from '../utils/HashUtil';
import { loadFromStorage, saveToStorage } from '../utils/StorageUtil';
import { authReducer } from './auth';
import {
  LogsReducer,
  resolveConflict,
  setConflict,
  setCurrentDateServerFetchComplete,
  triggerCurrentDateFetch,
  updateRawLog,
} from './logs';
import { RawLogStorageSyncMiddleware } from './RawLogStorageSyncMiddleware';
import { RestNotificationReducer } from './restNotification';
import { SoundSettingsReducer } from './soundSettings';

const saveLogToServer = vi.fn();

vi.mock('../services/LogService', () => ({
  getLogFromServer: vi.fn(),
  saveLogToServer: (...args: unknown[]) => saveLogToServer(...args),
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      logs: LogsReducer,
      restNotification: RestNotificationReducer,
      soundSettings: SoundSettingsReducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(RawLogStorageSyncMiddleware.middleware),
  });

describe('RawLogStorageSyncMiddleware', () => {
  beforeEach(() => {
    localStorage.clear();
    saveLogToServer.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should save the selected conflict resolution to the server', async () => {
    const store = createTestStore();
    const currentDate = store.getState().logs.currentDate;
    const localContent = '[09:00] + local';
    const localHash = calculateHashSync(localContent);

    saveToStorage(currentDate, localContent);
    saveLogToServer.mockResolvedValue({
      success: true,
      data: {
        contentHash: localHash,
        parentHash: null,
        updatedAt: '2026-01-12T00:00:00.000Z',
      },
    });

    store.dispatch(
      setConflict({
        localContent,
        serverContent: '[09:00] + server',
        baseContent: '',
        localUpdatedAt: '2026-01-12T00:00:00.000Z',
        serverUpdatedAt: '2026-01-12T00:01:00.000Z',
      }),
    );

    store.dispatch(resolveConflict({ choice: 'local' }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(saveLogToServer).toHaveBeenCalledWith(
      currentDate,
      localContent,
      localHash,
      localHash,
    );
  });

  it('should store the saved content hash as the next sync base after a promoted edit sync', async () => {
    vi.useFakeTimers();
    localStorage.setItem('token', 'mock-token');

    const store = createTestStore();
    const currentDate = store.getState().logs.currentDate;
    const previousContent = '[08:00] + previous';
    const content = '[09:00] + synced';
    const previousHash = calculateHashSync(previousContent);
    const contentHash = calculateHashSync(content);

    saveToStorage(currentDate, previousContent);

    saveLogToServer.mockResolvedValue({
      success: true,
      data: {
        contentHash,
        parentHash: previousHash,
        updatedAt: '2026-01-12T00:00:00.000Z',
        promoted: true,
      },
      promoted: true,
    });

    store.dispatch(setCurrentDateServerFetchComplete(true));
    store.dispatch(updateRawLog(content));

    await vi.advanceTimersByTimeAsync(300);

    expect(loadFromStorage(currentDate).parentHash).toBe(contentHash);
  });

  it('should keep an unpromoted save as a local draft instead of marking it synced', async () => {
    vi.useFakeTimers();
    localStorage.setItem('token', 'mock-token');

    const store = createTestStore();
    const currentDate = store.getState().logs.currentDate;
    const serverContent = '[08:00] + server current';
    const draftContent = '[09:00] + stale draft';
    const serverHash = calculateHashSync(serverContent);
    const draftHash = calculateHashSync(draftContent);

    saveToStorage(currentDate, serverContent);

    saveLogToServer.mockResolvedValue({
      success: true,
      data: {
        content: serverContent,
        contentHash: serverHash,
        parentHash: null,
        updatedAt: '2026-01-12T00:00:00.000Z',
        promoted: false,
        reason: 'STALE_BASE',
      },
      promoted: false,
      reason: 'STALE_BASE',
    });

    store.dispatch(setCurrentDateServerFetchComplete(true));
    store.dispatch(updateRawLog(draftContent));

    await vi.advanceTimersByTimeAsync(300);

    const stored = loadFromStorage(currentDate);
    expect(store.getState().logs.syncStatus).toBe('error');
    expect(stored.content).toBe(draftContent);
    expect(stored.contentHash).toBe(draftHash);
    expect(stored.parentHash).toBe(serverHash);
  });

  it('should not upload a hydrated server fetch as a user edit', async () => {
    const store = createTestStore();

    store.dispatch(triggerCurrentDateFetch());

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(saveLogToServer).not.toHaveBeenCalled();
  });
});
