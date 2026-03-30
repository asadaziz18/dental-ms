import { Repository } from 'typeorm';
import { Procedure } from '../../database/entities/procedure.entity';
export declare class ProceduresService {
    private readonly repo;
    constructor(repo: Repository<Procedure>);
    findAll(): Promise<Procedure[]>;
}
