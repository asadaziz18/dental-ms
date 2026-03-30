export type SyncOperation = 'create' | 'update' | 'delete';
export declare class SyncEvent {
    id: string;
    entity: string;
    entityId: string;
    operation: SyncOperation;
    payload: Record<string, unknown>;
    branchId: string;
    createdAt: Date;
}
