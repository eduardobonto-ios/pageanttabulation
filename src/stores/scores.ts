import { defineStore } from 'pinia';
import { supabase } from '@/lib/supabase';
import type { Score, Criterion } from '@/types';

// UUID validator
function isUuid(value: unknown) {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function saveCriterionScore(payload: {
  judge_id: string;
  candidate_id: string | number;
  category_id: string | number;
  criterion_id: string | number;
  score_value: number;
}) {
  const cleanPayload = {
    judge_id: String(payload.judge_id),
    candidate_id: String(payload.candidate_id),
    category_id: String(payload.category_id),
    criterion_id: String(payload.criterion_id),
    score_value: Number(payload.score_value),
    updated_at: new Date().toISOString(),
  };

  console.log('NEW saveCriterionScore HIT');
  console.log('SAVE CRITERION SCORE PAYLOAD:', cleanPayload);
  console.log('UPSERT onConflict: judge_id,candidate_id,category_id,criterion_id');

  const { data, error } = await supabase
    .from('scores')
    .upsert(cleanPayload, {
      onConflict: 'judge_id,candidate_id,category_id,criterion_id'
    })
    .select();

  console.log('SAVE CRITERION SCORE RESULT DATA:', data);
  console.log('SAVE CRITERION SCORE RESULT ERROR:', error);

  if (error) {
    throw error;
  }

  return data;
}

export async function loadCriteria(categoryId: string | number) {
  console.log('loadCriteria categoryId:', categoryId, 'type:', typeof categoryId);

  const { data, error } = await supabase
    .from('category_criteria')
    .select('id, category_id, name, max_score, sort_order')
    .eq('category_id', Number(categoryId))
    .order('sort_order', { ascending: true });

  console.log('Supabase criteria query result:', data);
  console.log('Supabase criteria query error:', error);

  if (error) {
    console.error('Error loading criteria:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: String(row.id),
    category_id: String(row.category_id ?? row.category_id),
    name: row.name ?? row.criterion_name,
    max_score: Number(row.max_score ?? row.weight_value ?? 0),
    sort_order: Number(row.sort_order ?? row.display_order ?? 0)
  }));
}

export async function loadScores(judgeId: string, candidateIds: string[], categoryId: string) {
  console.log('LOAD SCORES PARAMS:', { judgeId, candidateIds, categoryId });

  const { data, error } = await supabase
    .from('scores')
    .select('candidate_id, criterion_id, score_value')
    .eq('judge_id', judgeId)
    .in('candidate_id', candidateIds)
    .eq('category_id', categoryId);

  console.log('LOAD SCORES RESULT DATA:', data);
  console.log('LOAD SCORES RESULT ERROR:', error);

  if (error) {
    console.error('Error loading scores:', error);
    throw error;
  }

  return data as { candidate_id: string; criterion_id: string; score_value: number }[];
}

export const useScoreStore = defineStore('scores', {
  state: () => ({
    scores: [] as Score[],
    loading: false
  }),

  getters: {
    getJudgeCandidateCategoryTotal: (state) => {
      return (judgeId: string, candidateId: string, categoryId: string) => {
        return state.scores
          .filter(s =>
            String(s.judge_id) === String(judgeId) &&
            String(s.candidate_id) === String(candidateId) &&
            String(s.category_id) === String(categoryId)
          )
          .reduce((total, s) => total + Number(s.score_value || 0), 0);
      };
    },

    getCandidateCategoryJudgeTotals: (state) => {
      return (candidateId: string, categoryId: string) => {
        const totalsByJudge: Record<string, number> = {};

        state.scores.forEach((s) => {
          if (
            String(s.candidate_id) === String(candidateId) &&
            String(s.category_id) === String(categoryId)
          ) {
            const judgeId = String(s.judge_id);
            totalsByJudge[judgeId] = (totalsByJudge[judgeId] || 0) + Number(s.score_value || 0);
          }
        });

        return totalsByJudge;
      };
    },

    getCandidateCategoryOverallTotal(): (candidateId: string, categoryId: string) => number {
      return (candidateId: string, categoryId: string) => {
        const totalsByJudge = this.getCandidateCategoryJudgeTotals(candidateId, categoryId);
        return Object.values(totalsByJudge).reduce((total, value) => total + value, 0);
      };
    },

    getCandidateAllCategoryTotals(): (candidateId: string) => Record<string, number> {
      return (candidateId: string) => {
        const totalsByCategory: Record<string, number> = {};

        state.scores.forEach((s) => {
          if (String(s.candidate_id) === String(candidateId)) {
            const categoryId = String(s.category_id);
            totalsByCategory[categoryId] = (totalsByCategory[categoryId] || 0) + Number(s.score_value || 0);
          }
        });

        return totalsByCategory;
      };
    }
  },

  actions: {
    async fetchScores(judgeId?: string, categoryId?: string) {
      this.loading = true;
      try {
        let query = supabase.from('scores').select('*');

        if (judgeId) query = query.eq('judge_id', judgeId);
        if (categoryId) query = query.eq('category_id', categoryId);

        const { data, error } = await query;
        if (error) throw error;

        this.scores = data;
      } catch (error) {
        console.error('Error fetching scores:', error);
      } finally {
        this.loading = false;
      }
    },

    async saveCriterionScore(score: {
      judge_id: string;
      candidate_id: string | number;
      category_id: string | number;
      criterion_id: string | number;
      score_value: number;
    }) {
      try {
        const data = await saveCriterionScore(score);
        console.log('Supabase upsert success:', data);

        // Update local state
        const existingIndex = this.scores.findIndex(s =>
          s.judge_id === score.judge_id &&
          s.candidate_id === String(score.candidate_id) &&
          s.category_id === String(score.category_id) &&
          s.criterion_id === String(score.criterion_id)
        );

        if (existingIndex >= 0) {
          this.scores[existingIndex] = data[0];
        } else {
          this.scores.push(data[0]);
        }

        return data[0];
      } catch (error) {
        console.error('Error saving criterion score:', error);
        throw error;
      }
    },

    subscribeToScores() {
      return supabase
        .channel('public:scores')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            this.scores.push(payload.new as Score);
          } else if (payload.eventType === 'UPDATE') {
            const index = this.scores.findIndex(s => s.id === payload.new.id);
            if (index !== -1) this.scores[index] = payload.new as Score;
          } else if (payload.eventType === 'DELETE') {
            this.scores = this.scores.filter(s => s.id !== payload.old.id);
          }
        })
        .subscribe();
    }
  }
});
