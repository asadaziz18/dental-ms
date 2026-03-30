export interface SyncRunResult {
  processed: number;
  failed: number;
}

/**
 * Allows triggering a sync run from outside the worker (e.g. "Sync now" button).
 * The worker registers its run function on mount.
 * Returns a Promise with result so the caller can await and show failures.
 */
let syncRun: (() => Promise<SyncRunResult>) | null = null;

export function setSyncTrigger(fn: (() => Promise<SyncRunResult>) | null): void {
  syncRun = fn;
}

export function triggerSyncNow(): Promise<SyncRunResult> {
  return syncRun?.() ?? Promise.resolve({ processed: 0, failed: 0 });
}
