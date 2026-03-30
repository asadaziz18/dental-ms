import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';

export type UserRole =
  | 'SuperAdmin'
  | 'BranchAdmin'
  | 'Doctor'
  | 'Receptionist'
  | 'Nurse';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 100 })
  fullName!: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist', 'Nurse'],
  })
  role!: UserRole;

  @Column({ type: 'uuid', nullable: true })
  branchId!: string | null;

  @ManyToOne(() => Branch, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branchId' })
  branch!: Branch | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
