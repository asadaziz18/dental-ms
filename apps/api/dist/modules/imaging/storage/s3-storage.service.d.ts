import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import type { IStorageService } from './storage.interface';
export declare class S3StorageService implements IStorageService {
    private config;
    private readonly client;
    private readonly bucket;
    private bucketEnsured;
    constructor(config: ConfigService);
    private ensureBucket;
    upload(key: string, body: Buffer, contentType: string): Promise<void>;
    getPresignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
    delete(key: string): Promise<void>;
    getReadStream(key: string): Promise<Readable | null>;
}
