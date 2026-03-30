import { api } from '@/core/api/client';
import type {
  Procedure,
  TreatmentPlan,
  TreatmentPlanItem,
  Prescription,
  PrescriptionItem,
} from '@dental-ms/shared-types';

const TREATMENTS_BASE = '/treatments';
const PRESCRIPTIONS_BASE = '/prescriptions';
const PROCEDURES_BASE = '/procedures';

export const proceduresApi = {
  list(): Promise<Procedure[]> {
    return api.get<Procedure[]>(PROCEDURES_BASE).then((r) => r.data);
  },
};

export interface CreateTreatmentPlanInput {
  patientId: string;
  status?: 'Planned' | 'In Progress' | 'Completed';
  doctorId?: string | null;
  clinicalNotes?: string | null;
}

export interface UpdateTreatmentPlanInput {
  status?: 'Planned' | 'In Progress' | 'Completed';
  doctorId?: string | null;
  clinicalNotes?: string | null;
}

export interface CreateTreatmentPlanItemInput {
  toothNumber: number;
  procedureId: string;
  conditionTag?: string | null;
  status?: string;
  doctorId?: string | null;
  estimatedCost?: number | null;
  priority?: number;
}

export interface UpdateTreatmentPlanItemInput {
  toothNumber?: number;
  procedureId?: string;
  conditionTag?: string | null;
  status?: string;
  doctorId?: string | null;
  estimatedCost?: number | null;
  priority?: number;
}

export const treatmentsApi = {
  listByPatient(patientId: string): Promise<TreatmentPlan[]> {
    return api
      .get<TreatmentPlan[]>(`${TREATMENTS_BASE}/patient/${patientId}`)
      .then((r) => r.data);
  },

  get(id: string): Promise<TreatmentPlan> {
    return api.get<TreatmentPlan>(`${TREATMENTS_BASE}/${id}`).then((r) => r.data);
  },

  create(body: CreateTreatmentPlanInput): Promise<TreatmentPlan> {
    return api.post<TreatmentPlan>(TREATMENTS_BASE, body).then((r) => r.data);
  },

  update(id: string, body: UpdateTreatmentPlanInput): Promise<TreatmentPlan> {
    return api.patch<TreatmentPlan>(`${TREATMENTS_BASE}/${id}`, body).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return api.delete(`${TREATMENTS_BASE}/${id}`);
  },

  addItem(planId: string, body: CreateTreatmentPlanItemInput): Promise<TreatmentPlanItem> {
    return api
      .post<TreatmentPlanItem>(`${TREATMENTS_BASE}/${planId}/items`, body)
      .then((r) => r.data);
  },

  updateItem(
    planId: string,
    itemId: string,
    body: UpdateTreatmentPlanItemInput,
  ): Promise<TreatmentPlanItem> {
    return api
      .patch<TreatmentPlanItem>(`${TREATMENTS_BASE}/${planId}/items/${itemId}`, body)
      .then((r) => r.data);
  },

  removeItem(planId: string, itemId: string): Promise<void> {
    return api.delete(`${TREATMENTS_BASE}/${planId}/items/${itemId}`);
  },
};

export interface CreatePrescriptionInput {
  patientId: string;
  treatmentPlanId?: string | null;
  items: PrescriptionItem[];
  notes?: string | null;
}

export interface UpdatePrescriptionInput {
  items?: PrescriptionItem[];
  notes?: string | null;
}

export const prescriptionsApi = {
  listByPatient(patientId: string): Promise<Prescription[]> {
    return api
      .get<Prescription[]>(`${PRESCRIPTIONS_BASE}/patient/${patientId}`)
      .then((r) => r.data);
  },

  get(patientId: string, id: string): Promise<Prescription> {
    return api
      .get<Prescription>(`${PRESCRIPTIONS_BASE}/patient/${patientId}/${id}`)
      .then((r) => r.data);
  },

  create(body: CreatePrescriptionInput): Promise<Prescription> {
    return api.post<Prescription>(PRESCRIPTIONS_BASE, body).then((r) => r.data);
  },

  update(patientId: string, id: string, body: UpdatePrescriptionInput): Promise<Prescription> {
    return api
      .patch<Prescription>(`${PRESCRIPTIONS_BASE}/patient/${patientId}/${id}`, body)
      .then((r) => r.data);
  },

  delete(patientId: string, id: string): Promise<void> {
    return api.delete(`${PRESCRIPTIONS_BASE}/patient/${patientId}/${id}`);
  },
};
