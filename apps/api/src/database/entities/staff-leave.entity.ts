import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { User } from './user.entity';

export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'other';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

@Entity('staff_leaves')
export class StaffLeave extends BaseEntity {
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

  @Column({ type: 'date' })
  fromDate!: string;

  @Column({ type: 'date' })
  toDate!: string;

  @Column({ type: 'varchar', length: 20, default: 'annual' })
  type!: LeaveType;

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  status!: LeaveStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
