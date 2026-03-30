import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Invoice } from './invoice.entity';
import { Procedure } from './procedure.entity';

@Entity('invoice_line_items')
export class InvoiceLineItem extends BaseEntity {
  @Column({ type: 'uuid' })
  invoiceId!: string;

  @ManyToOne(() => Invoice, (inv) => inv.lineItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice;

  @Column({ type: 'uuid', nullable: true })
  procedureId!: string | null;

  @ManyToOne(() => Procedure, { nullable: true })
  @JoinColumn({ name: 'procedureId' })
  procedure!: Procedure | null;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  quantity!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  lineTotal!: string;
}
