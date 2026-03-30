import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream, existsSync } from 'fs';
import { Readable } from 'stream';
import type { IStorageService } from './storage.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
  /** Resolved absolute path to the upload root */
  private readonly uploadDir: string;

  constructor(private config: ConfigService) {
    const dir = this.config.get('UPLOAD_DIR', './uploads');
    this.uploadDir = path.resolve(dir);
  }

  private resolvePath(key: string): string {
    // Disallow keys that escape uploadDir (e.g. "..")
    const full = path.resolve(this.uploadDir, key);
    const base = path.resolve(this.uploadDir);
    if (!full.startsWith(base + path.sep) && full !== base) {
      throw new Error('Invalid storage key');
    }
    return full;
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<void> {
    const full = this.resolvePath(key);
    const dir = path.dirname(full);
    if (!existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(full, body);
  }

  async delete(key: string): Promise<void> {
    const full = this.resolvePath(key);
    if (existsSync(full)) {
      fs.unlinkSync(full);
    }
  }

  async getPresignedUrl(_key: string, _expiresInSeconds?: number): Promise<string> {
    // Local driver does not use presigned URLs; callers should use the app's serve URL instead.
    throw new Error('Local storage: use app serve URL (e.g. GET /imaging/:id/file)');
  }

  async getReadStream(key: string): Promise<Readable | null> {
    const full = this.resolvePath(key);
    if (!existsSync(full)) return null;
    return createReadStream(full);
  }
}
