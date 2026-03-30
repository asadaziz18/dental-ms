import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Patient } from './patient.entity';
import { User } from './user.entity';

/** Annotation item for draw/text overlay */
export interface ImagingAnnotation {
  id: string;
  type: 'draw' | 'text';
  /** For draw: array of [x,y] in normalized 0-1 coords or pixel coords */
  points?: number[][];
  /** For text */
  text?: string;
  x?: number;
  y?: number;
  fontSize?: number;
  color?: string;
}

@Entity('imaging')
@Index(['patientId', 'createdAt'])
@Index(['branchId'])
export class Imaging extends BaseEntity {
  @Column({ type: 'uuid' })
  branchId!: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @Column({ type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  /** S3 object key (path) */
  @Column({ type: 'varchar', length: 512 })
  fileKey!: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType!: string;

  @Column({ type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ type: 'int', nullable: true })
  toothNumber!: number | null;

  @Column({ type: 'uuid' })
  uploadedById!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy!: User | null;

  @Column({ type: 'jsonb', nullable: true })
  annotations!: ImagingAnnotation[] | null;
}
