import { defineStore } from 'pinia';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';

export const useCategoryStore = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchCategories() {
      if (this.loading) return;
      this.loading = true;
      this.error = null;
      try {
        const { data: categories, error: catError } = await supabase
          .from('categories')
          .select('*, criteria:category_criteria(*)')
          .order('id', { ascending: true });

        if (catError) {
          console.error('Fetch categories error:', catError);
          this.error = catError.message;
          throw catError;
        }

        console.log('Fetched categories with criteria:', categories);

        this.categories = (categories || []).map((c: any) => ({
          ...c,
          id: String(c.id),
          category_key: c.category_key ?? c.key ?? undefined,
          name: c.category_name ?? c.name ?? 'Category',
          criteria: (c.criteria || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        }));
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        this.error = error.message || 'Failed to fetch categories';
      } finally {
        this.loading = false;
      }
    },

    async updateCategoryStatus(id: string, updates: Partial<Category>) {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      const index = this.categories.findIndex(c => c.id === id);
      if (index !== -1) {
        this.categories[index] = { ...this.categories[index], ...updates };
      }
    }
  }
});
