'use client'
import { useState, useEffect, useRef } from 'react'
import type { Player } from '@/types'
import { storage } from '@/lib/storage'

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const loadComplete = useRef(false)
  const hasLocalChanges = useRef(false)

  useEffect(() => {
    const cached = storage.loadPlayersSync()
    if (cached.length > 0) {
      setPlayers(cached)
      setIsLoaded(true)
    }
    storage.loadPlayers().then(data => {
      loadComplete.current = true
      if (!hasLocalChanges.current) {
        setPlayers(data)
      }
      setIsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!loadComplete.current) return
    const t = setTimeout(() => storage.savePlayers(players), 400)
    return () => clearTimeout(t)
  }, [players])

  const addPlayer = (number: number, name: string) => {
    hasLocalChanges.current = true
    setPlayers(prev => [...prev, { id: crypto.randomUUID(), number, name }])
  }

  const updatePlayer = (id: string, patch: Partial<Omit<Player, 'id'>>) => {
    hasLocalChanges.current = true
    setPlayers(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)))
  }

  const deletePlayer = (id: string) => {
    hasLocalChanges.current = true
    setPlayers(prev => prev.filter(p => p.id !== id))
  }

  return { players, isLoaded, addPlayer, updatePlayer, deletePlayer }
}
