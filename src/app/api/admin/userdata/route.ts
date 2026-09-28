import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function verifyAdmin(request: Request): Promise<boolean> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return false
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  return !error && user?.email === process.env.ADMIN_EMAIL
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const targetId = searchParams.get('targetId')

  if (!targetId) return NextResponse.json({ error: 'params required' }, { status: 400 })
  if (!(await verifyAdmin(request))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const [{ data: targetUser }, { data: appData }, { data: profile }] = await Promise.all([
    supabaseAdmin.auth.admin.getUserById(targetId),
    supabaseAdmin.from('app_data').select('data_type, data').eq('user_id', targetId),
    supabaseAdmin.from('profiles').select('username, team_name').eq('id', targetId).single(),
  ])

  const players = appData?.find(d => d.data_type === 'players')?.data ?? []
  const matches = appData?.find(d => d.data_type === 'matches')?.data ?? []

  return NextResponse.json({
    email: targetUser?.user?.email ?? '',
    username: profile?.username ?? '',
    teamName: profile?.team_name ?? '',
    players,
    matches,
  })
}
