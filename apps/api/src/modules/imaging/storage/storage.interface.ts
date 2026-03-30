import { Readable } from 'stream';

/**
 * Abstraction for file storage so the app can use either S3 (MinIO/AWS) or
 * local filesystem on a VPS. Choose via STORAGE_DRIVER=s3|local.
 */
export interface IStorageService {
  /** Upload a file. Key is a path like "imaging/branchId/patientId/ts-name.jpg" */
  upload(key: string, body: Buffer, contentType: string): Promise<void>;

  /** Delete a file by key */
  delete(key: string): Promise<void>;

  /**
   * Get a URL to read the file. For S3 this is a presigned URL; for local
   * this is the app's own serve URL (caller must pass baseUrl when driver is local).
   */
  getPresignedUrl(key: string, expiresInSeconds?: number): Promise<string>;

  /**
   * Get a read stream for the file. Used by local driver to serve files.
   * S3 driver can implement via getObject stream.
   */
  getReadStream?(key: string): Promise<Readable | null>;
}

/** Injection token for the active storage implementation */
export const STORAGE_SERVICE = 'STORAGE_SERVICE';
