import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const MAX_MESSAGE_LENGTH = 1000

async function verifyAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return false
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  return !error && user?.email === process.env.ADMIN_EMAIL
}

export async function POST(request: Request) {
  const { userId, message } = await request.json()
  if (!userId || !message?.trim()) {
    return NextResponse.json({ error: 'userId and message required' }, { status: 400 })
  }
  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `メッセージは${MAX_MESSAGE_LENGTH}文字以内で入力してください` }, { status: 400 })
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
  if (error) return NextResponse.json({ error: 'フィードバックの送信に失敗しました' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'フィードバックの取得に失敗しました' }, { status: 500 })
  return NextResponse.json({ feedbacks: data ?? [] })
}

export async function PATCH(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await supabaseAdmin.from('feedbacks').update({ read: true }).eq('id', id)
  return NextResponse.json({ ok: true })
}
