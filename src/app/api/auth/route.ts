import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

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
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
