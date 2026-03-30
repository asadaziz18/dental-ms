import { ProceduresService } from './procedures.service';
export declare class ProceduresController {
    private readonly proceduresService;
    constructor(proceduresService: ProceduresService);
    findAll(): Promise<import("../../database/entities").Procedure[]>;
}
