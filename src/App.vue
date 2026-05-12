<template>
  <div class="min-h-screen bg-slate-950">
    <!-- Debug Header - Always Visible -->
    <div class="bg-slate-900 border-b border-slate-800 px-4 py-3">
      <div class="max-w-[1600px] mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
          <h1 class="text-white font-bold text-lg">Pageant Tabulation 2026</h1>
          <span class="text-slate-400 text-sm">App Loaded ✓</span>
        </div>
        <div class="text-slate-500 text-xs">
          Route: {{ $route.path }}
        </div>
      </div>
    </div>

    <div
      v-if="!isSupabaseConfigured"
      class="bg-amber-950/30 border-b border-amber-900/40 px-4 py-3 text-amber-200 text-sm"
    >
      <div class="max-w-[1600px] mx-auto">
        App configuration is incomplete. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Vercel environment variables.
      </div>
    </div>

    <!-- Router View -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { isSupabaseConfigured } from '@/lib/supabase';
import { useRoute } from 'vue-router';

const route = useRoute();

console.log('App.vue loaded successfully');
console.log('Current route:', route.path);
</script>
