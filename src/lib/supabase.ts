import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const db = {
  spaces: () => supabase.from('spaces'),
  bookings: () => supabase.from('bookings'),
  users: () => supabase.from('users'),
  payments: () => supabase.from('payments'),
  events: () => supabase.from('events'),
  reviews: () => supabase.from('reviews'),
}
