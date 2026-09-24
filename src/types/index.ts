export type Formation = '3-3-1' | '2-3-2' | '3-2-2' | '2-4-1' | '3-1-2-1' | '3-2-1-1' | '2-1-3-1'

export interface Player {
  id: string
  number: number
  name: string
}

export interface Substitution {
  outId: string
  inId: string
  position: string
}

export interface PlayerSnapshot {
  name: string
  number: number
}

export interface Match {
  id: string
  date: string    // YYYY-MM-DD
  time: string    // HH:MM
  opponent: string
  formation: Formation
  created_at: string
  scoreUs?: number
  scoreOpp?: number
  started?: boolean
  substitutions?: Substitution[]
  playerSnapshot?: Record<string, PlayerSnapshot>
  restingPlayerIds?: string[]
  memo?: string
}

// position key -> player id
export type LineupMap = Record<string, string>
