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
          // Set user from localStorage immediately for fast UI
          set({ user, isLoading: false });
          // Then refresh in background to get fresh data & re-validate
          get().refreshAuth();
          return;
        } catch {
          // Invalid JSON — fall through to refresh
        }
      }
      // No user in localStorage — try httpOnly cookies (refresh token)
      // Keep isLoading=true until refresh completes to prevent premature redirect
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
        // Refresh failed (401 = cookie expiré, 500 = erreur serveur)
        // ⚠️ NE PAS effacer localStorage si on a déjà un user en cache.
        // On garde le user en cache pour ne pas déconnecter l'utilisateur sur
        // une erreur temporaire. Les API protégées rejoueront le refresh et
        // renverront 401 si vraiment la session est invalide.
        const currentUser = get().user;
        if (currentUser) {
          // On a un user en cache → on le garde, on marque juste comme "chargé"
          set({ user: currentUser, isLoading: false });
          return currentUser;
        }
        // Pas de user en cache → on est vraiment déconnecté
        if (typeof window !== 'undefined') {
          localStorage.removeItem('wakhma_user');
        }
        set({ user: null, isLoading: false });
        return null;
      }
    } catch {
      // Erreur réseau — garder le user existant, juste arrêter le loading
      set(state => ({ isLoading: false, user: state.user }));
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
