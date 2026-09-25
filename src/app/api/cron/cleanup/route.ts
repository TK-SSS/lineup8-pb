import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const INACTIVE_DAYS = 180

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - INACTIVE_DAYS)

  const { data: staleProfiles, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .lt('last_active_at', cutoff.toISOString())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!staleProfiles?.length) return NextResponse.json({ deleted: 0 })

  let deleted = 0
  for (const { id } of staleProfiles) {
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (!delErr) deleted++
    else console.error('[cron/cleanup] failed to delete user', id, delErr.message)
  }

  console.log(`[cron/cleanup] deleted ${deleted}/${staleProfiles.length} inactive accounts`)
  return NextResponse.json({ deleted, checked: staleProfiles.length })
}
