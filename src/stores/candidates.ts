import { defineStore } from 'pinia';
import { supabase } from '@/lib/supabase';
import type { Candidate } from '@/types';

export const useCandidateStore = defineStore('candidates', {
  state: () => ({
    candidates: [] as Candidate[],
    loading: false
  }),

  actions: {
    async fetchCandidates() {
      if (this.loading) return;
      this.loading = true;
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('*');

        if (error) {
          console.error('Fetch candidates error:', error);
          throw error;
        }

        const normalized = (data || []).map((row: any) => ({
          ...row,
          id: String(row.id),
          name: row.name ?? row.candidate_name ?? '',
          number: Number(row.number ?? row.candidate_number ?? 0),
          country_name: row.country_name ?? row.country ?? '',
          image_url: row.image_url ?? '',
          photo_url: row.photo_url ?? row.image_url ?? '',
          is_top14: Boolean(row.is_top14),
          is_top5: Boolean(row.is_top5)
        }));

        normalized.sort((a, b) => a.number - b.number);

        console.log('Fetched candidates:', normalized);
        this.candidates = normalized as Candidate[];
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        this.loading = false;
      }
    },

    async updateCandidate(id: string, updates: Partial<Candidate>) {
      const { error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      const index = this.candidates.findIndex(c => c.id === id);
      if (index !== -1) {
        this.candidates[index] = { ...this.candidates[index], ...updates };
      }
    }
  }
});
