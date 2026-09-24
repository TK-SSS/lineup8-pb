import { supabase } from './supabase'
import type { Player, Match, LineupMap } from '@/types'

async function getUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

async function getData<T>(dataType: string, defaultValue: T): Promise<T> {
  const userId = await getUserId()
  if (!userId) return defaultValue
  const { data } = await supabase
    .from('app_data')
    .select('data')
    .eq('user_id', userId)
    .eq('data_type', dataType)
    .single()
  return (data?.data as T) ?? defaultValue
}

function setData<T>(dataType: string, value: T): void {
  getUserId().then(userId => {
    if (!userId) return
    supabase.from('app_data').upsert({
      user_id: userId,
      data_type: dataType,
      data: value,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,data_type' })
  })
}

// localStorage キャッシュ
function readCache<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const raw = localStorage.getItem(`lineup8:${key}`)
    if (raw) return JSON.parse(raw)
  } catch {}
  return defaultValue
}

function writeCache<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(`lineup8:${key}`, JSON.stringify(value)) } catch {}
}

export const storage = {
  loadPlayersSync: (): Player[]                          => readCache('players', []),
  loadMatchesSync: (): Match[]                           => readCache('matches', []),
  loadLineupsSync: (): Record<string, LineupMap>         => readCache('lineups', {}),
  loadPlayers:     async (): Promise<Player[]>           => { const d = await getData<Player[]>('players', []); writeCache('players', d); return d },
  loadMatches:     async (): Promise<Match[]>            => { const d = await getData<Match[]>('matches', []); writeCache('matches', d); return d },
  loadLineups:     async (): Promise<Record<string, LineupMap>> => { const d = await getData<Record<string, LineupMap>>('lineups', {}); writeCache('lineups', d); return d },
  savePlayers:     (v: Player[])                         => { writeCache('players', v); setData('players', v) },
  saveMatches:     (v: Match[])                          => { writeCache('matches', v); setData('matches', v) },
  saveLineups:     (v: Record<string, LineupMap>)        => { writeCache('lineups', v); setData('lineups', v) },
}
