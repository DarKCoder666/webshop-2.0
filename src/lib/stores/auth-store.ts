'use client';

import { create } from 'zustand';
import { AdminUser, loginAdmin, getMe, logoutAdmin, LoginPayload } from '@/api/webshop-api';

type AuthState = {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (payload: LoginPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginAdmin(payload);
      
      if (response.success && response.user) {
      
        try {
          // Wait a moment for cookies to be set, then verify
          await new Promise(resolve => setTimeout(resolve, 100));
          const verifyUser = await getMe();
          
          set({
            user: verifyUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (verifyError) {
          console.error('Cookie verification failed:', verifyError);
          // Fall back to response user if getMe fails
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: response.message || 'Login failed',
        });
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutAdmin();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await getMe();
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.log('Auth check failed:', error?.response?.status, error?.message);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null, // Don't set error for failed auth check, just set unauthenticated
      });
    }
  },

  clearError: () => set({ error: null }),
}));
