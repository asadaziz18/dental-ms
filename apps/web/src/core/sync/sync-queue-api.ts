import { db } from '@/core/db/schema';
import type { SyncQueueRecord } from '@/core/db/schema';
import { syncPendingCountKey } from '@/shared/hooks/useSyncStatus';
import type { QueryClient } from '@tanstack/react-query';

/** Query key for sync queue list; invalidate when queue changes */
export const syncQueueItemsKey = ['sync', 'queueItems'] as const;

export async function getSyncQueueItems(): Promise<(SyncQueueRecord & { id: number })[]> {
  const items = await db.syncQueue.orderBy('createdAt').toArray();
  return items.filter((r): r is SyncQueueRecord & { id: number } => r.id != null);
}

export async function deleteSyncQueueItem(id: number): Promise<void> {
  await db.syncQueue.delete(id);
}

export async function clearSyncQueue(): Promise<number> {
  const items = await db.syncQueue.toArray();
  const ids = items.map((r) => r.id).filter((id): id is number => id != null);
  await db.syncQueue.bulkDelete(ids);
  return ids.length;
}

/** Call after modifying the queue so UI refetches count and list */
export function invalidateSyncQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: syncPendingCountKey });
  queryClient.invalidateQueries({ queryKey: syncQueueItemsKey });
}
