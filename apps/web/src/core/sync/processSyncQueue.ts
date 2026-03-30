/**
 * Processes the Dexie sync queue when online: sends operations to POST /sync/push,
 * then updates local Dexie (e.g. replace temp ids with server ids) and removes
 * successfully applied queue items.
 */
import { db } from '@/core/db/schema';
import { pushSync, type SyncOperationPayload } from './sync-api';
import { replaceStaffServerId } from '@/modules/staff/staff-offline';

const MAX_BATCH = 50;

export async function processSyncQueue(
  options?: { onProcessed?: (count: number) => void },
): Promise<{ processed: number; failed: number }> {
  const items = await db.syncQueue.orderBy('createdAt').limit(MAX_BATCH).toArray();
  if (items.length === 0) return { processed: 0, failed: 0 };

  const operations: SyncOperationPayload[] = items.map((item) => ({
    entity: item.entity,
    operation: item.operation,
    payload: { ...item.payload },
    clientId: (item.payload as { clientId?: string })?.clientId,
  }));

  let processed = 0;
  let failed = 0;

  try {
    const results = await pushSync(operations);
    const toDelete: number[] = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const op = operations[i];
      const item = items[i];
      if (result.success) {
        if (result.serverId && op.entity === 'staff' && op.operation === 'create') {
          const clientId = (op.payload as { clientId?: string })?.clientId;
          if (clientId) await replaceStaffServerId(clientId, result.serverId);
        }
        if (item.id != null) toDelete.push(item.id);
        processed++;
      } else {
        failed++;
        if (item.id != null) {
          await db.syncQueue.update(item.id, { retryCount: (item.retryCount ?? 0) + 1 });
        }
      }
    }
    for (const id of toDelete) {
      await db.syncQueue.delete(id);
    }
    options?.onProcessed?.(processed);
  } catch (_) {
    failed = items.length;
  }

  return { processed, failed };
}
