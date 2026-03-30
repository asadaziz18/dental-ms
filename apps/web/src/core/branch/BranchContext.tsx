import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/core/auth';
import { setBranchId } from '@/core/api/client';

type BranchContextValue = {
  branchId: string | null;
  setBranchId: (id: string | null) => void;
};

const BranchContext = createContext<BranchContextValue | null>(null);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const initialBranchId = user?.branchId ?? user?.allowedBranches?.[0] ?? null;

  useEffect(() => {
    if (!user) {
      setSelectedBranchId(null);
      setBranchId(null);
      return;
    }
    if (initialBranchId != null) {
      setSelectedBranchId((current) => {
        if (current == null) {
          setBranchId(initialBranchId);
          return initialBranchId;
        }
        const allowed = user.allowedBranches ?? (user.branchId ? [user.branchId] : []);
        const valid = allowed.length === 0 || allowed.includes(current);
        if (!valid) {
          setBranchId(initialBranchId);
          return initialBranchId;
        }
        return current;
      });
    }
  }, [user, initialBranchId]);

  const handleSetBranchId = useCallback((id: string | null) => {
    setSelectedBranchId(id);
    setBranchId(id);
  }, []);

  const value: BranchContextValue = {
    branchId: selectedBranchId,
    setBranchId: handleSetBranchId,
  };

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function useBranchId(): string | null {
  const ctx = useContext(BranchContext);
  return ctx?.branchId ?? null;
}

export function useSetBranchId(): (id: string | null) => void {
  const ctx = useContext(BranchContext);
  return ctx?.setBranchId ?? (() => {});
}
