import { createClient } from '@supabase/supabase-js';

// Estas dos variables NO se escriben aquí directamente.
// Se configuran como "Environment Variables" en Vercel (más adelante te explico cómo).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
