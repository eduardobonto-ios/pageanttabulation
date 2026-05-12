import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(rawSupabaseUrl && rawSupabaseAnonKey)
export const supabaseConfigError = !rawSupabaseUrl
  ? 'Missing VITE_SUPABASE_URL'
  : !rawSupabaseAnonKey
    ? 'Missing VITE_SUPABASE_ANON_KEY'
    : null

const supabaseUrl = rawSupabaseUrl || 'https://placeholder.supabase.co'
const supabaseAnonKey = rawSupabaseAnonKey || 'placeholder-anon-key'

console.log('VITE_SUPABASE_URL exists:', !!rawSupabaseUrl)
console.log('VITE_SUPABASE_ANON_KEY exists:', !!rawSupabaseAnonKey)
if (supabaseConfigError) {
  console.error('Supabase configuration error:', supabaseConfigError)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
