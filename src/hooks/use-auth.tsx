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
        } catch {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
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
