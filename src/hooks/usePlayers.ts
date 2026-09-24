'use client'
import { useState, useEffect, useRef } from 'react'
import type { Player } from '@/types'
import { storage } from '@/lib/storage'

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const loadComplete = useRef(false)

  useEffect(() => {
    // Phase 1: show cached data instantly (no server round-trip)
    const cached = storage.loadPlayersSync()
    if (cached.length > 0) {
      setPlayers(cached)
      setIsLoaded(true)
    }
    // Phase 2: sync with server in background
    storage.loadPlayers().then(data => {
      loadComplete.current = true
      setPlayers(data)
      setIsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!loadComplete.current) return
    const t = setTimeout(() => storage.savePlayers(players), 400)
    return () => clearTimeout(t)
  }, [players])

  const addPlayer = (number: number, name: string) =>
    setPlayers(prev => [
      ...prev,
      { id: crypto.randomUUID(), number, name },
    ])

  const updatePlayer = (id: string, patch: Partial<Omit<Player, 'id'>>) =>
    setPlayers(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)))

  const deletePlayer = (id: string) =>
    setPlayers(prev => prev.filter(p => p.id !== id))

  return { players, isLoaded, addPlayer, updatePlayer, deletePlayer }
}
