'use client';

import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  plan: string;
  points: number;
  referralCode: string;
  image?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  loadFromStorage: () => void;
  refreshAuth: () => Promise<User | null>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  login: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wakhma_user', JSON.stringify(user));
    }
    set({ user, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wakhma_user');
    }
    // Call logout API to clear httpOnly cookies
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    set({ user: null, isLoading: false });
  },

  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('wakhma_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, isLoading: false });
          // Also try to refresh in background to get fresh data
          get().refreshAuth();
          return;
        } catch {
          // Invalid JSON — fall through to refresh
        }
      }
      // No user in localStorage — try to refresh from httpOnly cookies
      // This handles the case where the user logged in before the cookie migration
      // or where localStorage was cleared but cookies are still valid
      set({ isLoading: true });
      get().refreshAuth();
    }
  },

  refreshAuth: async (): Promise<User | null> => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const user = data.user;
        if (typeof window !== 'undefined') {
          localStorage.setItem('wakhma_user', JSON.stringify(user));
        }
        set({ user, isLoading: false });
        return user;
      } else {
        // Refresh failed — clear user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('wakhma_user');
        }
        set({ user: null, isLoading: false });
        return null;
      }
    } catch {
      return null;
    }
  },

  updateUser: (updates: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('wakhma_user', JSON.stringify(updatedUser));
      }
      set({ user: updatedUser });
    }
  },
}));
