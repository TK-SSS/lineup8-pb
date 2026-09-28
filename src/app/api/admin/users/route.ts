import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function verifyAdmin(request: Request): Promise<string | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user || user.email !== process.env.ADMIN_EMAIL) return null
  return user.id
}

export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const [{ data: authData, error: usersError }, { data: profiles }] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin.from('profiles').select('id, username, team_name, last_active_at'),
  ])

  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 })

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  const users = (authData?.users ?? []).map(u => ({
    id: u.id,
    email: u.email ?? '',
    username: profileMap[u.id]?.username ?? '',
    created_at: u.created_at,
    team_name: profileMap[u.id]?.team_name ?? '',
    last_active_at: profileMap[u.id]?.last_active_at ?? null,
  }))

  return NextResponse.json({ users })
}

export async function DELETE(request: Request) {
  const adminId = await verifyAdmin(request)
  if (!adminId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const targetId = searchParams.get('targetId')
  if (!targetId) return NextResponse.json({ error: 'targetId required' }, { status: 400 })
  if (targetId === adminId) return NextResponse.json({ error: 'cannot delete own account' }, { status: 400 })

  const { error } = await supabaseAdmin.auth.admin.deleteUser(targetId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
