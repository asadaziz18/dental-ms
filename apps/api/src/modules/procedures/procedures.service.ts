import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Procedure } from '../../database/entities/procedure.entity';

@Injectable()
export class ProceduresService {
  constructor(
    @InjectRepository(Procedure)
    private readonly repo: Repository<Procedure>,
  ) {}

  findAll() {
    return this.repo.find({
      order: { code: 'ASC' },
      select: ['id', 'code', 'name', 'description', 'defaultFee'],
    });
  }
}
