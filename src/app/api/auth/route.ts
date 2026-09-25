import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  const { data } = await supabaseAdmin.from('profiles').select('team_name').eq('id', userId).single()
  return NextResponse.json({ team_name: data?.team_name ?? '' })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action } = body

  if (action === 'create-profile') {
    const { userId, teamName } = body
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    await supabaseAdmin.from('profiles').upsert({ id: userId, team_name: teamName ?? '' }, { onConflict: 'id' })
    return NextResponse.json({ ok: true })
  }

  if (action === 'delete') {
    const { userId } = body
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !caller || caller.id !== userId) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
