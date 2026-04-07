<template>
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
    <div class="aspect-[4/3] relative overflow-hidden bg-slate-100">
      <img 
        :src="candidate.image_url || `https://picsum.photos/seed/${candidate.number}/400/533`" 
        :alt="candidate.name"
        class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
        referrerpolicy="no-referrer"
      />
      <div class="absolute top-3 left-3">
        <div class="bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
          No. {{ candidate.number }}
        </div>
      </div>
      
      <div v-if="candidate.is_top5" class="absolute top-3 right-3">
        <div class="bg-amber-400 text-white p-1.5 rounded-full shadow-lg" title="Top 5 Finalist">
          <Trophy :size="16" />
        </div>
      </div>
      <div v-else-if="candidate.is_top14" class="absolute top-3 right-3">
        <div class="bg-amber-400 text-white p-1.5 rounded-full shadow-lg" title="Top 14 Semi-finalist">
          <Star :size="16" />
        </div>
      </div>
    </div>

    <div class="p-3">
      <h3 class="font-bold text-slate-800 text-sm truncate">{{ candidate.name }}</h3>
      <p class="text-xs text-slate-500 truncate">{{ candidate.country_name }}</p>
      
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Candidate } from '@/types';
import { Trophy, Star } from 'lucide-vue-next';

defineProps<{
  candidate: Candidate;
}>();
</script>
