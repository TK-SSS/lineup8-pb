import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const secretKey = process.env.SUPABASE_SECRET_KEY!

// クライアント側（ブラウザ）用
export const supabase = createClient(url, publishableKey)

// サーバー側（API Route）用
export const supabaseAdmin = createClient(url, secretKey)
