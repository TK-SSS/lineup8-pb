import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ admin: false })

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  const isAdmin = !error && user?.email === process.env.ADMIN_EMAIL

  const res = NextResponse.json({ admin: isAdmin })
  if (isAdmin) {
    res.cookies.set('lineup8-admin', 'ok', {
      path: '/',
      maxAge: 2592000,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
  }
  return res
}
