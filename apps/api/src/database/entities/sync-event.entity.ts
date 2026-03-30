import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

export type SyncOperation = 'create' | 'update' | 'delete';

/**
 * Event-sourced change log for sync engine.
 * POST /sync/push writes here; GET /sync/pull reads since lastSyncedAt.
 */
@Entity('sync_events')
@Index(['branchId', 'createdAt'])
export class SyncEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  entity!: string;

  @Column({ type: 'varchar', length: 36 })
  entityId!: string;

  @Column({
    type: 'varchar',
    length: 10,
    enum: ['create', 'update', 'delete'],
  })
  operation!: SyncOperation;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'uuid' })
  branchId!: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
