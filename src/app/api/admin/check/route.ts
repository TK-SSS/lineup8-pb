import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ admin: false })

  const { data } = await supabaseAdmin.auth.admin.getUserById(userId)
  const isAdmin = data?.user?.email === process.env.ADMIN_EMAIL

  const res = NextResponse.json({ admin: isAdmin })
  if (isAdmin) {
    res.cookies.set('lineup8-admin', 'ok', { path: '/', maxAge: 2592000, sameSite: 'lax' })
  }
  return res
}
