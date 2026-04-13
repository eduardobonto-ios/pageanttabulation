<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <router-link to="/admin" class="text-teal-600 hover:text-teal-700 font-bold text-sm flex items-center gap-1 mb-2">
          <ChevronLeft :size="18" />
          Back to Dashboard
        </router-link>
        <h1 class="text-3xl font-bold text-slate-800">{{ pageTitle }}</h1>
        <p class="text-slate-500 mt-1">{{ pageSubtitle }}</p>
      </div>

      <div class="flex gap-3 flex-wrap">
        <button
          v-if="!isTop7Category && winnerCard"
          @click="printWinner"
          class="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-100 hover:opacity-95 transition-all"
        >
          <Printer :size="18" />
          Print Winner
        </button>
        <button
          @click="exportToCSV"
          class="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
        >
          <Download :size="18" />
          Export CSV
        </button>
        <button
          v-if="!isTop7Category"
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

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2 class="animate-spin text-teal-500" :size="48" />
      <p class="text-slate-500 font-medium text-center">Calculating results and rankings...</p>
    </div>

    <div v-else-if="winnerCard && !isTop7Category" class="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-br from-[#fff9ed] via-white to-[#fef3c7] shadow-xl shadow-amber-100/60 p-8">
      <div class="absolute top-0 right-0 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-56 h-56 bg-orange-200/20 rounded-full blur-3xl"></div>

      <div class="relative flex flex-col lg:flex-row items-center gap-8">
        <div class="shrink-0">
          <div class="w-52 h-64 rounded-[1.75rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100">
            <img
              v-if="winnerCard.candidateImage"
              :src="winnerCard.candidateImage"
              :alt="winnerCard.candidate.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-slate-500 text-6xl font-black">
              {{ winnerCard.candidate.number }}
            </div>
          </div>
        </div>

        <div class="flex-1 text-center lg:text-left space-y-4">
          <div class="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.25em]">
            <Crown :size="16" />
            Winner
          </div>

          <div>
            <p class="text-sm font-bold uppercase tracking-[0.35em] text-amber-700">{{ category?.name }}</p>
            <h2 class="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">{{ winnerCard.candidate.name }}</h2>
            <p class="text-lg text-slate-600 mt-2">Candidate #{{ winnerCard.candidate.number }}</p>
          </div>

          <div class="grid sm:grid-cols-3 gap-4 pt-2">
            <div class="rounded-2xl bg-white/90 border border-amber-100 px-5 py-4 shadow-sm">
              <p class="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">Rank</p>
              <p class="text-3xl font-black text-slate-900">#1</p>
            </div>
            <div class="rounded-2xl bg-white/90 border border-amber-100 px-5 py-4 shadow-sm">
              <p class="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">Total Score</p>
              <p class="text-3xl font-black text-slate-900">{{ winnerCard.totalScore.toFixed(2) }}</p>
            </div>
            <div class="rounded-2xl bg-white/90 border border-amber-100 px-5 py-4 shadow-sm">
              <p class="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">Average</p>
              <p class="text-3xl font-black text-teal-600">{{ winnerCard.averageScore.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading" class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rank</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                {{ isTop7Category ? 'Weighted Score' : 'Total Score' }}
              </th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                {{ isTop7Category ? 'Composite %' : 'Average Score' }}
              </th>
              <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                {{ isTop7Category ? 'Formula Breakdown' : 'Status' }}
              </th>
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
                  <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800 font-bold border border-slate-200 overflow-hidden">
                    <img
                      v-if="getCandidateImage(result.candidate)"
                      :src="getCandidateImage(result.candidate)"
                      :alt="result.candidate.name"
                      class="w-full h-full object-cover"
                    />
                    <span v-else>{{ result.candidate.number }}</span>
                  </div>
                  <div>
                    <p class="font-bold text-slate-800">{{ result.candidate.name }}</p>
                    <p class="text-xs text-slate-500">Candidate #{{ result.candidate.number }}</p>
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
                <template v-if="isTop7Category">
                  <div class="text-xs text-slate-500 leading-5 max-w-[320px] ml-auto">
                    <span
                      v-for="part in result.breakdown || []"
                      :key="part"
                      class="inline-block mr-2"
                    >{{ part }}</span>
                  </div>
                </template>
                <template v-else>
                  <div class="flex justify-end gap-1">
                    <div
                      v-for="judge in judges"
                      :key="judge.id"
                      class="w-2 h-2 rounded-full"
                      :class="[hasJudgeScored(judge.id, result.candidate.id) ? 'bg-teal-500' : 'bg-slate-200']"
                      :title="judge.full_name"
                    ></div>
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="rankedResults.length === 0" class="p-12 text-center">
        <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
          <Trophy :size="32" />
        </div>
        <h4 class="font-bold text-slate-800">No results found</h4>
        <p class="text-sm text-slate-500">Scores will appear here as judges submit them.</p>
      </div>
    </div>

    <div v-if="!loading && !isTop7Category" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
import type { Candidate } from '@/types';
import {
  ChevronLeft,
  Download,
  Lock,
  Unlock,
  Loader2,
  Trophy,
  Check,
  Printer,
  Crown
} from 'lucide-vue-next';

const route = useRoute();
const categoryStore = useCategoryStore();
const candidateStore = useCandidateStore();
const scoreStore = useScoreStore();

const loading = ref(true);
const judges = ref<any[]>([]);
const submissions = ref<any[]>([]);

const TOP7_WEIGHTS: Record<string, number> = {
  'FILIPINIANA ATTIRE': 0.15,
  'PRODUCTION NUMBER': 0.15,
  'BEST IN SWIMSUIT': 0.2,
  'LONG GOWN': 0.2,
  'QUESTION AND ANSWER': 0.3
};

const category = computed(() => {
  const key = route.params.key as string;
  const idAsNumber = Number(key);
  return categoryStore.categories.find(c =>
    c.category_key === key ||
    c.id === key ||
    (!isNaN(idAsNumber) && Number(c.id) === idAsNumber)
  );
});

const isTop7Category = computed(() => {
  const name = (category.value?.name || '').toUpperCase().trim();
  return name === 'TOP 7' || name === 'TOP7';
});

const scoringCategories = computed(() => {
  return categoryStore.categories.filter(cat => TOP7_WEIGHTS[(cat.name || '').toUpperCase().trim()] !== undefined);
});

const candidates = computed(() => {
  if (isTop7Category.value) return candidateStore.candidates;
  if (!category.value) return [];
  if (category.value.stage_type === 'top14') return candidateStore.candidates.filter(c => c.is_top14);
  if (category.value.stage_type === 'top5') return candidateStore.candidates.filter(c => c.is_top5);
  return candidateStore.candidates;
});

const rankedResults = computed(() => {
  if (!category.value) return [];

  if (isTop7Category.value) {
    const results = candidateStore.candidates.map(cand => {
      let weightedTotal = 0;
      let rawTotal = 0;
      const breakdown: string[] = [];

      scoringCategories.value.forEach(cat => {
        const judgeTotalsMap = scoreStore.getCandidateCategoryJudgeTotals(cand.id, cat.id);
        const judgeTotals = Object.values(judgeTotalsMap);
        const categoryAverage = judgeTotals.length ? judgeTotals.reduce((acc, val) => acc + val, 0) / judgeTotals.length : 0;
        const weight = TOP7_WEIGHTS[(cat.name || '').toUpperCase().trim()] || 0;
        const weighted = categoryAverage * weight;

        rawTotal += categoryAverage;
        weightedTotal += weighted;
        breakdown.push(`${cat.name}: ${categoryAverage.toFixed(2)} × ${(weight * 100).toFixed(0)}% = ${weighted.toFixed(2)}`);
      });

      return {
        candidate: cand,
        totalScore: weightedTotal,
        averageScore: weightedTotal,
        rawTotal,
        breakdown
      };
    });

    return results
      .filter(result => result.totalScore > 0)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 7);
  }

  const results = candidates.value.map(cand => {
    const judgeTotalsMap = scoreStore.getCandidateCategoryJudgeTotals(cand.id, category.value!.id);
    const judgeTotals = Object.values(judgeTotalsMap);
    const totalScore = judgeTotals.reduce((acc, val) => acc + val, 0);
    const averageScore = judgeTotals.length > 0 ? totalScore / judgeTotals.length : 0;

    return {
      candidate: cand,
      totalScore,
      averageScore,
      breakdown: [] as string[]
    };
  });

  return results.sort((a, b) => b.averageScore - a.averageScore);
});

const winnerCard = computed(() => {
  const winner = rankedResults.value[0];
  if (!winner) return null;
  return {
    ...winner,
    candidateImage: getCandidateImage(winner.candidate)
  };
});

const pageTitle = computed(() => {
  if (isTop7Category.value) return 'Top 7 Ranking';
  return category.value?.name || 'Results';
});

const pageSubtitle = computed(() => {
  if (isTop7Category.value) {
    return 'Weighted overall ranking based on Filipiniana Attire 15%, Production Number 15%, Best in Swimsuit 20%, Long Gown 20%, and Question and Answer 30%.';
  }
  return `Stage: ${category.value?.stage_type || 'main'}`;
});

const getCandidateImage = (candidate: Candidate) => candidate.photo_url || candidate.image_url || '';

const hasJudgeScored = (judgeId: string, candidateId: string) => {
  if (!category.value) return false;
  return scoreStore.getJudgeCandidateCategoryTotal(judgeId, candidateId, category.value.id) > 0;
};

const isJudgeSubmitted = (judgeId: string) => {
  return submissions.value.some(s => s.judge_id === judgeId && s.category_id === category.value?.id && s.is_submitted);
};

const toggleLock = async () => {
  if (!category.value || isTop7Category.value) return;
  await categoryStore.updateCategoryStatus(category.value.id, { is_locked: !category.value.is_locked });
};

const exportToCSV = () => {
  const rows = rankedResults.value.map((result, index) => ({
    rank: index + 1,
    number: result.candidate.number,
    candidate: result.candidate.name,
    total_score: result.totalScore.toFixed(2),
    average_score: result.averageScore.toFixed(2),
    breakdown: (result.breakdown || []).join(' | ')
  }));

  const header = ['Rank', 'Candidate Number', 'Candidate Name', 'Total Score', 'Average/Weighted Score', 'Breakdown'];
  const csv = [
    header.join(','),
    ...rows.map(row => [
      row.rank,
      row.number,
      `"${row.candidate.replace(/"/g, '""')}"`,
      row.total_score,
      row.average_score,
      `"${row.breakdown.replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${(pageTitle.value || 'results').replace(/\s+/g, '-').toLowerCase()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const printWinner = () => {
  if (!winnerCard.value || !category.value) return;

  const printWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!printWindow) return;

  const imageHtml = winnerCard.value.candidateImage
    ? `<img src="${winnerCard.value.candidateImage}" alt="${winnerCard.value.candidate.name}" class="candidate-image" />`
    : `<div class="candidate-image placeholder">${winnerCard.value.candidate.number}</div>`;

  printWindow.document.write(`
    <html>
      <head>
        <title>${category.value.name} Winner</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            background: linear-gradient(135deg, #fff7ed 0%, #ffffff 55%, #fef3c7 100%);
            color: #0f172a;
          }
          .page {
            min-height: 100vh;
            padding: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .card {
            width: 100%;
            max-width: 1100px;
            background: rgba(255,255,255,0.94);
            border: 1px solid #fde68a;
            border-radius: 36px;
            box-shadow: 0 25px 70px rgba(245, 158, 11, 0.18);
            overflow: hidden;
            position: relative;
          }
          .card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at top right, rgba(251,191,36,0.18), transparent 30%),
                        radial-gradient(circle at bottom left, rgba(249,115,22,0.12), transparent 28%);
            pointer-events: none;
          }
          .content {
            position: relative;
            display: grid;
            grid-template-columns: 360px 1fr;
            gap: 36px;
            padding: 42px;
            align-items: center;
          }
          .photo-shell {
            background: #fff;
            border-radius: 30px;
            padding: 14px;
            box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
          }
          .candidate-image {
            width: 100%;
            height: 460px;
            object-fit: cover;
            border-radius: 24px;
            display: block;
            background: linear-gradient(135deg, #e2e8f0, #f8fafc);
          }
          .candidate-image.placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 110px;
            font-weight: 900;
            color: #64748b;
          }
          .eyebrow {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b, #ea580c);
            color: white;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.34em;
            text-transform: uppercase;
            padding: 10px 18px;
            border-radius: 999px;
            margin-bottom: 18px;
          }
          .category {
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            color: #b45309;
            margin-bottom: 10px;
          }
          .name {
            font-size: 58px;
            line-height: 1;
            font-weight: 900;
            margin: 0 0 14px;
          }
          .number {
            font-size: 24px;
            color: #475569;
            margin-bottom: 28px;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }
          .stat {
            background: rgba(255,255,255,0.92);
            border: 1px solid #fde68a;
            border-radius: 22px;
            padding: 18px 20px;
          }
          .stat-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.22em;
            color: #94a3b8;
            font-weight: 800;
            margin-bottom: 10px;
          }
          .stat-value {
            font-size: 36px;
            font-weight: 900;
            color: #0f172a;
          }
          .footer {
            margin-top: 26px;
            font-size: 14px;
            color: #64748b;
            font-weight: 600;
          }
          @media print {
            body { background: white; }
            .page { padding: 0; }
            .card { box-shadow: none; border-color: #fcd34d; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="card">
            <div class="content">
              <div class="photo-shell">${imageHtml}</div>
              <div>
                <div class="eyebrow">Official Winner</div>
                <div class="category">${category.value.name}</div>
                <h1 class="name">${winnerCard.value.candidate.name}</h1>
                <div class="number">Candidate #${winnerCard.value.candidate.number}</div>
                <div class="stats">
                  <div class="stat">
                    <div class="stat-label">Rank</div>
                    <div class="stat-value">#1</div>
                  </div>
                  <div class="stat">
                    <div class="stat-label">Total Score</div>
                    <div class="stat-value">${winnerCard.value.totalScore.toFixed(2)}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-label">Average Score</div>
                    <div class="stat-value">${winnerCard.value.averageScore.toFixed(2)}</div>
                  </div>
                </div>
                <div class="footer">Generated from the pageant tabulation admin results page.</div>
              </div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function () {
            window.print();
          };
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

const loadAdminData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      categoryStore.fetchCategories(),
      candidateStore.fetchCandidates(),
      scoreStore.fetchScores(),
      loadJudges(),
      loadSubmissions()
    ]);
  } finally {
    loading.value = false;
  }
};

const loadJudges = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'judge')
    .order('full_name', { ascending: true });

  if (error) throw error;
  judges.value = data || [];
};

const loadSubmissions = async () => {
  const { data, error } = await supabase
    .from('category_submissions')
    .select('*');

  if (error && error.code !== 'PGRST205') {
    throw error;
  }

  submissions.value = data || [];
};

onMounted(async () => {
  await loadAdminData();
});

watch(() => route.params.key, async () => {
  await loadAdminData();
});
</script>
