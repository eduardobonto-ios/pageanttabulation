<template>
  <aside 
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    :class="[
      'bg-slate-950 border-r border-slate-900 flex flex-col hidden lg:flex transition-all duration-300 sticky top-0 h-screen z-40',
      isExpanded ? 'w-72' : 'w-20'
    ]"
  >
    <div class="p-6 border-b border-slate-900 flex items-center justify-between">
      <div class="flex items-center gap-3 overflow-hidden" v-if="isExpanded">
        <div class="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-900/40 shrink-0">
          <Trophy :size="24" />
        </div>
        <div class="truncate">
          <h1 class="text-lg font-bold text-white leading-tight">Pageant</h1>
          <p class="text-xs text-amber-200 font-medium tracking-wider uppercase">Tabulation</p>
        </div>
      </div>
      <div v-else class="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-900/40 mx-auto shrink-0">
        <Trophy :size="24" />
      </div>
      
      <button 
        @click="isCollapsed = !isCollapsed"
        class="p-2 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-white transition-colors ml-auto"
        :title="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
      >
        <ChevronLeft :size="20" :class="['transition-transform duration-300', isCollapsed ? 'rotate-180' : '']" />
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
      <router-link
        v-if="authStore.isAdmin"
        to="/admin"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
        :class="[route.path === '/admin' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white']"
        :title="isCollapsed ? 'Dashboard' : ''"
      >
        <LayoutDashboard :size="20" :class="['shrink-0', route.path === '/admin' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300']" />
        <span v-if="!isCollapsed" class="font-medium truncate">Dashboard</span>
      </router-link>

      <div v-if="!isCollapsed" class="pt-4 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Categories
      </div>
      <div v-else class="pt-4 border-t border-slate-900 my-2"></div>

      <!-- Loading State -->
      <div v-if="categoryStore.loading" class="px-3 py-4 text-sm text-slate-400 flex items-center gap-2">
        <Loader2 class="animate-spin shrink-0" :size="16" />
        <span v-if="!isCollapsed">Loading...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="categoryStore.error" class="px-3 py-4 text-sm text-red-500 flex items-center gap-2">
        <AlertCircle class="shrink-0" :size="16" />
        <span v-if="!isCollapsed" class="truncate">{{ categoryStore.error }}</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="categoryStore.categories.length === 0" class="px-3 py-4 text-sm text-slate-400">
        <span v-if="!isCollapsed">No categories</span>
        <span v-else class="text-center block">...</span>
      </div>

      <router-link
        v-else
        v-for="cat in categoryStore.categories"
        :key="cat.id"
        :to="authStore.isAdmin ? `/admin/results/${cat.category_key || cat.id}` : `/judge/scoring/${cat.category_key || cat.id}`"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
        :class="[(route.params.key === cat.category_key || route.params.key == cat.id) ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-white shadow-lg shadow-amber-800/40 border border-yellow-400/40 transform scale-[1.01]' : 'text-slate-400 hover:bg-slate-900 hover:text-white']"
        :title="isCollapsed ? cat.name : ''"
      >
        <div 
          v-if="route.params.key === cat.category_key || route.params.key == cat.id" 
          class="absolute left-0 w-1 h-6 bg-white rounded-r-full"
        ></div>
        <div class="w-8 h-8 rounded-lg bg-amber-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{{ categoryAcronym(cat.name) }}</div>
        <span v-if="isExpanded" class="font-medium truncate">{{ cat.name }}</span>
        
        <div v-if="cat.is_locked && !isCollapsed" class="ml-auto shrink-0">
          <Lock :size="14" class="text-slate-500" />
        </div>
      </router-link>
    </nav>

    <div class="p-4 border-t border-slate-900">
      <button 
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition-all duration-200 group"
        :title="isCollapsed ? 'Logout' : ''"
      >
        <LogOut :size="20" class="text-slate-500 group-hover:text-red-400 shrink-0" />
        <span v-if="!isCollapsed" class="font-medium">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCategoryStore } from '@/stores/categories';
import { 
  Trophy, 
  LayoutDashboard, 
  Lock, 
  LogOut,
  Loader2,
  AlertCircle,
  ChevronLeft
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const categoryStore = useCategoryStore();

const isCollapsed = ref(false);
const isHovered = ref(false);

const isExpanded = computed(() => !isCollapsed.value || isHovered.value);

// Auto-collapse on scoring page
watch(() => route.path, (newPath) => {
  if (newPath.includes('/judge/scoring')) {
    isCollapsed.value = true;
  }
}, { immediate: true });

const categoryAcronym = (name: string) => {
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

onMounted(async () => {
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories();
  }
  console.log('Sidebar categories:', categoryStore.categories);
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
