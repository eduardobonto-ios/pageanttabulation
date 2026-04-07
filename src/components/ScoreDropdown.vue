<template>
  <div class="space-y-1">
    <label class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{{ label }} ({{ weight }}%)</label>
    <div class="relative">
      <select
        :value="modelValue"
        @change="$emit('update:modelValue', Number(($event.target as HTMLSelectElement).value))"
        class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none appearance-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        :disabled="disabled"
      >
        <option v-for="n in weight + 1" :key="n-1" :value="n-1">
          {{ n-1 }}
        </option>
      </select>
      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown :size="18" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';

defineProps<{
  label: string;
  weight: number;
  modelValue: number;
  disabled?: boolean;
}>();

defineEmits(['update:modelValue']);
</script>
