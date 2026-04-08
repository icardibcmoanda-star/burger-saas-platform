import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdhrgnfshqouhmnvdkll.supabase.co';
const supabaseAnonKey = 'sb_publishable_8S95IqmdcxzNfemAcenSlw_WgbVnXco';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
