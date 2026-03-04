import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://xiheyqqhjypjqqnqwcqj.supabase.co'
const supabaseKey = 'sb_publishable_rUAlf6FMj_Xj18_d0_aWfw_egJjEgiD'

export const supabase = createClient(supabaseUrl, supabaseKey)