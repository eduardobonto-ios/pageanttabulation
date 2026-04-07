<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white">Welcome, Judge</h1>
        <p class="text-slate-400 mt-1">Select a category to begin scoring candidates.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="categoryStore.loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2 class="animate-spin text-teal-500" :size="48" />
      <p class="text-slate-500 font-medium">Loading categories...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="categoryStore.error" class="bg-red-950/20 border border-red-900/50 text-red-400 p-6 rounded-3xl flex items-center gap-3">
      <AlertCircle :size="24" />
      <p class="font-bold">{{ categoryStore.error }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="categoryStore.categories.length === 0" class="bg-slate-900 rounded-3xl border border-slate-800 p-12 text-center">
      <div class="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center text-slate-700 mx-auto mb-6">
        <Star :size="40" />
      </div>
      <h3 class="text-xl font-bold text-white mb-2">No categories found</h3>
      <p class="text-slate-400">Categories will appear here once they are added by the admin.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link
        v-for="cat in categoryStore.categories"
        :key="cat.id"
        :to="`/judge/scoring/${cat.category_key || cat.id}`"
        class="bg-slate-900 rounded-3xl p-6 border border-slate-800 hover:border-teal-500 hover:shadow-xl hover:shadow-teal-900/20 transition-all duration-300 group"
      >
        <div class="flex items-start justify-between mb-6">
          <div class="w-14 h-14 bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
            <Star :size="28" />
          </div>
          <div v-if="cat.is_locked" class="bg-slate-800 text-slate-500 p-2 rounded-xl">
            <Lock :size="18" />
          </div>
          <div v-else class="bg-green-950/30 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Active
          </div>
        </div>

        <h3 class="text-xl font-bold text-white mb-2">{{ cat.name }}</h3>
        <p class="text-sm text-slate-400 mb-6">
          Stage: <span class="capitalize font-medium text-slate-300">{{ cat.stage_type }}</span>
        </p>

        <div class="flex items-center justify-end pt-4 border-t border-slate-800">
          <div class="flex items-center gap-1 text-teal-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
            Start Scoring
            <ChevronRight :size="18" />
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCategoryStore } from '@/stores/categories';
import { Star, Lock, ChevronRight, Loader2, AlertCircle } from 'lucide-vue-next';

const categoryStore = useCategoryStore();

onMounted(async () => {
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories();
  }
});
</script>
