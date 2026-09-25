import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const COOKIE_OPTS = {
  path: '/',
  maxAge: 2592000,
  sameSite: 'lax' as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
}

export async function POST(request: Request) {
  const { token } = await request.json()
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'invalid token' }, { status: 401 })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('lineup8-auth', 'ok', COOKIE_OPTS)
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('lineup8-auth', '', { ...COOKIE_OPTS, maxAge: 0 })
  res.cookies.set('lineup8-admin', '', { ...COOKIE_OPTS, maxAge: 0 })
  return res
}
