/**
 * Offline cache for Lab Management using IndexedDB (Dexie reportCache).
 * Keys: 'lab:orders', 'lab:vendors', 'lab:order:{id}'.
 * When creating/updating orders or trials offline, enqueue to syncQueue
 * (entity: 'lab:order' | 'lab:vendor', operation: 'create' | 'update', payload)
 * so they sync when back online. Notifications require network and can show
 * "Notifications will be sent once you are back online".
 */
import { db } from '@/core/db/schema';

const LAB_ORDERS_KEY = 'lab:orders';
const LAB_VENDORS_KEY = 'lab:vendors';

export function labOrderCacheKey(id: string): string {
  return `lab:order:${id}`;
}

export async function getCachedLabOrders(): Promise<unknown | null> {
  const rec = await db.reportCache.where('key').equals(LAB_ORDERS_KEY).first();
  return rec?.data ?? null;
}

export async function setCachedLabOrders(data: unknown): Promise<void> {
  const existing = await db.reportCache.where('key').equals(LAB_ORDERS_KEY).first();
  const payload = { key: LAB_ORDERS_KEY, data, fetchedAt: Date.now() };
  if (existing?.id) await db.reportCache.update(existing.id, payload);
  else await db.reportCache.add(payload);
}

export async function getCachedLabVendors(): Promise<unknown | null> {
  const rec = await db.reportCache.where('key').equals(LAB_VENDORS_KEY).first();
  return rec?.data ?? null;
}

export async function setCachedLabVendors(data: unknown): Promise<void> {
  const existing = await db.reportCache.where('key').equals(LAB_VENDORS_KEY).first();
  const payload = { key: LAB_VENDORS_KEY, data, fetchedAt: Date.now() };
  if (existing?.id) await db.reportCache.update(existing.id, payload);
  else await db.reportCache.add(payload);
}

export async function getCachedLabOrder(id: string): Promise<unknown | null> {
  const key = labOrderCacheKey(id);
  const rec = await db.reportCache.where('key').equals(key).first();
  return rec?.data ?? null;
}

export async function setCachedLabOrder(id: string, data: unknown): Promise<void> {
  const key = labOrderCacheKey(id);
  const existing = await db.reportCache.where('key').equals(key).first();
  const payload = { key, data, fetchedAt: Date.now() };
  if (existing?.id) await db.reportCache.update(existing.id, payload);
  else await db.reportCache.add(payload);
}
