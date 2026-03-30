import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Branch } from './branch.entity';
import type { ScreenKey } from '@dental-ms/shared-types';

/**
 * Per-user, per-branch screen overrides. Set by BranchAdmin (or SuperAdmin) for staff in their branch.
 * When present, overrides the role default for that screen for this user in this branch.
 */
@Entity('user_screen_overrides')
@Unique(['userId', 'branchId', 'screenKey'])
export class UserScreenOverride extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  branchId!: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @Column({ type: 'varchar', length: 50 })
  screenKey!: ScreenKey;

  @Column({ type: 'boolean' })
  allowed!: boolean;
}
