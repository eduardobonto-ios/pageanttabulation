import { supabase } from '@/lib/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-url'));

export const supabaseConfig = {
  isConfigured,
  url: supabaseUrl,
  key: supabaseAnonKey
};

export const authService = {
  async getCurrentProfile() {
    if (!isConfigured) return null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error in getCurrentProfile:', error);
      return null;
    }
  },

  async signOut() {
    if (!isConfigured) return;
    await supabase.auth.signOut();
  }
};
