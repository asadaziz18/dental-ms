import { Server } from 'socket.io';
export declare class InventoryGateway {
    server: Server;
    emitLowStockAlert(branchId: string, items: Array<{
        itemId: string;
        itemName: string;
        sku: string;
        quantity: number;
        reorderThreshold: number;
    }>): void;
}
