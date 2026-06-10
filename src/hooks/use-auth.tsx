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
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  login: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wakhma_token', token);
      localStorage.setItem('wakhma_user', JSON.stringify(user));
    }
    set({ token, user, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wakhma_token');
      localStorage.removeItem('wakhma_user');
    }
    set({ token: null, user: null, isLoading: false });
  },

  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('wakhma_token');
      const userStr = localStorage.getItem('wakhma_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ token, user, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    }
  },
}));
