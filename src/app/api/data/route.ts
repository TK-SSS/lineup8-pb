import { NextResponse } from 'next/server'
import { redis, KEYS } from '@/lib/redis'

export async function GET() {
  const [players, matches, lineups] = await Promise.all([
    redis.get(KEYS.players),
    redis.get(KEYS.matches),
    redis.get(KEYS.lineups),
  ])
  return NextResponse.json({
    players: players ?? [],
    matches: matches ?? [],
    lineups: lineups ?? {},
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const ops: Promise<unknown>[] = []
  if ('players' in body) ops.push(redis.set(KEYS.players, body.players))
  if ('matches' in body) ops.push(redis.set(KEYS.matches, body.matches))
  if ('lineups' in body) ops.push(redis.set(KEYS.lineups, body.lineups))
  await Promise.all(ops)
  return NextResponse.json({ ok: true })
}
