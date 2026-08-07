import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftvxmxlerzypacckoegr.supabase.co';
const supabaseKey = 'sb_publishable_jLfIDcuh5Qqp3NevBeTpnA_q0eB0yL9';

export const supabase = createClient(supabaseUrl, supabaseKey);
