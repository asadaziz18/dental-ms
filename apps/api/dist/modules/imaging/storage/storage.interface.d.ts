import { Readable } from 'stream';
export interface IStorageService {
    upload(key: string, body: Buffer, contentType: string): Promise<void>;
    delete(key: string): Promise<void>;
    getPresignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
    getReadStream?(key: string): Promise<Readable | null>;
}
export declare const STORAGE_SERVICE = "STORAGE_SERVICE";
