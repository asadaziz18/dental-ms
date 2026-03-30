import { SyncService, type SyncPushResult } from './sync.service';
import { PushSyncDto } from './dto/push-sync.dto';
import { RequestUser } from '../auth/decorators/current-user.decorator';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    push(branchId: string, user: RequestUser, body: PushSyncDto): Promise<{
        results: SyncPushResult[];
    }>;
    pull(branchId: string, lastSyncedAt?: string): Promise<import("../../database/entities").SyncEvent[]>;
}
