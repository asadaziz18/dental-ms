/**
 * Lab Management — vendors, orders, trials, notifications.
 */

export type LabOrderWorkType =
  | 'crown_bridge'
  | 'denture'
  | 'orthodontic'
  | 'veneer_laminate'
  | 'implant'
  | 'custom';

export type LabOrderStatus =
  | 'draft'
  | 'sent_to_lab'
  | 'trial_scheduled'
  | 'trial_in_progress'
  | 'approved'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export type LabOrderPriority = 'normal' | 'urgent';

export type LabTrialStatus = 'scheduled' | 'completed' | 'missed';

export type LabTrialOutcome = 'approved' | 'adjustments_needed' | 'rejected';

export interface LabVendor {
  id: string;
  tenantId: string;
  name: string;
  contactPerson: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string;
  specializations: string[];
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabVendorWithSummary extends LabVendor {
  activeOrdersCount?: number;
}

export interface LabOrder {
  id: string;
  tenantId: string;
  branchId: string;
  patientId: string;
  doctorId: string;
  vendorId: string;
  treatmentId: string | null;
  orderNumber: string;
  workType: LabOrderWorkType;
  customWorkType: string | null;
  toothNumbers: string[];
  shade: string | null;
  material: string | null;
  instructions: string | null;
  status: LabOrderStatus;
  priority: LabOrderPriority;
  sentToLabAt: string | null;
  expectedTrialDate: string | null;
  finalDeliveryDate: string | null;
  labFee: string | null;
  isPaid: boolean;
  paidAt: string | null;
  attachments: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  patient?: { id: string; firstName: string; lastName: string };
  doctor?: { id: string; fullName: string };
  vendor?: LabVendor;
  branch?: { id: string; name: string; phone: string | null };
  trials?: LabTrial[];
  notifications?: LabNotification[];
}

export interface LabTrial {
  id: string;
  labOrderId: string;
  trialNumber: number;
  trialDate: string;
  status: LabTrialStatus;
  outcome: LabTrialOutcome | null;
  doctorNotes: string | null;
  labInstructions: string | null;
  completedAt: string | null;
  completedBy: string | null;
  attachments: string[];
  patientNotified: boolean;
  patientNotifiedAt: string | null;
  patientNotificationChannel: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabNotification {
  id: string;
  labOrderId: string;
  labTrialId: string | null;
  patientId: string;
  channel: 'whatsapp' | 'email';
  type: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface LabOrderCreateInput {
  patientId: string;
  doctorId: string;
  vendorId: string;
  treatmentId?: string | null;
  workType: LabOrderWorkType;
  customWorkType?: string | null;
  toothNumbers: string[];
  shade?: string | null;
  material?: string | null;
  instructions?: string | null;
  priority?: LabOrderPriority;
  sentToLabAt?: string | null;
  expectedTrialDate?: string | null;
  finalDeliveryDate?: string | null;
  labFee?: number | null;
  isPaid?: boolean;
  attachments?: string[];
}

export interface LabOrderUpdateInput extends Partial<LabOrderCreateInput> {}

export interface LabVendorCreateInput {
  name: string;
  contactPerson: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  city: string;
  specializations: string[];
  isActive?: boolean;
  notes?: string | null;
}

export interface LabVendorUpdateInput extends Partial<LabVendorCreateInput> {}

export interface LabOrderListQuery {
  patientId?: string;
  vendorId?: string;
  status?: string;
  branchId?: string;
  from?: string;
  to?: string;
  priority?: string;
  doctorId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface LabOrderListResult {
  data: LabOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface LabDashboardStats {
  activeOrders: number;
  trialsThisWeek: number;
  awaitingDelivery: number;
  overdueOrders: number;
  upcomingTrials: Array<{
    trial: LabTrial;
    order: LabOrder;
    patient: { id: string; firstName: string; lastName: string };
    vendor: { id: string; name: string };
  }>;
  recentOrders: LabOrder[];
}
