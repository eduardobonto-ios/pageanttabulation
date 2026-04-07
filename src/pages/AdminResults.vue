<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <router-link to="/admin" class="text-teal-600 hover:text-teal-700 font-bold text-sm flex items-center gap-1 mb-2">
          <ChevronLeft :size="18" />
          Back to Dashboard
        </router-link>
        <h1 class="text-3xl font-bold text-slate-800">{{ category?.name || 'Results' }}</h1>
        <p class="text-slate-500 mt-1">
          Stage: <span class="capitalize font-bold text-slate-700">{{ category?.stage_type }}</span>
        </p>
      </div>
      
      <div class="flex gap-3">
        <button 
          @click="exportToCSV"
          class="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
        >
          <Download :size="18" />
          Export CSV
        </button>
        <button 
          @click="toggleLock"
          class="px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all"
          :class="[category?.is_locked ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
        >
          <Lock v-if="category?.is_locked" :size="18" />
          <Unlock v-else :size="18" />
          {{ category?.is_locked ? 'Unlock Category' : 'Lock Category' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2 class="animate-spin text-teal-500" :size="48" />
      <p class="text-slate-500 font-medium text-center">Calculating results and rankings...</p>
    </div>

    <!-- Results Table -->
    <div v-else class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rank</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Total Score</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Average Score</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr 
              v-for="(result, index) in rankedResults" 
              :key="result.candidate.id"
              class="hover:bg-slate-50/50 transition-colors"
            >
              <td class="px-6 py-5">
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                  :class="[
                    index === 0 ? 'bg-amber-100 text-amber-700' : 
                    index === 1 ? 'bg-slate-100 text-slate-700' : 
                    index === 2 ? 'bg-orange-100 text-orange-700' : 
                    'text-slate-400'
                  ]"
                >
                  {{ index + 1 }}
                </div>
              </td>
              <td class="px-6 py-5">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800 font-bold border border-slate-200">
                    {{ result.candidate.number }}
                  </div>
                  <div>
                    <p class="font-bold text-slate-800">{{ result.candidate.name }}</p>
                    <p class="text-xs text-slate-500">{{ result.candidate.country_name }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-5 text-center">
                <span class="text-lg font-black text-slate-800">{{ result.totalScore.toFixed(2) }}</span>
              </td>
              <td class="px-6 py-5 text-center">
                <span class="text-lg font-black text-teal-600">{{ result.averageScore.toFixed(2) }}</span>
              </td>
              <td class="px-6 py-5 text-right">
                <div class="flex justify-end gap-1">
                  <div 
                    v-for="judge in judges" 
                    :key="judge.id"
                    class="w-2 h-2 rounded-full"
                    :class="[hasJudgeScored(judge.id, result.candidate.id) ? 'bg-teal-500' : 'bg-slate-200']"
                    :title="judge.full_name"
                  ></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Empty State -->
      <div v-if="rankedResults.length === 0" class="p-12 text-center">
        <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
          <Trophy :size="32" />
        </div>
        <h4 class="font-bold text-slate-800">No results found</h4>
        <p class="text-sm text-slate-500">Scores will appear here as judges submit them.</p>
      </div>
    </div>

    <!-- Judge Progress -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="judge in judges" 
        :key="judge.id"
        class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 font-bold">
            {{ judge.full_name.charAt(0) }}
          </div>
          <div>
            <h4 class="font-bold text-slate-800 leading-tight">{{ judge.full_name }}</h4>
            <p class="text-xs text-slate-500">Judge</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div v-if="isJudgeSubmitted(judge.id)" class="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Check :size="14" />
            Submitted
          </div>
          <div v-else class="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Pending
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCategoryStore } from '@/stores/categories';
import { useCandidateStore } from '@/stores/candidates';
import { useScoreStore } from '@/stores/scores';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  Download, 
  Lock, 
  Unlock, 
  Loader2, 
  Trophy,
  Check
} from 'lucide-vue-next';

const route = useRoute();
const categoryStore = useCategoryStore();
const candidateStore = useCandidateStore();
const scoreStore = useScoreStore();

const loading = ref(true);
const judges = ref<any[]>([]);
const submissions = ref<any[]>([]);

const category = computed(() => {
  const key = route.params.key as string;
  const idAsNumber = Number(key);
  return categoryStore.categories.find(c => 
    c.category_key === key || 
    c.id === key ||
    (!isNaN(idAsNumber) && Number(c.id) === idAsNumber)
  );
});

const candidates = computed(() => {
  if (!category.value) return [];
  if (category.value.stage_type === 'top14') return candidateStore.candidates.filter(c => c.is_top14);
  if (category.value.stage_type === 'top5') return candidateStore.candidates.filter(c => c.is_top5);
  return candidateStore.candidates;
});

const rankedResults = computed(() => {
  if (!category.value) return [];
  
  const results = candidates.value.map(cand => {
    const candScores = scoreStore.scores.filter(s => s.candidate_id === cand.id && s.category_id === category.value!.id);
    
    // Since scores are now totals per judge, just collect the total_scores
    const judgeTotals = candScores.map(s => s.total_score);
    
    const totalScore = judgeTotals.reduce((acc, val) => acc + val, 0);
    const averageScore = judgeTotals.length > 0 ? totalScore / judgeTotals.length : 0;

    return {
      candidate: cand,
      totalScore,
      averageScore
    };
  });

  return results.sort((a, b) => b.averageScore - a.averageScore);
});

const hasJudgeScored = (judgeId: string, candidateId: string) => {
  return scoreStore.scores.some(s => 
    s.judge_id === judgeId && 
    s.candidate_id === candidateId && 
    s.category_id === category.value?.id &&
    s.total_score > 0
  );
};

const isJudgeSubmitted = (judgeId: string) => {
  return submissions.value.some(s => s.judge_id === judgeId && s.category_id === category.value?.id && s.is_submitted);
};

const toggleLock = async () => {
  if (!category.value) return;
  await categoryStore.updateCategoryStatus(category.value.id, { is_locked: !category.value.is_locked });
};

const fetchData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      categoryStore.fetchCategories(),
      candidateStore.fetchCandidates(),
      scoreStore.fetchScores(), // Fetch all scores for admin
    ]);

    // Fetch judges
    const { data: judgeData } = await supabase.from('profiles').select('*').eq('role', 'judge');
    judges.value = judgeData || [];

    // Fetch submissions
    const { data: subData } = await supabase.from('category_submissions').select('*');
    submissions.value = subData || [];
  } catch (error) {
    console.error('Error fetching admin data:', error);
  } finally {
    loading.value = false;
  }
};

const exportToCSV = () => {
  if (rankedResults.value.length === 0) return;
  
  const headers = ['Rank', 'Candidate Number', 'Candidate Name', 'Country', 'Total Score', 'Average Score'];
  const rows = rankedResults.value.map((r, i) => [
    i + 1,
    r.candidate.number,
    r.candidate.name,
    r.candidate.country_name,
    r.totalScore.toFixed(2),
    r.averageScore.toFixed(2)
  ]);

  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${category.value?.name}_Results.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(fetchData);

watch(() => route.params.key, fetchData);

// Real-time subscription
let subscription: any;
onMounted(() => {
  subscription = scoreStore.subscribeToScores();
});
</script>
