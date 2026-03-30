import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Branch,
  Tenant,
  User,
  Appointment,
  Patient,
  Invoice,
  Payment,
} from '../../database/entities';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Branch,
      Tenant,
      User,
      Appointment,
      Patient,
      Invoice,
      Payment,
    ]),
  ],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService, TypeOrmModule],
})
export class BranchesModule {}
