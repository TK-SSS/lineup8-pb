import { supabase } from './supabase'
import type { Player, Match, LineupMap } from '@/types'

async function getUserId(): Promise<string | null> {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) console.error('[storage] getSession error:', error)
  if (!session) console.warn('[storage] no session')
  return session?.user?.id ?? null
}

async function getData<T>(dataType: string, defaultValue: T): Promise<T> {
  const userId = await getUserId()
  if (!userId) return defaultValue
  const { data, error } = await supabase
    .from('app_data')
    .select('data')
    .eq('user_id', userId)
    .eq('data_type', dataType)
    .single()
  if (error && error.code !== 'PGRST116') console.error('[storage] getData error:', error)
  return (data?.data as T) ?? defaultValue
}

function setData<T>(dataType: string, value: T): void {
  getUserId().then(async userId => {
    if (!userId) { console.warn('[storage] setData skipped: no userId'); return }
    const { error } = await supabase.from('app_data').upsert({
      user_id: userId,
      data_type: dataType,
      data: value,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,data_type' })
    if (error) console.error('[storage] upsert error:', error)
    else console.log('[storage] saved', dataType, 'for', userId)
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

let activityPinged = false

async function pingActivity(): Promise<void> {
  if (activityPinged) return
  activityPinged = true
  const userId = await getUserId()
  if (!userId) return
  await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userId)
}

export const storage = {
  pingActivity,
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
