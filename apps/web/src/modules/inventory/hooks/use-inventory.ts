import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  suppliersApi,
  inventoryItemsApi,
  stockApi,
  purchaseOrdersApi,
  type CreateSupplierInput,
  type UpdateSupplierInput,
  type CreateInventoryItemInput,
  type UpdateInventoryItemInput,
  type CreateStockTransactionInput,
  type CreatePurchaseOrderInput,
  type UpdatePurchaseOrderInput,
  type ReceivePurchaseOrderInput,
} from '../api';

export const suppliersKeys = { all: ['suppliers'] as const };
export const inventoryItemsKeys = { all: ['inventoryItems'] as const };
export const stockKeys = { all: ['stock'] as const, list: (itemId?: string) => ['stock', 'transactions', itemId] as const };
export const purchaseOrdersKeys = { all: ['purchaseOrders'] as const };

export function useSuppliersQuery() {
  return useQuery({
    queryKey: suppliersKeys.all,
    queryFn: () => suppliersApi.list(),
  });
}

export function useSupplierQuery(id: string | undefined | null) {
  return useQuery({
    queryKey: [...suppliersKeys.all, id],
    queryFn: () => suppliersApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateSupplierMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSupplierInput) => suppliersApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: suppliersKeys.all }),
  });
}

export function useUpdateSupplierMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSupplierInput) => suppliersApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: suppliersKeys.all }),
  });
}

export function useDeleteSupplierMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: suppliersKeys.all }),
  });
}

export function useInventoryItemsQuery() {
  return useQuery({
    queryKey: inventoryItemsKeys.all,
    queryFn: () => inventoryItemsApi.list(),
  });
}

export function useInventoryItemQuery(id: string | undefined | null) {
  return useQuery({
    queryKey: [...inventoryItemsKeys.all, id],
    queryFn: () => inventoryItemsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateInventoryItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInventoryItemInput) => inventoryItemsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryItemsKeys.all });
      qc.invalidateQueries({ queryKey: stockKeys.all });
    },
  });
}

export function useUpdateInventoryItemMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateInventoryItemInput) => inventoryItemsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryItemsKeys.all });
      qc.invalidateQueries({ queryKey: stockKeys.all });
    },
  });
}

export function useDeleteInventoryItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryItemsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryItemsKeys.all });
      qc.invalidateQueries({ queryKey: stockKeys.all });
    },
  });
}

export function useStockLevelsQuery() {
  return useQuery({
    queryKey: stockKeys.all,
    queryFn: () => stockApi.getLevels(),
  });
}

export function useStockLevelQuery(itemId: string | undefined | null) {
  return useQuery({
    queryKey: [...stockKeys.all, itemId],
    queryFn: () => stockApi.getLevel(itemId!),
    enabled: !!itemId,
  });
}

export function useStockTransactionsQuery(itemId?: string | null) {
  return useQuery({
    queryKey: stockKeys.list(itemId ?? undefined),
    queryFn: () => stockApi.getTransactions(itemId ?? undefined, 50),
  });
}

export function useRecordStockTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStockTransactionInput) => stockApi.recordTransaction(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: stockKeys.all });
      qc.invalidateQueries({ queryKey: inventoryItemsKeys.all });
    },
  });
}

export function usePurchaseOrdersQuery() {
  return useQuery({
    queryKey: purchaseOrdersKeys.all,
    queryFn: () => purchaseOrdersApi.list(),
  });
}

export function usePurchaseOrderQuery(id: string | undefined | null) {
  return useQuery({
    queryKey: [...purchaseOrdersKeys.all, id],
    queryFn: () => purchaseOrdersApi.get(id!),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePurchaseOrderInput) => purchaseOrdersApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: purchaseOrdersKeys.all });
    },
  });
}

export function useUpdatePurchaseOrderMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePurchaseOrderInput) => purchaseOrdersApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchaseOrdersKeys.all }),
  });
}

export function useDeletePurchaseOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchaseOrdersKeys.all }),
  });
}

export function useReceivePurchaseOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReceivePurchaseOrderInput }) =>
      purchaseOrdersApi.receive(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: purchaseOrdersKeys.all });
      qc.invalidateQueries({ queryKey: stockKeys.all });
      qc.invalidateQueries({ queryKey: inventoryItemsKeys.all });
    },
  });
}
