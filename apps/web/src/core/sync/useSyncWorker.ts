import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { syncPendingCountKey } from '@/shared/hooks/useSyncStatus';
import { processSyncQueue } from './processSyncQueue';
import { setSyncTrigger } from './sync-trigger';
import { staffKeys } from '@/modules/staff/hooks/use-staff';
import { patientsKeys } from '@/modules/patients/hooks/use-patients';
import { appointmentsKeys } from '@/modules/appointments/hooks/use-appointments';
import { invoicesKeys } from '@/modules/billing/hooks/use-billing';
import { treatmentPlansKeys } from '@/modules/treatments/hooks/use-treatments';
import { inventoryItemsKeys, stockKeys, purchaseOrdersKeys } from '@/modules/inventory/hooks/use-inventory';

/** How often to run sync when online (was 15s; 5s feels more responsive). */
const POLL_INTERVAL_MS = 5000;

/** Run sync again soon after coming online so first flush isn’t delayed. */
const RUN_AGAIN_AFTER_ONLINE_MS = 1500;

/**
 * When online, periodically flushes the Dexie sync queue to the server (POST /sync/push).
 * Also runs on online event and registers a trigger for "Sync now" button.
 */
export function useSyncWorker() {
  const queryClient = useQueryClient();
  const onlineRef = useRef(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const run = useCallback(async (): Promise<{ processed: number; failed: number }> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return { processed: 0, failed: 0 };
    const result = await processSyncQueue();
    // Always refresh pending count so banner updates (even when items failed or processed === 0)
    queryClient.invalidateQueries({ queryKey: syncPendingCountKey });
    if (result.processed > 0) {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      queryClient.invalidateQueries({ queryKey: patientsKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.all });
      queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
      queryClient.invalidateQueries({ queryKey: treatmentPlansKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryItemsKeys.all });
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      queryClient.invalidateQueries({ queryKey: purchaseOrdersKeys.all });
    }
    return result;
  }, [queryClient]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setSyncTrigger(run);

    const onOnline = () => {
      onlineRef.current = true;
      run();
      setTimeout(run, RUN_AGAIN_AFTER_ONLINE_MS);
    };

    window.addEventListener('online', onOnline);
    const interval = setInterval(run, POLL_INTERVAL_MS);
    run();

    return () => {
      setSyncTrigger(null);
      window.removeEventListener('online', onOnline);
      clearInterval(interval);
    };
  }, [run]);
}
