import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import type { IStorageService } from './storage.interface';
export declare class LocalStorageService implements IStorageService {
    private config;
    private readonly uploadDir;
    constructor(config: ConfigService);
    private resolvePath;
    upload(key: string, body: Buffer, contentType: string): Promise<void>;
    delete(key: string): Promise<void>;
    getPresignedUrl(_key: string, _expiresInSeconds?: number): Promise<string>;
    getReadStream(key: string): Promise<Readable | null>;
}
