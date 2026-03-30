import { DataSource } from 'typeorm';
export declare const DEV_BRANCH_ID = "00000000-0000-0000-0000-000000000001";
export declare function seedDevBranch(dataSource: DataSource): Promise<void>;
