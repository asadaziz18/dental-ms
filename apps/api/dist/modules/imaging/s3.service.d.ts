import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private config;
    private readonly client;
    private readonly bucket;
    constructor(config: ConfigService);
    upload(key: string, body: Buffer, contentType: string): Promise<void>;
    getPresignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
    delete(key: string): Promise<void>;
}
