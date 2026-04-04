import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('platform_settings')
@Index(['key'], { unique: true })
export class PlatformSetting extends BaseEntity {
  @Column({ type: 'varchar', length: 64 })
  key!: string;

  @Column({ type: 'text', nullable: true })
  value!: string | null;
}
