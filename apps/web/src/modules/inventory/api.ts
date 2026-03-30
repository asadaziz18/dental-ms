import { api } from '@/core/api/client';
import type {
  Supplier,
  InventoryItem,
  StockLevel,
  StockTransaction,
  PurchaseOrder,
} from '@dental-ms/shared-types';

const SUPPLIERS_BASE = '/inventory/suppliers';
const ITEMS_BASE = '/inventory/items';
const STOCK_BASE = '/inventory/stock';
const PO_BASE = '/inventory/purchase-orders';

export interface CreateSupplierInput {
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface UpdateSupplierInput {
  name?: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface CreateInventoryItemInput {
  name: string;
  sku: string;
  category?: string | null;
  unit?: string;
  reorderThreshold?: number;
}

export interface UpdateInventoryItemInput {
  name?: string;
  sku?: string;
  category?: string | null;
  unit?: string;
  reorderThreshold?: number;
}

export interface CreateStockTransactionInput {
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  referenceType?: 'purchase' | 'usage' | 'adjustment' | null;
  referenceId?: string | null;
  notes?: string | null;
}

export interface PurchaseOrderLineInput {
  itemId: string;
  quantityOrdered: number;
  unitPrice?: number | null;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  orderNumber?: string | null;
  expectedDate?: string | null;
  notes?: string | null;
  lines: PurchaseOrderLineInput[];
}

export interface UpdatePurchaseOrderInput {
  status?: string;
  orderNumber?: string | null;
  expectedDate?: string | null;
  notes?: string | null;
  lines?: PurchaseOrderLineInput[];
}

export interface ReceivePurchaseOrderInput {
  lines: Array<{ itemId: string; quantityReceived: number }>;
}

export const suppliersApi = {
  list(): Promise<Supplier[]> {
    return api.get<Supplier[]>(SUPPLIERS_BASE).then((r) => r.data);
  },
  get(id: string): Promise<Supplier> {
    return api.get<Supplier>(`${SUPPLIERS_BASE}/${id}`).then((r) => r.data);
  },
  create(body: CreateSupplierInput): Promise<Supplier> {
    return api.post<Supplier>(SUPPLIERS_BASE, body).then((r) => r.data);
  },
  update(id: string, body: UpdateSupplierInput): Promise<Supplier> {
    return api.patch<Supplier>(`${SUPPLIERS_BASE}/${id}`, body).then((r) => r.data);
  },
  delete(id: string): Promise<void> {
    return api.delete(`${SUPPLIERS_BASE}/${id}`);
  },
};

export const inventoryItemsApi = {
  list(): Promise<InventoryItem[]> {
    return api.get<InventoryItem[]>(ITEMS_BASE).then((r) => r.data);
  },
  get(id: string): Promise<InventoryItem> {
    return api.get<InventoryItem>(`${ITEMS_BASE}/${id}`).then((r) => r.data);
  },
  create(body: CreateInventoryItemInput): Promise<InventoryItem> {
    return api.post<InventoryItem>(ITEMS_BASE, body).then((r) => r.data);
  },
  update(id: string, body: UpdateInventoryItemInput): Promise<InventoryItem> {
    return api.patch<InventoryItem>(`${ITEMS_BASE}/${id}`, body).then((r) => r.data);
  },
  delete(id: string): Promise<void> {
    return api.delete(`${ITEMS_BASE}/${id}`);
  },
};

export const stockApi = {
  getLevels(): Promise<StockLevel[]> {
    return api.get<StockLevel[]>(STOCK_BASE).then((r) => r.data);
  },
  getLevel(itemId: string): Promise<StockLevel> {
    return api.get<StockLevel>(`${STOCK_BASE}/item/${itemId}`).then((r) => r.data);
  },
  recordTransaction(body: CreateStockTransactionInput): Promise<StockTransaction> {
    return api.post<StockTransaction>(`${STOCK_BASE}/transaction`, body).then((r) => r.data);
  },
  getTransactions(itemId?: string, limit?: number): Promise<StockTransaction[]> {
    const params = new URLSearchParams();
    if (itemId) params.set('itemId', itemId);
    if (limit != null) params.set('limit', String(limit));
    return api.get<StockTransaction[]>(`${STOCK_BASE}/transactions?${params}`).then((r) => r.data);
  },
};

export const purchaseOrdersApi = {
  list(): Promise<PurchaseOrder[]> {
    return api.get<PurchaseOrder[]>(PO_BASE).then((r) => r.data);
  },
  get(id: string): Promise<PurchaseOrder> {
    return api.get<PurchaseOrder>(`${PO_BASE}/${id}`).then((r) => r.data);
  },
  create(body: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    return api.post<PurchaseOrder>(PO_BASE, body).then((r) => r.data);
  },
  update(id: string, body: UpdatePurchaseOrderInput): Promise<PurchaseOrder> {
    return api.patch<PurchaseOrder>(`${PO_BASE}/${id}`, body).then((r) => r.data);
  },
  delete(id: string): Promise<void> {
    return api.delete(`${PO_BASE}/${id}`);
  },
  receive(id: string, body: ReceivePurchaseOrderInput): Promise<PurchaseOrder> {
    return api.post<PurchaseOrder>(`${PO_BASE}/${id}/receive`, body).then((r) => r.data);
  },
};
