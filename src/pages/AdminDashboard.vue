<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p class="text-slate-400 mt-1">Monitor real-time scoring progress and manage categories.</p>
      </div>
      <div class="flex gap-3">
        <button class="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">
          <Download :size="18" />
          Export Results
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.label" class="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div :class="[stat.color, 'p-3 rounded-2xl text-white shadow-lg shadow-opacity-20']">
            <component :is="stat.icon" :size="24" />
          </div>
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ stat.trend }}</span>
        </div>
        <h3 class="text-2xl font-bold text-white">{{ stat.value }}</h3>
        <p class="text-sm font-medium text-slate-400">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Results Overview Table -->
    <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-800 flex items-center justify-between">
        <h3 class="font-bold text-white">Overall Rankings (All Categories)</h3>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-500 uppercase">Sort by:</span>
          <select v-model="sortBy" class="text-sm font-bold text-teal-400 bg-transparent outline-none cursor-pointer">
            <option value="total">Total Score</option>
            <option value="average">Average Score</option>
          </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-950/50 border-b border-slate-800">
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Name</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Total Score</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Average Score</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Progress</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr v-for="(result, index) in overallRankings" :key="result.candidate.id" class="hover:bg-slate-800/50 transition-colors">
              <td class="px-6 py-4">
                <span class="font-black text-slate-600">{{ index + 1 }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center text-white font-bold text-xs border border-slate-800">
                    {{ result.candidate.number }}
                  </div>
                  <span class="font-bold text-white">{{ result.candidate.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="font-black text-white">{{ result.totalScore.toFixed(2) }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="font-black text-teal-400">{{ result.averageScore.toFixed(2) }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="w-24 bg-slate-950 h-1.5 rounded-full ml-auto overflow-hidden">
                  <div 
                    class="bg-teal-500 h-full transition-all duration-500" 
                    :style="{ width: `${(result.scoredCategories / categoryStore.categories.length) * 100}%` }"
                  ></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="overallRankings.length === 0" class="p-12 text-center">
        <p class="text-slate-400">No scoring data available yet.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Category Progress -->
      <div class="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 class="font-bold text-white">Category Status</h3>
          <button class="text-teal-400 text-sm font-bold hover:underline">View All</button>
        </div>
        <div class="divide-y divide-slate-800">
          <div v-for="cat in categoryStore.categories" :key="cat.id" class="p-6 flex items-center justify-between hover:bg-slate-800 transition-colors">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-slate-500">
                <Star :size="20" />
              </div>
              <div>
                <h4 class="font-bold text-white">{{ cat.name }}</h4>
                <p class="text-xs text-slate-500 uppercase tracking-widest font-semibold">{{ cat.stage_type }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-6">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-bold text-white">85%</p>
                <p class="text-xs text-slate-500">Completion</p>
              </div>
              
              <div class="flex items-center gap-2">
                <button 
                  @click="toggleLock(cat)"
                  class="p-2 rounded-lg transition-colors"
                  :class="[cat.is_locked ? 'bg-amber-950/30 text-amber-500' : 'bg-slate-950 text-slate-500 hover:bg-slate-800']"
                >
                  <Lock v-if="cat.is_locked" :size="18" />
                  <Unlock v-else :size="18" />
                </button>
                <router-link 
                  :to="`/admin/results/${cat.category_key}`"
                  class="bg-teal-950/30 text-teal-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-900/40 transition-colors"
                >
                  View Results
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-800">
          <h3 class="font-bold text-white">Live Activity</h3>
        </div>
        <div class="p-6 space-y-6">
          <div v-for="n in 5" :key="n" class="flex gap-4">
            <div class="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center text-slate-400 font-bold text-xs">
              JD
            </div>
            <div class="space-y-1">
              <p class="text-sm text-slate-300">
                <span class="font-bold text-white">Judge {{ n }}</span> submitted scores for 
                <span class="font-bold text-teal-400">Swimsuit</span>
              </p>
              <p class="text-xs text-slate-500">2 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useCategoryStore } from '@/stores/categories';
import { useCandidateStore } from '@/stores/candidates';
import { useScoreStore } from '@/stores/scores';
import { 
  Users, 
  UserCheck, 
  Trophy, 
  Activity, 
  Star, 
  Lock, 
  Unlock, 
  Download,
  ChevronRight
} from 'lucide-vue-next';

const categoryStore = useCategoryStore();
const candidateStore = useCandidateStore();
const scoreStore = useScoreStore();

const sortBy = ref<'total' | 'average'>('total');

const overallRankings = computed(() => {
  const results = candidateStore.candidates.map(cand => {
    const candScores = scoreStore.scores.filter(s => s.candidate_id === cand.id);
    
    // Group scores by category (now each score is already a total)
    const categoryScores: Record<string, number> = {};
    
    candScores.forEach(s => {
      categoryScores[s.category_id] = s.total_score;
    });

    const totalScore = Object.values(categoryScores).reduce((acc, val) => acc + val, 0);
    const scoredCategories = Object.keys(categoryScores).length;
    const averageScore = scoredCategories > 0 ? totalScore / scoredCategories : 0;

    return {
      candidate: cand,
      totalScore,
      averageScore,
      scoredCategories
    };
  });

  return results.sort((a, b) => {
    if (sortBy.value === 'total') return b.totalScore - a.totalScore;
    return b.averageScore - a.averageScore;
  });
});

const stats = computed(() => [
  { label: 'Total Candidates', value: candidateStore.candidates.length, icon: Users, color: 'bg-teal-500', trend: '+0' },
  { label: 'Categories Active', value: categoryStore.categories.filter(c => !c.is_locked).length, icon: Activity, color: 'bg-blue-500', trend: 'Live' },
  { label: 'Categories Done', value: `${categoryStore.categories.filter(c => c.is_locked).length}/${categoryStore.categories.length}`, icon: Trophy, color: 'bg-amber-500', trend: 'Progress' },
  { label: 'Total Scores', value: scoreStore.scores.length, icon: Star, color: 'bg-purple-500', trend: 'Real-time' },
]);

const toggleLock = async (cat: any) => {
  await categoryStore.updateCategoryStatus(cat.id, { is_locked: !cat.is_locked });
};

onMounted(async () => {
  await Promise.all([
    categoryStore.fetchCategories(),
    candidateStore.fetchCandidates(),
    scoreStore.fetchScores()
  ]);
  scoreStore.subscribeToScores();
});
</script>
