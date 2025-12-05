import { createClient } from '@supabase/supabase-js';

// TODO: Replace these with your actual Supabase URL and Anon Key
// You can find these in your Supabase Project Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

let supabaseClient;

try {
    // Check if URL is valid to prevent immediate crash
    if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || !supabaseUrl.startsWith('http')) {
        throw new Error('Invalid Supabase URL. Please check your .env file.');
    }
    supabaseClient = createClient(supabaseUrl, supabaseKey);
} catch (error) {
    console.error('Supabase initialization failed:', error);
    // Fallback dummy client to prevent app crash
    supabaseClient = {
        from: () => ({
            select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
            insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
            update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
            delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        }),
        channel: () => ({
            on: () => ({ on: () => ({ on: () => ({ subscribe: () => { } }) }) }),
        }),
        removeChannel: () => { },
    } as any;
}

export const supabase = supabaseClient;
