'use client'
import { useState, useEffect } from 'react'
import type { Match } from '@/types'
import { useMatches } from '@/hooks/useMatches'
import { usePlayers } from '@/hooks/usePlayers'
import { useAllLineups } from '@/hooks/useAllLineups'
import LineupScreen from '@/components/LineupScreen'

export default function HomePage() {
  const { matches, isLoaded: matchesLoaded, createMatch, updateMatch } = useMatches()
  const { players } = usePlayers()
  const { getLineup, setPlayer, swapPositions, copyLineup, clearLineup } = useAllLineups()

  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [animKey, setAnimKey] = useState(0)
  const [animDir, setAnimDir] = useState<'left' | 'right'>('left')
  const [showPlayerChangeWarning, setShowPlayerChangeWarning] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [warnedMatchId, setWarnedMatchId] = useState<string | null>(null)

  function navigate(newIndex: number, dir: 'left' | 'right') {
    setAnimDir(dir)
    setAnimKey(k => k + 1)
    setCurrentIndex(newIndex)
    setWarnedMatchId(null)
  }

  function hasPlayerChanges(m: Match): boolean {
    const snapshot = m.playerSnapshot
    if (!snapshot) return false
    return players.some(p => {
      const snap = snapshot[p.id]
      return snap && (snap.name !== p.name || snap.number !== p.number)
    })
  }

  function withPlayerChangeGuard(m: Match, action: () => void) {
    if (hasPlayerChanges(m) && warnedMatchId !== m.id) {
      setPendingAction(() => action)
      setShowPlayerChangeWarning(true)
    } else {
      action()
    }
  }

  useEffect(() => {
    if (matches.length > 0 && currentIndex === -1) {
      const navTo = localStorage.getItem('lineup8-nav-to-match')
      const lastMatch = localStorage.getItem('lineup8-last-match')
      if (navTo) {
        localStorage.removeItem('lineup8-nav-to-match')
        const idx = matches.findIndex(m => m.id === navTo)
        setCurrentIndex(idx >= 0 ? idx : matches.length - 1)
      } else if (lastMatch) {
        const idx = matches.findIndex(m => m.id === lastMatch)
        setCurrentIndex(idx >= 0 ? idx : matches.length - 1)
      } else {
        setCurrentIndex(matches.length - 1)
      }
    }
  }, [matches, currentIndex])

  useEffect(() => {
    if (currentIndex >= 0 && matches[currentIndex]) {
      localStorage.setItem('lineup8-last-match', matches[currentIndex].id)
    }
  }, [currentIndex, matches])

  function handleNewMatch() {
    const newMatch = createMatch(matches[currentIndex]?.formation ?? '3-3-1')
    const snapshot = Object.fromEntries(players.map(p => [p.id, { name: p.name, number: p.number }]))
    updateMatch(newMatch.id, { playerSnapshot: snapshot })
    navigate(matches.length, 'left')
  }

  if (!matchesLoaded) return (
    <div className="bg-violet-600 px-3 pt-1 pb-1" style={{ minHeight: 56 }} />
  )

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
        <div className="text-6xl">⚽</div>
        <h1 className="text-2xl font-bold text-white text-center">LineUp 8</h1>
        <p className="text-violet-300 text-center text-sm leading-relaxed">
          最初の試合を作成して<br />スタメンを管理しましょう
        </p>
        <button
          onClick={handleNewMatch}
          className="bg-violet-400 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
        >
          ＋　試合を作成する
        </button>
        <p className="text-violet-600 text-xs text-center mt-2">
          選手管理タブから先に選手を登録することをおすすめします
        </p>
      </div>
    )
  }

  const match = matches[currentIndex]
  if (!match) return null

  const lineup = getLineup(match.id)

  // Resolve player display using snapshot so past lineups are unaffected by edits
  const resolvedPlayers = players.map(p => {
    const snap = match.playerSnapshot?.[p.id]
    return snap ? { ...p, ...snap } : p
  })

  function handleSetPlayer(playerId: string, toPos: string | null) {
    const doSet = () => {
      setPlayer(match.id, playerId, toPos)
      if (toPos === null) return
      const player = players.find(p => p.id === playerId)
      if (!player) return
      updateMatch(match.id, m => ({
        playerSnapshot: {
          ...(m.playerSnapshot ?? {}),
          [player.id]: { name: player.name, number: player.number },
        },
      }))
    }
    withPlayerChangeGuard(match, doSet)
  }

  function handleSwapPositions(p1: string, p2: string) {
    withPlayerChangeGuard(match, () => swapPositions(match.id, p1, p2))
  }

  return (
    <>
      <div
        key={animKey}
        className={`min-h-full ${animKey > 0 ? (animDir === 'left' ? 'slide-from-right' : 'slide-from-left') : ''}`}
      >
        <LineupScreen
          match={match}
          lineup={lineup}
          players={resolvedPlayers}
          matchIndex={currentIndex}
          totalMatches={matches.length}
          onUpdateMatch={patch => updateMatch(match.id, patch)}
          onSetPlayer={handleSetPlayer}
          onSwapPositions={handleSwapPositions}
          onClear={() => clearLineup(match.id)}
          onPrev={() => navigate(Math.max(0, currentIndex - 1), 'right')}
          onNext={() => navigate(Math.min(matches.length - 1, currentIndex + 1), 'left')}
          onNew={handleNewMatch}
        />
      </div>

      {showPlayerChangeWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-6">
          <div className="bg-violet-950 border border-violet-600 rounded-2xl p-6 w-full max-w-xs">
            <p className="text-white font-bold text-center text-base mb-2">選手情報が変更されています</p>
            <p className="text-violet-400 text-sm text-center mb-6">
              選手リストの変更後に操作すると<br />最新の情報で上書きされます。<br />続けますか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowPlayerChangeWarning(false); setPendingAction(null) }}
                className="flex-1 py-2.5 rounded-xl text-sm text-violet-400 bg-violet-900/40 active:bg-violet-800/60 transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  setWarnedMatchId(match.id)
                  pendingAction?.()
                  setShowPlayerChangeWarning(false)
                  setPendingAction(null)
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 active:bg-violet-500 transition-all"
              >
                続ける
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
