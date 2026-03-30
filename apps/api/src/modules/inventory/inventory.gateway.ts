import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

const BRANCH_ROOM_PREFIX = 'branch:';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class InventoryGateway {
  @WebSocketServer()
  server!: Server;

  /**
   * Emit low stock alert to branch room. Payload: { itemId, itemName, sku, quantity, reorderThreshold }[]
   */
  emitLowStockAlert(branchId: string, items: Array<{ itemId: string; itemName: string; sku: string; quantity: number; reorderThreshold: number }>): void {
    if (items.length === 0) return;
    const room = BRANCH_ROOM_PREFIX + branchId;
    this.server.to(room).emit('inventory:lowStock', items);
  }
}
