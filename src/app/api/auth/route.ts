import { NextResponse } from 'next/server'

const PASSWORD = 'nmsss2026'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (password !== PASSWORD) {
    return NextResponse.json({ error: 'wrong' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('lineup8-auth', 'ok', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return res
}
