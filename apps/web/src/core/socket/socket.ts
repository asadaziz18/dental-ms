import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, '') || 'http://localhost:3000';

export const socket = io(socketUrl, {
  autoConnect: true,
  withCredentials: true,
});

export function joinBranchRoom(branchId: string): void {
  socket.emit('join-branch', { branchId });
}

export function onAppointmentUpdated(cb: (payload: unknown) => void): () => void {
  socket.on('appointment:updated', cb);
  return () => socket.off('appointment:updated', cb);
}

export function onInventoryLowStock(cb: (items: Array<{ itemId: string; itemName: string; sku: string; quantity: number; reorderThreshold: number }>) => void): () => void {
  socket.on('inventory:lowStock', cb);
  return () => socket.off('inventory:lowStock', cb);
}
