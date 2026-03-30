export declare class SyncOperationDto {
    entity: string;
    operation: 'create' | 'update' | 'delete';
    payload: Record<string, unknown>;
    clientId?: string;
}
export declare class PushSyncDto {
    operations: SyncOperationDto[];
}
