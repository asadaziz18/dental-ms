import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Readable } from 'stream';
import { Imaging } from '../../database/entities/imaging.entity';
import { Patient } from '../../database/entities/patient.entity';
import { STORAGE_SERVICE } from './storage/storage.interface';
import type { IStorageService } from './storage/storage.interface';
import { UpdateImagingDto } from './dto/update-imaging.dto';
import type { ImagingAnnotation } from '../../database/entities/imaging.entity';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export type ServeFileResult =
  | { type: 'stream'; stream: Readable; contentType: string }
  | { type: 'redirect'; url: string };

@Injectable()
export class ImagingService {
  constructor(
    @InjectRepository(Imaging)
    private readonly imagingRepo: Repository<Imaging>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @Inject(STORAGE_SERVICE)
    private readonly storage: IStorageService,
    private readonly config: ConfigService,
  ) {}

  async findByPatient(branchId: string, patientId: string): Promise<Imaging[]> {
    const patient = await this.patientRepo.findOne({
      where: { id: patientId, branchId },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return this.imagingRepo.find({
      where: { patientId, branchId },
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(branchId: string, id: string): Promise<Imaging> {
    const imaging = await this.imagingRepo.findOne({
      where: { id, branchId },
      relations: ['patient', 'uploadedBy'],
    });
    if (!imaging) throw new NotFoundException('Image not found');
    return imaging;
  }

  async upload(
    branchId: string,
    patientId: string,
    uploadedById: string,
    file: { buffer: Buffer; mimetype?: string; size: number; originalname?: string },
    toothNumber?: number | null,
  ): Promise<Imaging> {
    const patient = await this.patientRepo.findOne({
      where: { id: patientId, branchId },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    if (!file?.buffer) throw new BadRequestException('No file uploaded');
    const mime = (file.mimetype || 'image/jpeg').toLowerCase();
    if (!ALLOWED_MIMES.includes(mime)) {
      throw new BadRequestException('Only JPEG and PNG images are allowed');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large (max 20MB)');
    }
    const ext = mime === 'image/png' ? 'png' : 'jpg';
    const fileKey = `imaging/${branchId}/${patientId}/${Date.now()}-${(file.originalname || 'image').replace(/[^a-zA-Z0-9.-]/g, '_')}.${ext}`;
    await this.storage.upload(fileKey, file.buffer, mime);
    const imaging = this.imagingRepo.create({
      branchId,
      patientId,
      fileKey,
      mimeType: mime,
      fileName: file.originalname || `image.${ext}`,
      toothNumber: toothNumber ?? null,
      uploadedById,
      annotations: null,
    });
    return this.imagingRepo.save(imaging);
  }

  async getPresignedUrl(branchId: string, id: string, expiresIn = 3600): Promise<string> {
    const imaging = await this.findOne(branchId, id);
    const driver = this.config.get('STORAGE_DRIVER', 's3');
    if (driver === 'local') {
      const baseUrl = this.config.get('APP_PUBLIC_URL', 'http://localhost:3000').replace(/\/$/, '');
      return `${baseUrl}/imaging/${id}/file`;
    }
    return this.storage.getPresignedUrl(imaging.fileKey, expiresIn);
  }

  /** For GET /imaging/:id/file: stream file (local) or return redirect URL (S3) */
  async serveFile(branchId: string, id: string): Promise<ServeFileResult> {
    const imaging = await this.findOne(branchId, id);
    const driver = this.config.get('STORAGE_DRIVER', 's3');
    if (driver === 'local' && this.storage.getReadStream) {
      const stream = await this.storage.getReadStream(imaging.fileKey);
      if (!stream) throw new NotFoundException('File not found on disk');
      return { type: 'stream', stream, contentType: imaging.mimeType };
    }
    const url = await this.storage.getPresignedUrl(imaging.fileKey, 3600);
    return { type: 'redirect', url };
  }

  async update(
    branchId: string,
    id: string,
    dto: UpdateImagingDto,
  ): Promise<Imaging> {
    const imaging = await this.findOne(branchId, id);
    if (dto.toothNumber !== undefined) imaging.toothNumber = dto.toothNumber;
    if (dto.annotations !== undefined) imaging.annotations = dto.annotations as ImagingAnnotation[] | null;
    await this.imagingRepo.save(imaging);
    return this.findOne(branchId, id);
  }

  async remove(branchId: string, id: string): Promise<void> {
    const imaging = await this.findOne(branchId, id);
    await this.storage.delete(imaging.fileKey);
    await this.imagingRepo.remove(imaging);
  }
}
