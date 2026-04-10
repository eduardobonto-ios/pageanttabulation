<template>
  <div class="pb-20">
    <!-- Debug Info - Always Visible -->
    <div class="bg-slate-800/50 border-b border-slate-700/50 px-4 py-2 mb-4">
      <div class="max-w-[1600px] mx-auto">
        <div class="flex items-center gap-4 text-xs text-slate-400">
          <span>🔍 Debug:</span>
          <span>Loading: {{ loading }}</span>
          <span>Category: {{ category?.name || 'None' }}</span>
          <span>Candidates: {{ displayedCandidates.length }}</span>
          <span>Criteria: {{ criteria.length }}</span>
          <span>Error: {{ candidatesError || 'None' }}</span>
          <span>Route: {{ route.params.key }}</span>
        </div>
      </div>
    </div>

    <!-- Header - Sticky -->
    <div class="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-slate-800/50 -mx-4 md:-mx-8 px-4 md:px-8 py-4 mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-[1600px] mx-auto">
        <div class="flex items-center gap-4">
          <router-link
            to="/judge"
            class="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 hover:bg-teal-500/20 transition-all shrink-0"
          >
            <ChevronLeft :size="20" />
          </router-link>

          <div>
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-6 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
              <h1 class="text-2xl font-black text-white tracking-tight truncate max-w-[300px]">
                {{ category?.name || 'Scoring' }}
              </h1>
            </div>
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Judge: <span class="text-slate-300">{{ authStore.profile?.full_name }}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div
            v-if="category?.is_locked"
            class="bg-amber-950/20 border border-amber-900/50 text-amber-500 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs shadow-lg"
          >
            <Lock :size="16" />
            Locked
          </div>

          <button
            @click="submitAll"
            :disabled="submitting || isSubmitted"
            class="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            <CheckCircle v-if="!submitting" :size="18" />
            <Loader2 v-else class="animate-spin" :size="18" />
            {{ isSubmitted ? 'Finalized' : 'Submit All' }}
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-[1600px] mx-auto px-4">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-32 space-y-6 bg-slate-900/30 rounded-2xl border border-slate-800/50"
      >
        <div class="relative">
          <div class="absolute inset-0 blur-2xl bg-teal-500/20 animate-pulse"></div>
          <Loader2 class="animate-spin text-teal-500 relative" :size="64" />
        </div>
        <p class="text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">
          Synchronizing Data...
        </p>
        <p class="text-slate-500 text-sm">Loading categories, candidates, and criteria...</p>
      </div>

      <!-- Category Not Found State -->
      <div
        v-else-if="!category"
        class="bg-slate-900/50 rounded-2xl border border-amber-900/50 p-8 text-center"
      >
        <div class="w-16 h-16 bg-amber-950 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4 border border-amber-900">
          <AlertCircle :size="32" />
        </div>
        <h3 class="text-xl font-black text-white mb-2 tracking-tight">Category Not Selected</h3>
        <p class="text-slate-500 text-sm leading-relaxed mb-4">
          Please select a valid category from the sidebar to begin scoring.
        </p>
        <div class="text-xs text-slate-600 mb-4">
          <p>Route param: {{ route.params.key }}</p>
          <p>Available categories: {{ categoryStore.categories.length }}</p>
        </div>
        <router-link
          to="/judge"
          class="inline-flex items-center gap-2 text-teal-500 hover:text-teal-400 font-bold transition-colors"
        >
          <ChevronLeft :size="16" />
          Return to Dashboard
        </router-link>
      </div>

      <!-- Error State -->
      <div
        v-else-if="candidatesError"
        class="bg-slate-900/50 rounded-2xl border border-red-900/50 p-8 text-center"
      >
        <div class="w-16 h-16 bg-red-950 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-4 border border-red-900">
          <AlertCircle :size="32" />
        </div>
        <h3 class="text-xl font-black text-white mb-2 tracking-tight">Data Fetching Error</h3>
        <p class="text-slate-500 text-sm leading-relaxed mb-4">{{ candidatesError }}</p>
        <button
          @click="retryFetch"
          class="inline-flex items-center gap-2 text-teal-500 hover:text-teal-400 font-bold transition-colors"
        >
          <Loader2 v-if="loading" class="animate-spin" :size="16" />
          Retry Connection
        </button>
      </div>

      <!-- Main Content Area -->
      <div v-else>
        <!-- Candidates Section -->
        <div
          v-if="displayedCandidates.length === 0"
          class="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-8 text-center mb-8"
        >
          <div class="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-800 mx-auto mb-4 border border-slate-900">
            <Users :size="32" />
          </div>
          <h3 class="text-xl font-black text-white mb-2 tracking-tight">Waiting for Candidates</h3>
          <p class="text-slate-500 text-sm leading-relaxed">
            The tabulation center is currently preparing the candidate roster. Please stand by.
          </p>
        </div>

        <!-- Scoring Interface -->
        <div v-else class="space-y-6">
          <!-- Criteria Status -->
          <div v-if="criteriaLoading" class="bg-slate-800/30 rounded-xl p-4 text-center">
            <Loader2 class="animate-spin text-teal-500 mx-auto mb-2" :size="24" />
            <p class="text-slate-400 text-sm">Loading criteria...</p>
          </div>

          <div v-else-if="criteria.length === 0" class="bg-slate-800/30 rounded-xl p-4 text-center">
            <AlertCircle class="text-slate-600 mx-auto mb-2" :size="24" />
            <p class="text-slate-500 text-sm">No criteria found for this category</p>
            <p class="text-slate-600 text-xs mt-1">Category ID: {{ category?.id }}</p>
          </div>

          <!-- Candidate Cards Grid -->
          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
          >
            <div
              v-for="candidate in displayedCandidates"
              :key="candidate.id"
              class="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden shadow-xl hover:shadow-amber-500/10 transition-all duration-500 group flex flex-col relative"
            >
              <!-- Candidate Photo Section -->
              <div class="relative h-32 overflow-hidden">
                <img
                  :src="candidate.photo_url || candidate.image_url || `https://picsum.photos/seed/${candidate.id}/600/800`"
                  :alt="candidate.name"
                  class="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                  referrerpolicy="no-referrer"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>

                <!-- Candidate Number Badge -->
                <div class="absolute top-3 left-3">
                  <div class="bg-amber-500 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-xl shadow-amber-500/40 border border-amber-400/30">
                    {{ candidate.number }}
                  </div>
                </div>

                <!-- Name Overlay -->
                <div class="absolute bottom-3 left-3 right-3">
                  <h3 class="text-lg font-black text-white leading-tight drop-shadow-xl tracking-tight truncate">
                    {{ candidate.name }}
                  </h3>
                </div>
              </div>

              <!-- Scoring Section -->
              <div class="p-3 flex-1 flex flex-col">
                <div class="space-y-3 flex-1">
                  <div
                    v-if="criteriaLoading"
                    class="flex flex-col items-center justify-center py-8 space-y-3"
                  >
                    <Loader2 class="animate-spin text-teal-500/30" :size="24" />
                    <p class="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                      Loading...
                    </p>
                  </div>

                  <template v-else-if="candidateCriteria[candidate.id]?.length > 0">
                    <div
                      v-for="criterion in candidateCriteria[candidate.id]"
                      :key="criterion.criterion_id"
                      class="space-y-1.5"
                    >
                      <div class="flex justify-between items-center px-0.5">
                        <label class="text-[10px] font-extrabold text-white uppercase tracking-wider truncate max-w-[60%]">
                          {{ criterion.name }}
                        </label>
                        <span class="text-[8px] font-black text-teal-500/80 bg-teal-500/5 px-2 py-0.5 rounded-full border border-teal-500/10">
                          Max: {{ criterion.max_score }}
                        </span>
                      </div>

                      <div class="relative group/input">
                        <select
                          v-model.number="criterion.selected_score"
                          @change="saveScore(candidate.id, criterion.criterion_id, criterion.selected_score)"
                          :disabled="category?.is_locked || isSubmitted"
                          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-black focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all disabled:opacity-30 text-sm shadow-inner group-hover/input:border-slate-700 appearance-none cursor-pointer"
                        >
                          <option
                            v-for="val in Array.from({ length: criterion.max_score + 1 }, (_, i) => i)"
                            :key="val"
                            :value="val"
                          >
                            {{ val }}
                          </option>
                        </select>

                        <div class="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                          <ChevronLeft class="-rotate-90" :size="12" />
                        </div>

                        <div
                          v-if="savingStates[`${candidate.id}-${criterion.criterion_id}`]"
                          class="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Loader2 class="animate-spin text-teal-500" :size="16" />
                        </div>

                        <div
                          v-else-if="savedStates[`${candidate.id}-${criterion.criterion_id}`]"
                          class="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <div class="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                            <Check class="text-green-500" :size="12" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>

                  <div
                    v-else
                    class="flex flex-col items-center justify-center py-8 text-slate-600 text-center space-y-2"
                  >
                    <AlertCircle :size="24" class="opacity-20" />
                    <p class="text-[9px] font-bold tracking-wide uppercase opacity-40">No criteria</p>
                  </div>
                </div>

                <!-- Total Score Footer -->
                <div class="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between">
                  <div>
                    <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Total
                    </p>
                    <div class="flex items-baseline gap-0.5">
                      <span class="text-2xl font-black text-white tracking-tighter">
                        {{ Math.round(calculateTotal(candidate.id)) }}
                      </span>
                    </div>
                  </div>

                  <div class="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                    <Trophy class="text-amber-500/70 group-hover:text-amber-500 transition-colors" :size="16" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- /Candidate Cards Grid -->
        </div>
        <!-- /Scoring Interface -->
      </div>
      <!-- /Main Content Area -->
    </div>

    <!-- Success Toast -->
    <transition name="slide-up">
      <div
        v-if="successMessage"
        class="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
      >
        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <Check :size="18" />
        </div>
        <p class="font-bold">{{ successMessage }}</p>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCategoryStore } from '@/stores/categories';
import { useScoreStore, loadCriteria, loadScores, saveCriterionScore } from '@/stores/scores';
import { supabase } from '@/lib/supabase';
import type { Candidate, Criterion, CriterionWithScore } from '@/types';
import {
  ChevronLeft,
  Lock,
  CheckCircle,
  Loader2,
  Users,
  Check,
  AlertCircle,
  Trophy
} from 'lucide-vue-next';

const route = useRoute();
const authStore = useAuthStore();
const categoryStore = useCategoryStore();
const scoreStore = useScoreStore();

const allCandidates = ref<Candidate[]>([]);
const criteria = ref<Criterion[]>([]);
const loading = ref(true);
const candidatesError = ref<string | null>(null);
const criteriaLoading = ref(false);
const submitting = ref(false);
const isSubmitted = ref(false);
const successMessage = ref('');

const candidateCriteria = ref<Record<string, CriterionWithScore[]>>({});
const savingStates = ref<Record<string, boolean>>({});
const savedStates = ref<Record<string, boolean>>({});
let scoresSubscription: { unsubscribe?: () => void } | null = null;

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

  console.log('Route Params:', route.params);
  console.log('Parsed Category ID:', idAsNumber);
  console.log('Loaded Categories:', categoryStore.categories);

  const result = categoryStore.categories.find(c =>
    c.category_key === key ||
    c.id === key ||
    (!isNaN(idAsNumber) && Number(c.id) === idAsNumber)
  );

  console.log('Selected Category Result:', result);
  return result;
});

const isTop7Category = computed(() => {
  const name = (category.value?.name || '').toUpperCase().trim();
  return name === 'TOP 7' || name === 'TOP7';
});

const top7SourceCategories = computed(() => {
  return categoryStore.categories.filter(cat => TOP7_WEIGHTS[(cat.name || '').toUpperCase().trim()] !== undefined);
});

const displayedCandidates = computed(() => {
  if (!isTop7Category.value) {
    return allCandidates.value;
  }

  const ranked = allCandidates.value.map(candidate => {
    let weightedTotal = 0;

    top7SourceCategories.value.forEach((sourceCategory) => {
      const judgeTotalsMap = scoreStore.getCandidateCategoryJudgeTotals(candidate.id, sourceCategory.id);
      const judgeTotals = Object.values(judgeTotalsMap);
      const categoryAverage = judgeTotals.length
        ? judgeTotals.reduce((sum, value) => sum + value, 0) / judgeTotals.length
        : 0;
      const weight = TOP7_WEIGHTS[(sourceCategory.name || '').toUpperCase().trim()] || 0;

      weightedTotal += categoryAverage * weight;
    });

    return {
      ...candidate,
      weightedTotal
    };
  });

  return ranked
    .filter(candidate => candidate.weightedTotal > 0)
    .sort((a, b) => b.weightedTotal - a.weightedTotal)
    .slice(0, 7)
    .sort((a, b) => a.number - b.number)
    .map(({ weightedTotal, ...candidate }) => candidate);
});

const fetchCriteria = async () => {
  if (!category.value) return;
  criteriaLoading.value = true;
  try {
    console.log('Fetching criteria for categoryId:', category.value.id, 'type:', typeof category.value.id);
    criteria.value = await loadCriteria(category.value.id);
    console.log('Final criteria array used by UI:', criteria.value);
  } catch (error: any) {
    console.error('Fetch criteria error:', error);
  } finally {
    criteriaLoading.value = false;
  }
};

const loadCandidateScores = async () => {
  if (!category.value || !authStore.profile) return;

  try {
    const candidateIds = displayedCandidates.value.map(c => c.id);
    const scores = await loadScores(authStore.profile.id, candidateIds, category.value.id);

    displayedCandidates.value.forEach(candidate => {
      const candidateScores = criteria.value.map((criterion) => {
        const existingScore = scores.find(s =>
          String(s.candidate_id) === String(candidate.id) &&
          String(s.criterion_id) === String(criterion.id)
        );

        return {
          criterion_id: String(criterion.id), // keep as string to match your type
          name: criterion.name,
          max_score: Number(criterion.max_score),
          selected_score: existingScore ? Number(existingScore.score_value) : 0
        };
      });

      console.log('CANDIDATE CRITERIA MAP:', candidate.id, candidateScores);

      candidateCriteria.value[candidate.id] = candidateScores;
    });

    const activeCandidateIds = new Set(candidateIds);
    Object.keys(candidateCriteria.value).forEach((candidateId) => {
      if (!activeCandidateIds.has(candidateId)) {
        delete candidateCriteria.value[candidateId];
      }
    });
  } catch (error: any) {
    console.error('Error loading candidate scores:', error);
  }
};

const fetchCandidates = async () => {
  candidatesError.value = null;
  const { data, error } = await supabase
    .from('candidates')
    .select('*');

  console.log('Candidates query result:', data);
  console.log('Candidates query error:', error);
  console.log('Rendered candidates length:', data?.length || 0);

  if (error) {
    console.error('Fetch candidates error:', error);
    candidatesError.value = error.message;
    return;
  }

  allCandidates.value = (data || [])
    .map((row: any) => ({
      ...row,
      id: String(row.id),
      name: row.name ?? row.candidate_name ?? 'Candidate',
      number: Number(row.number ?? row.candidate_number ?? 0),
      country_name: row.country_name ?? row.country ?? '',
      photo_url: row.photo_url ?? row.image_url ?? '',
      image_url: row.image_url ?? row.photo_url ?? '',
      is_top14: Boolean(row.is_top14),
      is_top5: Boolean(row.is_top5)
    }))
    .sort((a: Candidate, b: Candidate) => a.number - b.number);
};

const retryFetch = async () => {
  loading.value = true;
  await Promise.all([
    categoryStore.fetchCategories(),
    fetchCandidates(),
    scoreStore.fetchScores()
  ]);

  if (category.value) {
    await Promise.all([
      checkSubmissionStatus(),
      fetchCriteria()
    ]);
    await loadCandidateScores();
  }

  loading.value = false;
};

const saveScore = async (candidateId: string, criterionId: string | number, scoreValue: number) => {
  console.log('SAVE SCORE CLICKED:', {
    candidateId,
    criterionId,
    scoreValue,
    categoryId: category.value?.id,
    judgeId: authStore.profile?.id
  });

  if (!category.value || category.value?.is_locked || isSubmitted.value || !authStore.profile) {
    console.warn('SAVE BLOCKED:', {
      hasCategory: !!category.value,
      isLocked: category.value?.is_locked,
      isSubmitted: isSubmitted.value,
      hasProfile: !!authStore.profile
    });
    return;
  }

  const numericScoreValue = Number(scoreValue);
  const categoryId = String(category.value.id);
  const criterionIdString = String(criterionId);
  const key = `${candidateId}-${criterionIdString}`;
  savingStates.value[key] = true;

  try {
    const result = await saveCriterionScore({
      judge_id: authStore.profile.id,
      candidate_id: candidateId,
      category_id: categoryId,
      criterion_id: criterionIdString,
      score_value: numericScoreValue
    });

    console.log('SAVE SCORE SUCCESS:', result);

    const candidateCriteriaList = candidateCriteria.value[candidateId];
    if (candidateCriteriaList) {
      const criterionIndex = candidateCriteriaList.findIndex(
        c => c.criterion_id === criterionIdString
      );

      if (criterionIndex >= 0) {
        candidateCriteriaList[criterionIndex].selected_score = numericScoreValue;
      }
    }

    savedStates.value[key] = true;
    setTimeout(() => {
      savedStates.value[key] = false;
    }, 2000);
  } catch (error: any) {
    console.error('FAILED TO SAVE CRITERION SCORE:', error);
    alert(`Failed to save score.\nCriterion ID: ${criterionIdString}\nError: ${error?.message || error}`);
  } finally {
    savingStates.value[key] = false;
  }
};

const calculateTotal = (candidateId: string) => {
  const candidateScores = candidateCriteria.value[candidateId];
  if (!candidateScores) return 0;
  return candidateScores.reduce((total, criterion) => total + criterion.selected_score, 0);
};

const submitAll = async () => {
  if (!category.value || isSubmitted.value) return;

  submitting.value = true;
  try {
    const { error: submissionError } = await supabase
      .from('category_submissions')
      .upsert({
        judge_id: authStore.profile!.id,
        category_id: category.value!.id,
        is_submitted: true,
        submitted_at: new Date().toISOString()
      });

    if (submissionError) throw submissionError;

    isSubmitted.value = true;
    showSuccess('Scores submitted successfully!');
  } catch (error: any) {
    const message = error?.message || String(error);
    if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('404')) {
      console.warn('Submission table missing or unavailable, continuing without submission record:', message);
      isSubmitted.value = false;
      showSuccess('Scores saved, but final submission record could not be created.');
    } else {
      console.error('Failed to submit scores:', error);
    }
  } finally {
    submitting.value = false;
  }
};

const showSuccess = (msg: string) => {
  successMessage.value = msg;
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

const checkSubmissionStatus = async () => {
  if (!category.value || !authStore.profile) return;

  try {
    const { data, error } = await supabase
      .from('category_submissions')
      .select('*')
      .eq('judge_id', authStore.profile.id)
      .eq('category_id', category.value.id)
      .single();

    if (error) {
      console.warn('Category submission check skipped:', error.message || error);
      return;
    }

    if (data) {
      isSubmitted.value = data.is_submitted;
    }
  } catch (error: any) {
    console.warn('Category submission check failed:', error.message || error);
  }
};

onMounted(async () => {
  console.log('🎯 CategoryScoring onMounted - Starting data load');
  loading.value = true;

  await Promise.all([
    categoryStore.fetchCategories(),
    fetchCandidates(),
    scoreStore.fetchScores()
  ]);

  console.log('📊 CategoryScoring - Initial data loaded:', {
    categories: categoryStore.categories.length,
    candidates: displayedCandidates.value.length,
    profile: authStore.profile?.id
  });

  if (category.value) {
    console.log('🎯 CategoryScoring - Loading category-specific data for:', category.value.id);
    await Promise.all([
      checkSubmissionStatus(),
      fetchCriteria()
    ]);
    await loadCandidateScores();
    console.log('✅ CategoryScoring - All data loaded successfully');
  } else {
    console.log('⚠️ CategoryScoring - No category found for route:', route.params.key);
  }

  loading.value = false;
  console.log('🏁 CategoryScoring onMounted - Complete');

  scoresSubscription = scoreStore.subscribeToScores();
});

watch(() => route.params.key, async () => {
  console.log('🔄 CategoryScoring route change detected:', route.params.key);
  loading.value = true;

  if (category.value) {
    console.log('🎯 CategoryScoring - Reloading data for category:', category.value.id);
    await Promise.all([
      checkSubmissionStatus(),
      fetchCriteria()
    ]);
    await loadCandidateScores();
    console.log('✅ CategoryScoring - Route change data reloaded');
  } else {
    console.log('⚠️ CategoryScoring - No category found for new route');
  }

  loading.value = false;
});

watch(
  () => displayedCandidates.value.map(candidate => candidate.id).join('|'),
  async (newIds, oldIds) => {
    if (newIds === oldIds) return;
    if (!category.value || !authStore.profile || criteriaLoading.value || criteria.value.length === 0) return;
    await loadCandidateScores();
  }
);

onUnmounted(() => {
  scoresSubscription?.unsubscribe?.();
  scoresSubscription = null;
});
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
