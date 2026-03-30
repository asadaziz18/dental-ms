import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Invoice,
  InvoiceLineItem,
  Payment,
  InsuranceClaim,
  Patient,
} from '../../database/entities';
import { InvoicesService } from './invoices.service';
import { PaymentsService } from './payments.service';
import { InsuranceClaimsService } from './insurance-claims.service';
import { InvoicesController } from './invoices.controller';
import { PaymentsController } from './payments.controller';
import { InsuranceClaimsController } from './insurance-claims.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceLineItem,
      Payment,
      InsuranceClaim,
      Patient,
    ]),
  ],
  controllers: [
    InvoicesController,
    PaymentsController,
    InsuranceClaimsController,
  ],
  providers: [InvoicesService, PaymentsService, InsuranceClaimsService],
  exports: [InvoicesService, PaymentsService, InsuranceClaimsService],
})
export class BillingModule {}
