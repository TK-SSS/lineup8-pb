import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const { userId, message } = await request.json()
  if (!userId || !message?.trim()) {
    return NextResponse.json({ error: 'userId and message required' }, { status: 400 })
  }

  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !caller || caller.id !== userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const email = caller.email ?? ''

  const { error } = await supabaseAdmin.from('feedbacks').insert({
    user_id: userId,
    email,
    message: message.trim(),
    read: false,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const adminId = searchParams.get('adminId')
  if (!adminId) return NextResponse.json({ error: 'adminId required' }, { status: 400 })

  const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(adminId)
  if (adminUser?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ feedbacks: data ?? [] })
}

export async function PATCH(request: Request) {
  const { adminId, id } = await request.json()
  if (!adminId || !id) return NextResponse.json({ error: 'params required' }, { status: 400 })

  const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(adminId)
  if (adminUser?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  await supabaseAdmin.from('feedbacks').update({ read: true }).eq('id', id)
  return NextResponse.json({ ok: true })
}
