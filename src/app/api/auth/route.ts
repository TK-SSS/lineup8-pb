import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data } = await supabaseAdmin.from('profiles').select('team_name, username').eq('id', user.id).single()
  return NextResponse.json({ team_name: data?.team_name ?? '', username: data?.username ?? '' })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action } = body

  if (action === 'create-profile') {
    const { userId, teamName, username } = body
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Verify the userId is a real user
    const { data: userCheck } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (!userCheck?.user) return NextResponse.json({ error: 'invalid userId' }, { status: 400 })

    // Only insert — never overwrite an existing profile
    const { data: existing } = await supabaseAdmin.from('profiles').select('id').eq('id', userId).single()
    if (existing) return NextResponse.json({ error: 'profile already exists' }, { status: 409 })

    const row: Record<string, string> = { id: userId, team_name: teamName ?? '' }
    if (username?.trim()) row.username = username.trim().toLowerCase()
    const { error } = await supabaseAdmin.from('profiles').insert(row)
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'このユーザー名は使用されています' }, { status: 409 })
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'check-username') {
    const { username } = body
    if (!username?.trim()) return NextResponse.json({ available: false })
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username.trim().toLowerCase())
      .single()
    return NextResponse.json({ available: !data })
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
