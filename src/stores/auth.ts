import { defineStore } from 'pinia';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/supabase';
import type { Profile } from '@/types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    profile: null as Profile | null,
    loading: true,
    initialized: false
  }),

  getters: {
    isAdmin: (state) => state.profile?.role === 'admin',
    isJudge: (state) => state.profile?.role === 'judge',
    isAuthenticated: (state) => !!state.profile
  },

  actions: {
    async init() {
      try {
        this.profile = await authService.getCurrentProfile();
      } catch (error) {
        console.error('Auth init error:', error);
        this.profile = null;
      } finally {
        this.loading = false;
        this.initialized = true;
      }
    },

    clearAuth() {
      this.profile = null;
      this.initialized = false;
    },

    async logout() {
      await supabase.auth.signOut();
      this.clearAuth();
    }
  }
});
