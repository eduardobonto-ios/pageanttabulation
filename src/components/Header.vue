<template>
  <header class="h-16 bg-black border-b border-slate-900 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
    <div class="flex items-center gap-4">
      <button class="lg:hidden p-2 text-slate-400 hover:bg-slate-900 rounded-lg">
        <Menu :size="24" />
      </button>
      <h2 class="text-lg font-semibold text-white hidden md:block">
        {{ pageTitle }}
      </h2>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex flex-col items-end hidden sm:flex">
        <span class="text-sm font-bold text-white">{{ authStore.profile?.full_name }}</span>
        <span class="text-xs font-medium text-teal-400 uppercase tracking-wider">{{ authStore.profile?.role }}</span>
      </div>
      
      <div class="w-10 h-10 rounded-full bg-teal-900/30 border-2 border-teal-500/20 shadow-sm flex items-center justify-center text-teal-400 font-bold">
        {{ initials }}
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCategoryStore } from '@/stores/categories';
import { Menu } from 'lucide-vue-next';
import { getInitials } from '@/lib/utils';

const route = useRoute();
const authStore = useAuthStore();
const categoryStore = useCategoryStore();

const pageTitle = computed(() => {
  if (route.path === '/admin') return 'Admin Dashboard';
  if (route.params.key) {
    const cat = categoryStore.categories.find(c => c.category_key === route.params.key);
    return cat ? cat.name : 'Scoring';
  }
  return 'Dashboard';
});

const initials = computed(() => {
  return authStore.profile?.full_name ? getInitials(authStore.profile.full_name) : '??';
});
</script>
