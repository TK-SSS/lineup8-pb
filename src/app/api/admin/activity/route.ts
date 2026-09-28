import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function verifyAdmin(request: Request): Promise<boolean> {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return false
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId)
  return data?.user?.email === process.env.ADMIN_EMAIL
}

export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const since = new Date()
  since.setDate(since.getDate() - 29)
  since.setHours(0, 0, 0, 0)

  const { data, error } = await supabaseAdmin
    .from('activity_logs')
    .select('user_id, created_at')
    .gte('created_at', since.toISOString())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Group by JST date, count distinct users per day
  const dayMap: Record<string, Set<string>> = {}
  for (const row of data ?? []) {
    const jst = new Date(new Date(row.created_at).getTime() + 9 * 3600 * 1000)
    const key = jst.toISOString().slice(0, 10)
    if (!dayMap[key]) dayMap[key] = new Set()
    dayMap[key].add(row.user_id)
  }

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(since.getTime() + i * 86400000)
    const jst = new Date(d.getTime() + 9 * 3600 * 1000)
    const key = jst.toISOString().slice(0, 10)
    return { date: key, count: dayMap[key]?.size ?? 0 }
  })

  return NextResponse.json({ days })
}
