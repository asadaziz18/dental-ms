import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Patient } from './patient.entity';
import { User } from './user.entity';
export interface ImagingAnnotation {
    id: string;
    type: 'draw' | 'text';
    points?: number[][];
    text?: string;
    x?: number;
    y?: number;
    fontSize?: number;
    color?: string;
}
export declare class Imaging extends BaseEntity {
    branchId: string;
    branch: Branch;
    patientId: string;
    patient: Patient;
    fileKey: string;
    mimeType: string;
    fileName: string;
    toothNumber: number | null;
    uploadedById: string;
    uploadedBy: User | null;
    annotations: ImagingAnnotation[] | null;
}
