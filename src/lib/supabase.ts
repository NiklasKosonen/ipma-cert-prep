import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a mock Supabase client if environment variables are missing
const createMockSupabase = () => ({
  from: () => ({
    select: () => ({ limit: () => ({ data: null, error: { code: 'PGRST116' } }) }),
    upsert: () => ({ data: null, error: null }),
    insert: () => ({ data: null, error: null })
  }),
  auth: {
    signIn: () => ({ data: null, error: { message: 'Supabase not configured' } }),
    signOut: () => ({ error: null })
  }
})

// Debug: Check if environment variables are loaded
console.log('🔍 Supabase Config Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING',
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
})

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : createMockSupabase() as any