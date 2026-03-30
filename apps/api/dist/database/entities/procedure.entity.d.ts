import { BaseEntity } from './base.entity';
export declare class Procedure extends BaseEntity {
    code: string;
    name: string;
    description: string | null;
    defaultFee: string;
}
