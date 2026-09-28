import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

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

    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (token) {
      // Session available (email confirmation disabled or already confirmed): verify token owner
      const { data: { user: caller }, error: authErr } = await supabaseAdmin.auth.getUser(token)
      if (authErr || !caller || caller.id !== userId) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      }
    } else {
      // No session (email confirmation required): allow only if the user was created within 5 minutes
      const { data: userCheck } = await supabaseAdmin.auth.admin.getUserById(userId)
      if (!userCheck?.user) return NextResponse.json({ error: 'invalid userId' }, { status: 400 })
      const createdAt = new Date(userCheck.user.created_at).getTime()
      if (Date.now() - createdAt > 5 * 60 * 1000) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      }
    }

    // Validate username format
    if (username?.trim()) {
      const uname = username.trim().toLowerCase()
      if (!USERNAME_RE.test(uname)) {
        return NextResponse.json({ error: 'ユーザー名は半角英数字・アンダースコアのみ、3〜20文字で入力してください' }, { status: 400 })
      }
    }

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

  if (action === 'update-username') {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const { data: { user: caller }, error: authErr } = await supabaseAdmin.auth.getUser(token)
    if (authErr || !caller) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { username } = body
    const uname = username?.trim().toLowerCase() ?? ''
    if (!USERNAME_RE.test(uname)) {
      return NextResponse.json({ error: 'ユーザー名は半角英数字・アンダースコアのみ、3〜20文字で入力してください' }, { status: 400 })
    }
    const { error } = await supabaseAdmin.from('profiles').upsert({ id: caller.id, username: uname }, { onConflict: 'id' })
    if (error?.code === '23505') return NextResponse.json({ error: 'このユーザー名は使用されています' }, { status: 409 })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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
