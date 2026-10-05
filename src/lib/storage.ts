import { supabase } from './supabase'
import type { Player, Match, LineupMap } from '@/types'

async function getUserId(): Promise<string | null> {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) console.error('[storage] getSession error:', error)
  if (!session) console.warn('[storage] no session')
  return session?.user?.id ?? null
}

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
  try {
    localStorage.setItem(`lineup8:${key}`, JSON.stringify(value))
    localStorage.setItem(`lineup8:${key}:t`, Date.now().toString())
  } catch {}
}

function markDirty(key: string): void {
  if (typeof window !== 'undefined') localStorage.setItem(`lineup8:${key}:dirty`, '1')
}

function clearDirty(key: string): void {
  if (typeof window !== 'undefined') localStorage.removeItem(`lineup8:${key}:dirty`)
}

function isDirty(key: string): boolean {
  return typeof window !== 'undefined' && !!localStorage.getItem(`lineup8:${key}:dirty`)
}

// Returns null on network error (caller should use cache as-is)
async function getRemote<T>(dataType: string, defaultValue: T): Promise<T | null> {
  const userId = await getUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('app_data')
    .select('data')
    .eq('user_id', userId)
    .eq('data_type', dataType)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return defaultValue  // no row yet — first use
    console.warn(`[storage] offline (${dataType}):`, error.message)
    return null  // network error
  }
  return (data?.data as T) ?? defaultValue
}

async function pushToRemote<T>(dataType: string, value: T): Promise<void> {
  const userId = await getUserId()
  if (!userId) { markDirty(dataType); return }
  const { error } = await supabase.from('app_data').upsert({
    user_id: userId,
    data_type: dataType,
    data: value,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,data_type' })
  if (error) {
    console.warn(`[storage] upsert offline (${dataType}):`, error.message)
    markDirty(dataType)
  } else {
    clearDirty(dataType)
    console.log('[storage] saved', dataType)
  }
}

async function loadData<T>(key: string, defaultValue: T): Promise<T> {
  const remote = await getRemote<T>(key, defaultValue)

  if (remote === null) {
    // Network unavailable — preserve local cache as-is, no overwrite
    return readCache(key, defaultValue)
  }

  if (isDirty(key)) {
    // Local has unsynced offline changes — push local up, keep local
    const local = readCache<T>(key, defaultValue)
    pushToRemote(key, local)
    return local
  }

  // Remote is authoritative — update cache and return
  writeCache(key, remote)
  return remote
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
  supabase.from('activity_logs').insert({ user_id: userId }).then(() => {})
}

export async function syncDirtyData(): Promise<void> {
  for (const key of ['players', 'matches', 'lineups'] as const) {
    if (!isDirty(key)) continue
    const cached = readCache(key, key === 'lineups' ? {} : [])
    await pushToRemote(key, cached)
  }
}

export const storage = {
  pingActivity,
  loadPlayersSync: (): Player[]                                  => readCache('players', []),
  loadMatchesSync: (): Match[]                                   => readCache('matches', []),
  loadLineupsSync: (): Record<string, LineupMap>                 => readCache('lineups', {}),
  loadPlayers:     async (): Promise<Player[]>                   => loadData<Player[]>('players', []),
  loadMatches:     async (): Promise<Match[]>                    => loadData<Match[]>('matches', []),
  loadLineups:     async (): Promise<Record<string, LineupMap>>  => loadData<Record<string, LineupMap>>('lineups', {}),
  savePlayers:     (v: Player[])                                 => { writeCache('players', v); pushToRemote('players', v) },
  saveMatches:     (v: Match[])                                  => { writeCache('matches', v); pushToRemote('matches', v) },
  saveLineups:     (v: Record<string, LineupMap>)                => { writeCache('lineups', v); pushToRemote('lineups', v) },
}
