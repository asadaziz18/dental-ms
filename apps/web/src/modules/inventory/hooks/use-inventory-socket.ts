import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { joinBranchRoom, onInventoryLowStock } from '@/core/socket/socket';
import type { LowStockAlertItem } from '@dental-ms/shared-types';
import { inventoryItemsKeys, stockKeys } from './use-inventory';

/**
 * Join branch room and listen for inventory:lowStock. Refreshes stock and items on alert.
 */
export function useInventorySocket(branchId: string | undefined | null) {
  const queryClient = useQueryClient();
  const [lowStockItems, setLowStockItems] = useState<LowStockAlertItem[]>([]);

  useEffect(() => {
    if (!branchId) return;
    joinBranchRoom(branchId);
    const unsubscribe = onInventoryLowStock((items: LowStockAlertItem[]) => {
      setLowStockItems(items);
      queryClient.invalidateQueries({ queryKey: inventoryItemsKeys.all });
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
    });
    return () => {
      unsubscribe();
      setLowStockItems([]);
    };
  }, [branchId, queryClient]);

  return { lowStockItems, clearLowStock: () => setLowStockItems([]) };
}
