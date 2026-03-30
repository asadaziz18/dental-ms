import { db } from './schema';

const TTL_MS = 5 * 60 * 1000; // 5 minutes

export function reportCacheKey(
  report: string,
  params: Record<string, string | undefined>,
): string {
  const parts = [report, ...Object.keys(params).sort().map((k) => params[k] ?? '')];
  return parts.join(':');
}

export async function getReportCache<T>(key: string): Promise<{ data: T; fetchedAt: number } | null> {
  const row = await db.reportCache.where('key').equals(key).first();
  if (!row) return null;
  return { data: row.data as T, fetchedAt: row.fetchedAt };
}

export async function setReportCache(key: string, data: unknown): Promise<void> {
  const existing = await db.reportCache.where('key').equals(key).first();
  const payload = { key, data, fetchedAt: Date.now() };
  if (existing?.id) {
    await db.reportCache.update(existing.id, payload);
  } else {
    await db.reportCache.add(payload);
  }
}

export function isReportStale(fetchedAt: number, ttlMs: number = TTL_MS): boolean {
  return Date.now() - fetchedAt > ttlMs;
}
