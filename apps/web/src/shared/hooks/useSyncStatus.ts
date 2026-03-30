import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/core/db/schema';

export type SyncState = 'online' | 'offline' | 'syncing';

/** Query key for sync queue pending count; invalidate after enqueueing mutations */
export const syncPendingCountKey = ['sync', 'pendingCount'] as const;

/**
 * Tracks online/offline and pending sync queue count from Dexie.
 */
export function useSyncStatus(): {
  status: SyncState;
  isOnline: boolean;
  pendingCount: number;
} {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  const { data: pendingCount = 0 } = useQuery({
    queryKey: syncPendingCountKey,
    queryFn: () => db.syncQueue.count(),
    refetchInterval: typeof navigator !== 'undefined' && !navigator.onLine ? false : 5000,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const status: SyncState = !isOnline ? 'offline' : pendingCount > 0 ? 'syncing' : 'online';

  return { status, isOnline, pendingCount };
}
