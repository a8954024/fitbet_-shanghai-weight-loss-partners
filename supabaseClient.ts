import { createClient } from '@supabase/supabase-js';

// TODO: Replace these with your actual Supabase URL and Anon Key
// You can find these in your Supabase Project Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
