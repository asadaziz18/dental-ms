export type StockTransactionType = 'in' | 'out';

export type StockTransactionReference = 'purchase' | 'usage' | 'adjustment';

export type PurchaseOrderStatus =
  | 'Draft'
  | 'Submitted'
  | 'PartiallyReceived'
  | 'Received'
  | 'Cancelled';

export interface Supplier {
  id: string;
  branchId: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  branchId: string;
  name: string;
  sku: string;
  category: string | null;
  unit: string;
  reorderThreshold: number;
  stockLevels?: StockLevel[];
  createdAt: string;
  updatedAt: string;
}

export interface StockLevel {
  id: string;
  branchId: string;
  itemId: string;
  item?: InventoryItem;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  branchId: string;
  itemId: string;
  item?: InventoryItem;
  type: StockTransactionType;
  quantity: number;
  referenceType: StockTransactionReference | null;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderLine {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  item?: InventoryItem;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  branchId: string;
  supplierId: string;
  supplier?: Supplier;
  orderNumber: string | null;
  status: PurchaseOrderStatus;
  expectedDate: string | null;
  notes: string | null;
  lines?: PurchaseOrderLine[];
  createdAt: string;
  updatedAt: string;
}

export interface LowStockAlertItem {
  itemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  reorderThreshold: number;
}
