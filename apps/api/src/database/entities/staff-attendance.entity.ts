import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { User } from './user.entity';

@Entity('staff_attendance')
@Unique(['branchId', 'userId', 'date'])
export class StaffAttendance extends BaseEntity {
  @Column({ type: 'uuid' })
  branchId!: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'timestamptz', nullable: true })
  checkInAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  checkOutAt!: Date | null;
}
