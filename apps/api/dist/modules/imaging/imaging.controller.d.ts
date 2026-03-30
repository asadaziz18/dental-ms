import { Response } from 'express';
interface MulterFile {
    fieldname: string;
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
import { ImagingService } from './imaging.service';
import { UpdateImagingDto } from './dto/update-imaging.dto';
import { RequestUser } from '../auth/decorators/current-user.decorator';
export declare class ImagingController {
    private readonly imagingService;
    constructor(imagingService: ImagingService);
    findByPatient(branchId: string, patientId: string): Promise<import("../../database/entities").Imaging[]>;
    findOne(branchId: string, id: string): Promise<import("../../database/entities").Imaging>;
    getPresignedUrl(branchId: string, id: string): Promise<{
        url: string;
    }>;
    serveFile(branchId: string, id: string, res: Response): Promise<void>;
    upload(branchId: string, user: RequestUser, patientId: string, file: MulterFile, toothNumber?: string): Promise<import("../../database/entities").Imaging>;
    update(branchId: string, id: string, dto: UpdateImagingDto): Promise<import("../../database/entities").Imaging>;
    remove(branchId: string, id: string): Promise<void>;
}
export {};
