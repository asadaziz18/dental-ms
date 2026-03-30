import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReportCache, setReportCache } from '@/core/db/report-cache';
import type { BranchTreeItem, BranchDetail, BranchStats, BranchStaffItem } from '../api';
import {
  fetchBranchTree,
  fetchBranch,
  fetchBranchStaff,
  fetchBranchStats,
  createMainBranch,
  createSubBranch,
  updateBranch,
  updateBranchStatus,
  assignBranchManager,
  deleteBranch,
} from '../api';
import type { CreateBranchInput, UpdateBranchInput } from '../api';

const BRANCHES_LIST_KEY = 'branches:list';

async function branchTreeWithCache(): Promise<BranchTreeItem[]> {
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (isOffline) {
    const cached = await getReportCache<BranchTreeItem[]>(BRANCHES_LIST_KEY);
    if (cached) return cached.data;
  }
  const data = await fetchBranchTree();
  await setReportCache(BRANCHES_LIST_KEY, data);
  return data;
}

export const branchKeys = {
  all: ['branches'] as const,
  tree: () => [...branchKeys.all, 'tree'] as const,
  detail: (id: string) => [...branchKeys.all, 'detail', id] as const,
  staff: (id: string) => [...branchKeys.all, 'staff', id] as const,
  stats: (id: string) => [...branchKeys.all, 'stats', id] as const,
};

export function useBranchTree() {
  return useQuery({
    queryKey: branchKeys.tree(),
    queryFn: branchTreeWithCache,
  });
}

export function useBranchDetail(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: branchKeys.detail(id ?? ''),
    queryFn: () => fetchBranch(id!),
    enabled: enabled && !!id,
  });
}

export function useBranchStaff(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: branchKeys.staff(id ?? ''),
    queryFn: () => fetchBranchStaff(id!),
    enabled: enabled && !!id,
  });
}

export function useBranchStats(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: branchKeys.stats(id ?? ''),
    queryFn: () => fetchBranchStats(id!),
    enabled: enabled && !!id,
  });
}

export function useCreateMainBranchMutation() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: createMainBranch,
    onSuccess: () => {
      q.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
}

export function useCreateSubBranchMutation(parentId: string) {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBranchInput) => createSubBranch(parentId, body),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
}

export function useUpdateBranchMutation(id: string) {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateBranchInput) => updateBranch(id, body),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: branchKeys.all });
      q.invalidateQueries({ queryKey: branchKeys.detail(id) });
    },
  });
}

export function useUpdateBranchStatusMutation() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive, reason }: { id: string; isActive: boolean; reason?: string }) =>
      updateBranchStatus(id, isActive, reason),
    onSuccess: (_, { id }) => {
      q.invalidateQueries({ queryKey: branchKeys.all });
      q.invalidateQueries({ queryKey: branchKeys.detail(id) });
    },
  });
}

export function useAssignBranchManagerMutation(branchId: string) {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => assignBranchManager(branchId, userId),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: branchKeys.all });
      q.invalidateQueries({ queryKey: branchKeys.detail(branchId) });
    },
  });
}

export function useDeleteBranchMutation() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      q.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
}

export async function getBranchesListLastFetched(): Promise<number | null> {
  const row = await getReportCache<BranchTreeItem[]>(BRANCHES_LIST_KEY);
  return row?.fetchedAt ?? null;
}
