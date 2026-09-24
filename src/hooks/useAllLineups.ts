'use client'
import { useState, useEffect, useRef } from 'react'
import type { LineupMap } from '@/types'
import { storage } from '@/lib/storage'

export function useAllLineups() {
  const [all, setAll] = useState<Record<string, LineupMap>>({})
  const loadComplete = useRef(false)
  const hasLocalChanges = useRef(false)

  useEffect(() => {
    const cached = storage.loadLineupsSync()
    if (Object.keys(cached).length > 0) setAll(cached)
    storage.loadLineups().then(data => {
      loadComplete.current = true
      if (!hasLocalChanges.current) {
        setAll(data)
      }
    })
  }, [])

  useEffect(() => {
    if (!loadComplete.current) return
    const t = setTimeout(() => storage.saveLineups(all), 400)
    return () => clearTimeout(t)
  }, [all])

  const getLineup = (matchId: string): LineupMap => all[matchId] ?? {}

  const setPlayer = (matchId: string, playerId: string, toPos: string | null) => {
    hasLocalChanges.current = true
    setAll(prev => {
      const cur = { ...(prev[matchId] ?? {}) }
      for (const k of Object.keys(cur)) {
        if (cur[k] === playerId) delete cur[k]
      }
      if (toPos !== null) cur[toPos] = playerId
      return { ...prev, [matchId]: cur }
    })
  }

  const clearPosition = (matchId: string, pos: string) => {
    hasLocalChanges.current = true
    setAll(prev => {
      const cur = { ...(prev[matchId] ?? {}) }
      delete cur[pos]
      return { ...prev, [matchId]: cur }
    })
  }

  const swapPositions = (matchId: string, pos1: string, pos2: string) => {
    hasLocalChanges.current = true
    setAll(prev => {
      const cur = { ...(prev[matchId] ?? {}) }
      const p1 = cur[pos1]
      const p2 = cur[pos2]
      if (p1) cur[pos2] = p1; else delete cur[pos2]
      if (p2) cur[pos1] = p2; else delete cur[pos1]
      return { ...prev, [matchId]: cur }
    })
  }

  const copyLineup = (fromMatchId: string, toMatchId: string) => {
    hasLocalChanges.current = true
    setAll(prev => ({
      ...prev,
      [toMatchId]: { ...(prev[fromMatchId] ?? {}) },
    }))
  }

  const clearLineup = (matchId: string) => {
    hasLocalChanges.current = true
    setAll(prev => ({ ...prev, [matchId]: {} }))
  }

  return { getLineup, setPlayer, clearPosition, swapPositions, copyLineup, clearLineup }
}
