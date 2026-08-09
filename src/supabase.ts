import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ftvxmxlerzypacckoegr.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_jLfIDcuh5Qqp3NevBeTpnA_q0eB0yL9';

export const supabase = createClient(supabaseUrl, supabaseKey);
