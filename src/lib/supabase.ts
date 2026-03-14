import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://oxolhklfezihtvtyjyxf.supabase.co"
const supabaseKey = "sb_publishable_TcBlZnBSbYU2gcM193iUaQ_UNrvMgNr"

export const supabase = createClient(supabaseUrl, supabaseKey)