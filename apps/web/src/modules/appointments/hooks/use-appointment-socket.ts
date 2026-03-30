import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { joinBranchRoom, onAppointmentUpdated } from '@/core/socket/socket';
import { appointmentsKeys } from './use-appointments';

/**
 * Join the branch Socket.IO room and invalidate appointments list when
 * appointment:updated is received (real-time updates).
 */
export function useAppointmentSocket(branchId: string | undefined | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!branchId) return;
    joinBranchRoom(branchId);
    const unsubscribe = onAppointmentUpdated(() => {
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.lists() });
    });
    return () => {
      unsubscribe();
    };
  }, [branchId, queryClient]);
}
