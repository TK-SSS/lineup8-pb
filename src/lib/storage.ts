import type { Player, Match, LineupMap } from '@/types'

type AllData = { players: Player[]; matches: Match[]; lineups: Record<string, LineupMap> }

const CACHE_KEY = 'lineup8:cache'

function readCache(): AllData {
  if (typeof window === 'undefined') return { players: [], matches: [], lineups: {} }
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { players: [], matches: [], lineups: {} }
}

function writeCache(data: Partial<AllData>): void {
  if (typeof window === 'undefined') return
  try {
    const current = readCache()
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...current, ...data }))
  } catch {}
}

let _pending: Promise<AllData> | null = null

function loadAll(): Promise<AllData> {
  if (!_pending) {
    _pending = fetch('/api/data')
      .then(r => r.json())
      .then(data => { writeCache(data); return data })
      .catch(() => readCache())
      .finally(() => { _pending = null })
  }
  return _pending
}

function post(body: Partial<AllData>): void {
  writeCache(body)
  fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {})
}

export const storage = {
  loadPlayersSync: (): Player[]                          => readCache().players,
  loadMatchesSync: (): Match[]                           => readCache().matches,
  loadLineupsSync: (): Record<string, LineupMap>         => readCache().lineups,
  loadPlayers:     (): Promise<Player[]>                 => loadAll().then(d => d.players),
  loadMatches:     (): Promise<Match[]>                  => loadAll().then(d => d.matches),
  loadLineups:     (): Promise<Record<string, LineupMap>> => loadAll().then(d => d.lineups),
  savePlayers:     (v: Player[])                         => post({ players: v }),
  saveMatches:     (v: Match[])                          => post({ matches: v }),
  saveLineups:     (v: Record<string, LineupMap>)        => post({ lineups: v }),
}
