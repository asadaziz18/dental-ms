import { api } from '@/core/api/client';

export interface BranchManager {
  id: string;
  fullName: string;
  email: string;
}

export interface BranchTreeItem {
  id: string;
  name: string;
  code: string;
  city: string;
  isActive: boolean;
  manager: BranchManager | null;
  subBranches: BranchTreeItem[];
}

export interface BranchDetail {
  id: string;
  tenantId: string;
  parentBranchId: string | null;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string | null;
  managerUserId: string | null;
  manager?: BranchManager | null;
  isActive: boolean;
  openingTime: string;
  closingTime: string;
  workingDays: string[];
  subBranches?: BranchTreeItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BranchStats {
  totalPatients: number;
  totalDoctors: number;
  totalStaff: number;
  appointmentsThisMonth: number;
  revenueThisMonth: number;
}

export interface BranchStaffItem {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface CreateBranchInput {
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email?: string | null;
  managerUserId?: string | null;
  openingTime: string;
  closingTime: string;
  workingDays: string[];
  isActive?: boolean;
}

export interface UpdateBranchInput extends Partial<CreateBranchInput> {}

export async function fetchBranchTree(): Promise<BranchTreeItem[]> {
  const { data } = await api.get<BranchTreeItem[]>('/branches');
  return data;
}

export async function fetchBranch(id: string): Promise<BranchDetail> {
  const { data } = await api.get<BranchDetail>(`/branches/${id}`);
  return data;
}

export async function fetchBranchStaff(id: string): Promise<BranchStaffItem[]> {
  const { data } = await api.get<BranchStaffItem[]>(`/branches/${id}/staff`);
  return data;
}

export async function fetchBranchStats(id: string): Promise<BranchStats> {
  const { data } = await api.get<BranchStats>(`/branches/${id}/stats`);
  return data;
}

export async function createMainBranch(body: CreateBranchInput): Promise<BranchDetail> {
  const { data } = await api.post<BranchDetail>('/branches', body);
  return data;
}

export async function createSubBranch(
  parentId: string,
  body: CreateBranchInput,
): Promise<BranchDetail> {
  const { data } = await api.post<BranchDetail>(`/branches/${parentId}/sub-branches`, body);
  return data;
}

export async function updateBranch(
  id: string,
  body: UpdateBranchInput,
): Promise<BranchDetail> {
  const { data } = await api.patch<BranchDetail>(`/branches/${id}`, body);
  return data;
}

export async function updateBranchStatus(
  id: string,
  isActive: boolean,
  reason?: string,
): Promise<BranchDetail> {
  const { data } = await api.patch<BranchDetail>(`/branches/${id}/status`, {
    isActive,
    reason,
  });
  return data;
}

export async function assignBranchManager(
  branchId: string,
  userId: string,
): Promise<BranchDetail> {
  const { data } = await api.post<BranchDetail>(`/branches/${branchId}/assign-manager`, {
    userId,
  });
  return data;
}

export async function deleteBranch(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/branches/${id}`);
  return data;
}
