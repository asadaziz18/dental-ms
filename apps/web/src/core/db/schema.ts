import Dexie, { type Table } from 'dexie';
import type {
  SyncStatus,
  UserRole,
  PrescriptionItem,
  ToothCondition,
  InvoiceStatus,
  PaymentMethod,
  InsuranceClaimStatus,
  StockTransactionType,
  StockTransactionReference,
  PurchaseOrderStatus,
  LeaveType,
  LeaveStatus,
} from '@dental-ms/shared-types';

/**
 * IndexedDB schema for offline-first Dental MS.
 * Mirrors server entities; _syncStatus tracks sync state.
 *
 * Modules and tables:
 * - Patients: patients
 * - Appointments: appointments
 * - Treatments: treatments, procedures, treatmentPlans, treatmentPlanItems, prescriptions
 * - Billing: invoices, invoiceLineItems, payments, insuranceClaims
 * - Inventory: inventory, inventoryItems, suppliers, stockLevels, stockTransactions, purchaseOrders, purchaseOrderLines
 * - Staff: staff, staffSchedules, staffAttendance, staffLeaves, doctorCommissionRates
 * - Imaging: imaging, imagingThumbnails
 * - Reports: reportCache (cached report data, no _syncStatus)
 * - Sync: syncQueue (entity, operation, payload, createdAt, retryCount) — wired in processSyncQueue + useSyncWorker
 */
export interface PatientRecord {
  id?: number;
  serverId?: string;
  branchId: string;
  updatedAt: string;
  _syncStatus: SyncStatus;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  medicalHistory: string | null;
  allergies: string | null;
  insuranceProvider: string | null;
  insuranceId: string | null;
  avatarUrl: string | null;
  createdAt?: string;
}

export interface AppointmentRecord {
  id?: number;
  serverId?: string;
  branchId: string;
  doctorId: string | null;
  patientId: string;
  chair: string | null;
  start: string;
  end: string;
  type: 'consultation' | 'procedure' | 'follow-up';
  status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No-Show';
  sendReminder: boolean;
  notes: string | null;
  date: string;
  _syncStatus: SyncStatus;
  patient?: { id: string; firstName: string; lastName: string };
  doctor?: { id: string; fullName: string };
}

export interface TreatmentRecord {
  id?: number;
  serverId?: string;
  patientId: string;
  _syncStatus: SyncStatus;
  [key: string]: unknown;
}

export interface ProcedureRecord {
  id?: number;
  serverId: string;
  code: string;
  name: string;
  description: string | null;
  defaultFee: string;
  updatedAt: string;
}

export interface TreatmentPlanRecord {
  id?: number;
  serverId?: string;
  patientId: string;
  branchId: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  doctorId: string | null;
  clinicalNotes: string | null;
  _syncStatus: SyncStatus;
  updatedAt: string;
  createdAt?: string;
}

export interface TreatmentPlanItemRecord {
  id?: number;
  serverId?: string;
  treatmentPlanId: string;
  toothNumber: number;
  procedureId: string;
  conditionTag: ToothCondition | null;
  status: string;
  doctorId: string | null;
  estimatedCost: string | null;
  priority: number;
  _syncStatus: SyncStatus;
  updatedAt: string;
  createdAt?: string;
}

export interface PrescriptionRecord {
  id?: number;
  serverId?: string;
  patientId: string;
  treatmentPlanId: string | null;
  prescribedById: string;
  items: PrescriptionItem[];
  notes: string | null;
  _syncStatus: SyncStatus;
  updatedAt: string;
  createdAt?: string;
}

export interface InvoiceRecord {
  id?: number;
  serverId?: string;
  patientId: string;
  branchId: string;
  treatmentPlanId: string | null;
  doctorId: string | null;
  invoiceNumber: string | null;
  status: InvoiceStatus;
  dueDate: string | null;
  subtotal: string;
  discountAmount: string;
  taxRatePercent: string;
  taxAmount: string;
  total: string;
  notes: string | null;
  _syncStatus: SyncStatus;
  updatedAt: string;
  createdAt?: string;
}

export interface InvoiceLineItemRecord {
  id?: number;
  serverId?: string;
  invoiceId: string;
  procedureId: string | null;
  description: string;
  quantity: string;
  unitPrice: string;
  discountAmount: string;
  lineTotal: string;
  _syncStatus: SyncStatus;
  updatedAt: string;
  createdAt?: string;
}

export interface PaymentRecord {
  id?: number;
  serverId?: string;
  invoiceId: string;
  branchId: string;
  amount: string;
  method: PaymentMethod;
  reference: string | null;
  paidAt: string;
  _syncStatus: SyncStatus;
  updatedAt: string;
  createdAt?: string;
}

export interface InsuranceClaimRecord {
  id?: number;
  serverId?: string;
  patientId: string;
  branchId: string;
  invoiceId: string | null;
  claimNumber: string | null;
  status: InsuranceClaimStatus;
  insuranceProvider: string | null;
  submittedAt: string | null;
  amountClaimed: string | null;
  amountApproved: string | null;
  notes: string | null;
  _syncStatus: SyncStatus;
  updatedAt: string;
  createdAt?: string;
}

export interface InventoryRecord {
  id?: number;
  serverId?: string;
  branchId: string;
  _syncStatus: SyncStatus;
  [key: string]: unknown;
}

export interface InventoryItemRecord {
  id?: number;
  serverId?: string;
  branchId: string;
  name: string;
  sku: string;
  category: string | null;
  unit: string;
  reorderThreshold: number;
  _syncStatus: SyncStatus;
  updatedAt: string;
  createdAt?: string;
}

export interface SupplierRecord {
  id?: number;
  serverId?: string;
  branchId: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  _syncStatus: SyncStatus;
  updatedAt: string;
  createdAt?: string;
}

export interface StockLevelRecord {
  id?: number;
  serverId?: string;
  branchId: string;
  itemId: string;
  quantity: number;
  _syncStatus: SyncStatus;
  updatedAt: string;
  createdAt?: string;
}

export interface StockTransactionRecord {
  id?: number;
  serverId?: string;
  branchId: string;
  itemId: string;
  type: StockTransactionType;
  quantity: number;
  referenceType: StockTransactionReference | null;
  referenceId: string | null;
  notes: string | null;
  _syncStatus: SyncStatus;
  updatedAt: string;
  createdAt?: string;
}

export interface PurchaseOrderRecord {
  id?: number;
  serverId?: string;
  branchId: string;
  supplierId: string;
  orderNumber: string | null;
  status: PurchaseOrderStatus;
  expectedDate: string | null;
  notes: string | null;
  _syncStatus: SyncStatus;
  updatedAt: string;
  createdAt?: string;
}

export interface PurchaseOrderLineRecord {
  id?: number;
  serverId?: string;
  purchaseOrderId: string;
  itemId: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: string | null;
  _syncStatus: SyncStatus;
  updatedAt: string;
  createdAt?: string;
}

export interface SyncQueueRecord {
  id?: number;
  entity: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
}

/** Staff (User) for offline directory */
export interface StaffRecord {
  id?: number;
  serverId: string;
  branchId: string | null;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  updatedAt: string;
  createdAt?: string;
  _syncStatus: SyncStatus;
}

export interface StaffScheduleRecord {
  id?: number;
  serverId: string;
  branchId: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  updatedAt: string;
  createdAt?: string;
  _syncStatus: SyncStatus;
}

export interface StaffAttendanceRecord {
  id?: number;
  serverId: string;
  branchId: string;
  userId: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  updatedAt: string;
  createdAt?: string;
  _syncStatus: SyncStatus;
}

export interface StaffLeaveRecord {
  id?: number;
  serverId: string;
  userId: string;
  branchId: string;
  fromDate: string;
  toDate: string;
  type: LeaveType;
  status: LeaveStatus;
  notes: string | null;
  updatedAt: string;
  createdAt?: string;
  _syncStatus: SyncStatus;
}

export interface DoctorCommissionRateRecord {
  id?: number;
  serverId: string;
  branchId: string;
  doctorId: string;
  ratePercent: string;
  updatedAt: string;
  createdAt?: string;
  _syncStatus: SyncStatus;
}

/** Imaging metadata for offline gallery list */
export interface ImagingRecord {
  id?: number;
  serverId: string;
  patientId: string;
  branchId: string;
  fileKey: string;
  mimeType: string;
  fileName: string;
  toothNumber: number | null;
  uploadedById: string;
  annotations: unknown[] | null;
  createdAt: string;
  updatedAt: string;
}

/** Thumbnail data URL cached in IndexedDB for offline previews */
export interface ImagingThumbnailRecord {
  id?: number;
  imagingId: string;
  dataUrl: string;
  updatedAt: string;
}

/** Cached report payload; key = e.g. "dashboard:branchId:date", stale after fetchedAt + TTL */
export interface ReportCacheRecord {
  id?: number;
  key: string;
  data: unknown;
  fetchedAt: number;
}

export class DentalMSDB extends Dexie {
  patients!: Table<PatientRecord, number>;
  appointments!: Table<AppointmentRecord, number>;
  treatments!: Table<TreatmentRecord, number>;
  procedures!: Table<ProcedureRecord, number>;
  treatmentPlans!: Table<TreatmentPlanRecord, number>;
  treatmentPlanItems!: Table<TreatmentPlanItemRecord, number>;
  prescriptions!: Table<PrescriptionRecord, number>;
  invoices!: Table<InvoiceRecord, number>;
  invoiceLineItems!: Table<InvoiceLineItemRecord, number>;
  payments!: Table<PaymentRecord, number>;
  insuranceClaims!: Table<InsuranceClaimRecord, number>;
  inventory!: Table<InventoryRecord, number>;
  inventoryItems!: Table<InventoryItemRecord, number>;
  suppliers!: Table<SupplierRecord, number>;
  stockLevels!: Table<StockLevelRecord, number>;
  stockTransactions!: Table<StockTransactionRecord, number>;
  purchaseOrders!: Table<PurchaseOrderRecord, number>;
  purchaseOrderLines!: Table<PurchaseOrderLineRecord, number>;
  syncQueue!: Table<SyncQueueRecord, number>;
  staff!: Table<StaffRecord, number>;
  staffSchedules!: Table<StaffScheduleRecord, number>;
  staffAttendance!: Table<StaffAttendanceRecord, number>;
  staffLeaves!: Table<StaffLeaveRecord, number>;
  doctorCommissionRates!: Table<DoctorCommissionRateRecord, number>;
  imaging!: Table<ImagingRecord, number>;
  imagingThumbnails!: Table<ImagingThumbnailRecord, number>;
  reportCache!: Table<ReportCacheRecord, number>;

  constructor() {
    super('DentalMSDB');
    this.version(1).stores({
      patients: '++id, serverId, branchId, updatedAt, _syncStatus, lastName, firstName, phone',
      appointments: '++id, serverId, branchId, doctorId, date, _syncStatus',
      treatments: '++id, serverId, patientId, _syncStatus',
      invoices: '++id, serverId, patientId, _syncStatus',
      inventory: '++id, serverId, branchId, _syncStatus',
      syncQueue: '++id, entity, operation, payload, createdAt, retryCount',
    });
    this.version(2).stores({
      patients: '++id, serverId, branchId, updatedAt, _syncStatus, lastName, firstName, phone',
      appointments: '++id, serverId, branchId, doctorId, date, _syncStatus',
      treatments: '++id, serverId, patientId, _syncStatus',
      procedures: '++id, serverId, code, updatedAt',
      treatmentPlans: '++id, serverId, patientId, branchId, updatedAt, _syncStatus',
      treatmentPlanItems: '++id, serverId, treatmentPlanId, toothNumber, _syncStatus',
      prescriptions: '++id, serverId, patientId, treatmentPlanId, _syncStatus',
      invoices: '++id, serverId, patientId, _syncStatus',
      inventory: '++id, serverId, branchId, _syncStatus',
      syncQueue: '++id, entity, operation, payload, createdAt, retryCount',
    });
    this.version(3).stores({
      patients: '++id, serverId, branchId, updatedAt, _syncStatus, lastName, firstName, phone',
      appointments: '++id, serverId, branchId, doctorId, date, _syncStatus',
      treatments: '++id, serverId, patientId, _syncStatus',
      procedures: '++id, serverId, code, updatedAt',
      treatmentPlans: '++id, serverId, patientId, branchId, updatedAt, _syncStatus',
      treatmentPlanItems: '++id, serverId, treatmentPlanId, toothNumber, _syncStatus',
      prescriptions: '++id, serverId, patientId, treatmentPlanId, _syncStatus',
      invoices: '++id, serverId, patientId, branchId, updatedAt, _syncStatus',
      invoiceLineItems: '++id, serverId, invoiceId, _syncStatus',
      payments: '++id, serverId, invoiceId, branchId, _syncStatus',
      insuranceClaims: '++id, serverId, patientId, branchId, _syncStatus',
      inventory: '++id, serverId, branchId, _syncStatus',
      syncQueue: '++id, entity, operation, payload, createdAt, retryCount',
    });
    this.version(4).stores({
      patients: '++id, serverId, branchId, updatedAt, _syncStatus, lastName, firstName, phone',
      appointments: '++id, serverId, branchId, doctorId, date, _syncStatus',
      treatments: '++id, serverId, patientId, _syncStatus',
      procedures: '++id, serverId, code, updatedAt',
      treatmentPlans: '++id, serverId, patientId, branchId, updatedAt, _syncStatus',
      treatmentPlanItems: '++id, serverId, treatmentPlanId, toothNumber, _syncStatus',
      prescriptions: '++id, serverId, patientId, treatmentPlanId, _syncStatus',
      invoices: '++id, serverId, patientId, branchId, updatedAt, _syncStatus',
      invoiceLineItems: '++id, serverId, invoiceId, _syncStatus',
      payments: '++id, serverId, invoiceId, branchId, _syncStatus',
      insuranceClaims: '++id, serverId, patientId, branchId, _syncStatus',
      inventory: '++id, serverId, branchId, _syncStatus',
      inventoryItems: '++id, serverId, branchId, sku, _syncStatus',
      suppliers: '++id, serverId, branchId, _syncStatus',
      stockLevels: '++id, serverId, branchId, itemId, _syncStatus',
      stockTransactions: '++id, serverId, branchId, itemId, _syncStatus',
      purchaseOrders: '++id, serverId, branchId, supplierId, _syncStatus',
      purchaseOrderLines: '++id, serverId, purchaseOrderId, itemId, _syncStatus',
      syncQueue: '++id, entity, operation, payload, createdAt, retryCount',
    });
    this.version(5).stores({
      patients: '++id, serverId, branchId, updatedAt, _syncStatus, lastName, firstName, phone',
      appointments: '++id, serverId, branchId, doctorId, date, _syncStatus',
      treatments: '++id, serverId, patientId, _syncStatus',
      procedures: '++id, serverId, code, updatedAt',
      treatmentPlans: '++id, serverId, patientId, branchId, updatedAt, _syncStatus',
      treatmentPlanItems: '++id, serverId, treatmentPlanId, toothNumber, _syncStatus',
      prescriptions: '++id, serverId, patientId, treatmentPlanId, _syncStatus',
      invoices: '++id, serverId, patientId, branchId, updatedAt, _syncStatus',
      invoiceLineItems: '++id, serverId, invoiceId, _syncStatus',
      payments: '++id, serverId, invoiceId, branchId, _syncStatus',
      insuranceClaims: '++id, serverId, patientId, branchId, _syncStatus',
      inventory: '++id, serverId, branchId, _syncStatus',
      inventoryItems: '++id, serverId, branchId, sku, _syncStatus',
      suppliers: '++id, serverId, branchId, _syncStatus',
      stockLevels: '++id, serverId, branchId, itemId, _syncStatus',
      stockTransactions: '++id, serverId, branchId, itemId, _syncStatus',
      purchaseOrders: '++id, serverId, branchId, supplierId, _syncStatus',
      purchaseOrderLines: '++id, serverId, purchaseOrderId, itemId, _syncStatus',
      syncQueue: '++id, entity, operation, payload, createdAt, retryCount',
      staff: '++id, serverId, branchId, role, updatedAt, _syncStatus',
      staffSchedules: '++id, serverId, branchId, userId, dayOfWeek, _syncStatus',
      staffAttendance: '++id, serverId, branchId, userId, date, _syncStatus',
      staffLeaves: '++id, serverId, userId, branchId, fromDate, toDate, status, _syncStatus',
      doctorCommissionRates: '++id, serverId, branchId, doctorId, _syncStatus',
    });
    this.version(6).stores({
      patients: '++id, serverId, branchId, updatedAt, _syncStatus, lastName, firstName, phone',
      appointments: '++id, serverId, branchId, doctorId, date, _syncStatus',
      treatments: '++id, serverId, patientId, _syncStatus',
      procedures: '++id, serverId, code, updatedAt',
      treatmentPlans: '++id, serverId, patientId, branchId, updatedAt, _syncStatus',
      treatmentPlanItems: '++id, serverId, treatmentPlanId, toothNumber, _syncStatus',
      prescriptions: '++id, serverId, patientId, treatmentPlanId, _syncStatus',
      invoices: '++id, serverId, patientId, branchId, updatedAt, _syncStatus',
      invoiceLineItems: '++id, serverId, invoiceId, _syncStatus',
      payments: '++id, serverId, invoiceId, branchId, _syncStatus',
      insuranceClaims: '++id, serverId, patientId, branchId, _syncStatus',
      inventory: '++id, serverId, branchId, _syncStatus',
      inventoryItems: '++id, serverId, branchId, sku, _syncStatus',
      suppliers: '++id, serverId, branchId, _syncStatus',
      stockLevels: '++id, serverId, branchId, itemId, _syncStatus',
      stockTransactions: '++id, serverId, branchId, itemId, _syncStatus',
      purchaseOrders: '++id, serverId, branchId, supplierId, _syncStatus',
      purchaseOrderLines: '++id, serverId, purchaseOrderId, itemId, _syncStatus',
      syncQueue: '++id, entity, operation, payload, createdAt, retryCount',
      staff: '++id, serverId, branchId, role, updatedAt, _syncStatus',
      staffSchedules: '++id, serverId, branchId, userId, dayOfWeek, _syncStatus',
      staffAttendance: '++id, serverId, branchId, userId, date, _syncStatus',
      staffLeaves: '++id, serverId, userId, branchId, fromDate, toDate, status, _syncStatus',
      doctorCommissionRates: '++id, serverId, branchId, doctorId, _syncStatus',
    });
    this.version(7).stores({
      patients: '++id, serverId, branchId, updatedAt, _syncStatus, lastName, firstName, phone',
      appointments: '++id, serverId, branchId, doctorId, date, _syncStatus',
      treatments: '++id, serverId, patientId, _syncStatus',
      procedures: '++id, serverId, code, updatedAt',
      treatmentPlans: '++id, serverId, patientId, branchId, updatedAt, _syncStatus',
      treatmentPlanItems: '++id, serverId, treatmentPlanId, toothNumber, _syncStatus',
      prescriptions: '++id, serverId, patientId, treatmentPlanId, _syncStatus',
      invoices: '++id, serverId, patientId, branchId, updatedAt, _syncStatus',
      invoiceLineItems: '++id, serverId, invoiceId, _syncStatus',
      payments: '++id, serverId, invoiceId, branchId, _syncStatus',
      insuranceClaims: '++id, serverId, patientId, branchId, _syncStatus',
      inventory: '++id, serverId, branchId, _syncStatus',
      inventoryItems: '++id, serverId, branchId, sku, _syncStatus',
      suppliers: '++id, serverId, branchId, _syncStatus',
      stockLevels: '++id, serverId, branchId, itemId, _syncStatus',
      stockTransactions: '++id, serverId, branchId, itemId, _syncStatus',
      purchaseOrders: '++id, serverId, branchId, supplierId, _syncStatus',
      purchaseOrderLines: '++id, serverId, purchaseOrderId, itemId, _syncStatus',
      syncQueue: '++id, entity, operation, payload, createdAt, retryCount',
      staff: '++id, serverId, branchId, role, updatedAt, _syncStatus',
      staffSchedules: '++id, serverId, branchId, userId, dayOfWeek, _syncStatus',
      staffAttendance: '++id, serverId, branchId, userId, date, _syncStatus',
      staffLeaves: '++id, serverId, userId, branchId, fromDate, toDate, status, _syncStatus',
      doctorCommissionRates: '++id, serverId, branchId, doctorId, _syncStatus',
      imaging: '++id, serverId, patientId, branchId, createdAt',
      imagingThumbnails: '++id, imagingId, updatedAt',
    });
    this.version(8).stores({
      patients: '++id, serverId, branchId, updatedAt, _syncStatus, lastName, firstName, phone',
      appointments: '++id, serverId, branchId, doctorId, date, _syncStatus',
      treatments: '++id, serverId, patientId, _syncStatus',
      procedures: '++id, serverId, code, updatedAt',
      treatmentPlans: '++id, serverId, patientId, branchId, updatedAt, _syncStatus',
      treatmentPlanItems: '++id, serverId, treatmentPlanId, toothNumber, _syncStatus',
      prescriptions: '++id, serverId, patientId, treatmentPlanId, _syncStatus',
      invoices: '++id, serverId, patientId, branchId, updatedAt, _syncStatus',
      invoiceLineItems: '++id, serverId, invoiceId, _syncStatus',
      payments: '++id, serverId, invoiceId, branchId, _syncStatus',
      insuranceClaims: '++id, serverId, patientId, branchId, _syncStatus',
      inventory: '++id, serverId, branchId, _syncStatus',
      inventoryItems: '++id, serverId, branchId, sku, _syncStatus',
      suppliers: '++id, serverId, branchId, _syncStatus',
      stockLevels: '++id, serverId, branchId, itemId, _syncStatus',
      stockTransactions: '++id, serverId, branchId, itemId, _syncStatus',
      purchaseOrders: '++id, serverId, branchId, supplierId, _syncStatus',
      purchaseOrderLines: '++id, serverId, purchaseOrderId, itemId, _syncStatus',
      syncQueue: '++id, entity, operation, payload, createdAt, retryCount',
      staff: '++id, serverId, branchId, role, updatedAt, _syncStatus',
      staffSchedules: '++id, serverId, branchId, userId, dayOfWeek, _syncStatus',
      staffAttendance: '++id, serverId, branchId, userId, date, _syncStatus',
      staffLeaves: '++id, serverId, userId, branchId, fromDate, toDate, status, _syncStatus',
      doctorCommissionRates: '++id, serverId, branchId, doctorId, _syncStatus',
      imaging: '++id, serverId, patientId, branchId, createdAt',
      imagingThumbnails: '++id, imagingId, updatedAt',
      reportCache: '++id, key, fetchedAt',
    });
  }
}

export const db = new DentalMSDB();
