import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '@dental-ms/shared-types';
import * as authApi from './api';
import { setBranchId } from '../api/client';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    isInitialized: false,
  });

  const refreshAuth = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const { user } = await authApi.refresh();
      setState({
        user,
        isLoading: false,
        isInitialized: true,
      });
      const branchId = user.branchId ?? user.allowedBranches?.[0] ?? null;
      setBranchId(branchId);
    } catch {
      setState({
        user: null,
        isLoading: false,
        isInitialized: true,
      });
      setBranchId(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await authApi.getMe();
        if (!cancelled) {
          setState({
            user,
            isLoading: false,
            isInitialized: true,
          });
          const branchId = user.branchId ?? user.allowedBranches?.[0] ?? null;
          setBranchId(branchId);
        }
      } catch {
        if (!cancelled) {
          setState({
            user: null,
            isLoading: false,
            isInitialized: true,
          });
          setBranchId(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const { user } = await authApi.login({ email, password });
      setState({
        user,
        isLoading: false,
        isInitialized: true,
      });
      const branchId = user.branchId ?? user.allowedBranches?.[0] ?? null;
      setBranchId(branchId);
    } finally {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const logout = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      await authApi.logout();
    } finally {
      setState({
        user: null,
        isLoading: false,
        isInitialized: true,
      });
      setBranchId(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      refreshAuth,
    }),
    [state, login, logout, refreshAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
