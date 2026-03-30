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

export interface ImagingRecord {
  id: string;
  branchId: string;
  patientId: string;
  fileKey: string;
  mimeType: string;
  fileName: string;
  toothNumber: number | null;
  uploadedById: string;
  annotations: ImagingAnnotation[] | null;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: { id: string; fullName: string } | null;
  patient?: { id: string; firstName: string; lastName: string } | null;
}

export interface UpdateImagingInput {
  toothNumber?: number | null;
  annotations?: ImagingAnnotation[] | null;
}
