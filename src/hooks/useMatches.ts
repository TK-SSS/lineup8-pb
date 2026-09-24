'use client'
import { useState, useEffect, useRef } from 'react'
import type { Match, Formation } from '@/types'
import { storage } from '@/lib/storage'

function pad(n: number) { return String(n).padStart(2, '0') }

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function nowStr() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const loadComplete = useRef(false)

  useEffect(() => {
    // Phase 1: show cached data instantly (no server round-trip)
    const cached = storage.loadMatchesSync()
    if (cached.length > 0) {
      setMatches(cached)
      setIsLoaded(true)
    }
    // Phase 2: sync with server in background
    storage.loadMatches().then(data => {
      loadComplete.current = true
      setMatches(data)
      setIsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!loadComplete.current) return
    const t = setTimeout(() => storage.saveMatches(matches), 400)
    return () => clearTimeout(t)
  }, [matches])

  const createMatch = (formation: Formation = '3-3-1'): Match => {
    const m: Match = {
      id: crypto.randomUUID(),
      date: todayStr(),
      time: nowStr(),
      opponent: '',
      formation,
      created_at: new Date().toISOString(),
    }
    setMatches(prev => [...prev, m])
    return m
  }

  const updateMatch = (id: string, patch: Partial<Match> | ((m: Match) => Partial<Match>)) =>
    setMatches(prev => prev.map(m => {
      if (m.id !== id) return m
      const p = typeof patch === 'function' ? patch(m) : patch
      return { ...m, ...p }
    }))

  const deleteMatch = (id: string) =>
    setMatches(prev => prev.filter(m => m.id !== id))

  return { matches, isLoaded, createMatch, updateMatch, deleteMatch }
}
