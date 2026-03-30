import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Readable } from 'stream';
import { Imaging } from '../../database/entities/imaging.entity';
import { Patient } from '../../database/entities/patient.entity';
import type { IStorageService } from './storage/storage.interface';
import { UpdateImagingDto } from './dto/update-imaging.dto';
export type ServeFileResult = {
    type: 'stream';
    stream: Readable;
    contentType: string;
} | {
    type: 'redirect';
    url: string;
};
export declare class ImagingService {
    private readonly imagingRepo;
    private readonly patientRepo;
    private readonly storage;
    private readonly config;
    constructor(imagingRepo: Repository<Imaging>, patientRepo: Repository<Patient>, storage: IStorageService, config: ConfigService);
    findByPatient(branchId: string, patientId: string): Promise<Imaging[]>;
    findOne(branchId: string, id: string): Promise<Imaging>;
    upload(branchId: string, patientId: string, uploadedById: string, file: {
        buffer: Buffer;
        mimetype?: string;
        size: number;
        originalname?: string;
    }, toothNumber?: number | null): Promise<Imaging>;
    getPresignedUrl(branchId: string, id: string, expiresIn?: number): Promise<string>;
    serveFile(branchId: string, id: string): Promise<ServeFileResult>;
    update(branchId: string, id: string, dto: UpdateImagingDto): Promise<Imaging>;
    remove(branchId: string, id: string): Promise<void>;
}
