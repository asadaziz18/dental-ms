import { api } from '@/core/api/client';

export interface SyncOperationPayload {
  entity: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  clientId?: string;
}

export interface SyncPushResult {
  success: boolean;
  serverId?: string;
  error?: string;
}

export async function pushSync(operations: SyncOperationPayload[]): Promise<SyncPushResult[]> {
  if (operations.length === 0) return [];
  const { data } = await api.post<{ results: SyncPushResult[] }>('/sync/push', {
    operations: operations.map((op) => ({
      entity: op.entity,
      operation: op.operation,
      payload: op.payload,
      clientId: op.payload?.clientId ?? op.clientId,
    })),
  });
  return data.results;
}

export async function pullSync(lastSyncedAt?: string): Promise<Array<{ id: string; entity: string; entityId: string; operation: string; payload: Record<string, unknown>; branchId: string; createdAt: string }>> {
  const params = lastSyncedAt ? `?lastSyncedAt=${encodeURIComponent(lastSyncedAt)}` : '';
  const { data } = await api.get(params ? `/sync/pull${params}` : '/sync/pull');
  return data;
}
