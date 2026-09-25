import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@supabase/supabase-js'

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const COOKIE_OPTS = {
  path: '/',
  maxAge: 2592000,
  sameSite: 'lax' as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
}

export async function POST(request: Request) {
  const { username, password } = await request.json()
  if (!username?.trim() || !password) {
    return NextResponse.json({ error: 'ユーザー名とパスワードを入力してください' }, { status: 400 })
  }

  const input = username.trim()
  let email: string

  if (input.includes('@')) {
    // 既存ユーザー向け後方互換: メールアドレスをそのまま使用
    email = input
  } else {
    // ユーザー名からメールアドレスを検索
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', input.toLowerCase())
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'ユーザー名またはパスワードが違います' }, { status: 401 })
    }

    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(profile.id)
    const found = authData?.user?.email
    if (!found) {
      return NextResponse.json({ error: 'ユーザー名またはパスワードが違います' }, { status: 401 })
    }
    email = found
  }

  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password })
  if (error || !data.session) {
    return NextResponse.json({ error: 'ユーザー名またはパスワードが違います' }, { status: 401 })
  }

  const isAdmin = email === process.env.ADMIN_EMAIL

  const res = NextResponse.json({
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
    isAdmin,
  })

  res.cookies.set('lineup8-auth', 'ok', COOKIE_OPTS)
  if (isAdmin) {
    res.cookies.set('lineup8-admin', 'ok', COOKIE_OPTS)
  }
  return res
}
