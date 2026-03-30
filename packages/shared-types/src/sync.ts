/**
 * Sync engine types — shared between client and server
 */

export type SyncOperation = 'create' | 'update' | 'delete';

export interface SyncChangePayload {
  entity: string;
  entityId: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  branchId: string;
  updatedAt: string;
  version?: number;
}

export interface SyncQueueItem {
  id?: number;
  entity: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
}
