'use client'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import type { Match, Player, LineupMap, Substitution, Formation } from '@/types'
import { FORMATIONS } from '@/lib/formations'

const FORMATION_LIST: Formation[] = ['3-3-1', '2-3-2', '3-2-2', '2-4-1', '3-1-2-1', '3-2-1-1', '2-1-3-1']
import MatchHeader from './MatchHeader'
import CourtDisplay from './CourtDisplay'
import BenchArea from './BenchArea'
import PlayerToken from './PlayerToken'
import MatchTimer from './MatchTimer'

interface Props {
  match: Match
  lineup: LineupMap
  players: Player[]
  teamName: string
  matchIndex: number
  totalMatches: number
  onUpdateMatch: (patch: Partial<Match>) => void
  onSetPlayer: (playerId: string, toPos: string | null) => void
  onSwapPositions: (pos1: string, pos2: string) => void
  onClear: () => void
  onPrev: () => void
  onNext: () => void
  onNew: () => void
}

export default function LineupScreen({
  match,
  lineup,
  players,
  teamName,
  matchIndex,
  totalMatches,
  onUpdateMatch,
  onSetPlayer,
  onSwapPositions,
  onClear,
  onPrev,
  onNext,
  onNew,
}: Props) {
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null)
  const [pendingSub, setPendingSub] = useState<{ benchPlayerId: string; targetPos: string } | null>(null)
  const [swappedPositions, setSwappedPositions] = useState<Set<string>>(new Set())
  const [showFormationPicker, setShowFormationPicker] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showMemo, setShowMemo] = useState(false)
  const [memoDraft, setMemoDraft] = useState(match.memo ?? '')
  const [swappedPlayerIds, setSwappedPlayerIds] = useState<Set<string>>(new Set())

  function flashPlayers(ids: string[]) {
    setSwappedPlayerIds(new Set(ids))
    setTimeout(() => setSwappedPlayerIds(new Set()), 3000)
  }

  const restingIds = new Set(match.restingPlayerIds ?? [])

  function toggleResting(id: string) {
    const next = new Set(restingIds)
    next.has(id) ? next.delete(id) : next.add(id)
    onUpdateMatch({ restingPlayerIds: [...next] })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const positions = FORMATIONS[match.formation]
  const courtPlayerIds = new Set(
    positions.map(pos => lineup[pos.key]).filter((id): id is string => !!id)
  )
  const benchPlayers = players.filter(p => !courtPlayerIds.has(p.id)).sort((a, b) => a.number - b.number)
  const activePlayer = activePlayerId ? players.find(p => p.id === activePlayerId) : null
  const activePosKey = Object.entries(lineup).find(([, pid]) => pid === activePlayerId)?.[0]

  const substitutions = match.substitutions ?? []
  const subInMap = new Map<string, number>()
  const subOutMap = new Map<string, number>()
  for (const sub of substitutions) {
    const outPlayer = players.find(p => p.id === sub.outId)
    const inPlayer = players.find(p => p.id === sub.inId)
    if (outPlayer && inPlayer) {
      subInMap.set(sub.inId, outPlayer.number)
      subOutMap.set(sub.outId, inPlayer.number)
    }
  }

  function handleDragStart(e: DragStartEvent) {
    setActivePlayerId(e.active.id as string)
  }

  function handleDragEnd(e: DragEndEvent) {
    setActivePlayerId(null)
    const { active, over } = e
    if (!over) return

    const playerId = active.id as string
    if (restingIds.has(playerId)) return
    const sourcePos = (active.data.current?.position as string) ?? null
    const destId = over.id as string

    if (destId === 'bench') {
      if (sourcePos && !match.started) onSetPlayer(playerId, null)
    } else {
      const existingId = lineup[destId]
      if (!sourcePos && existingId && match.started) {
        setPendingSub({ benchPlayerId: playerId, targetPos: destId })
      } else if (sourcePos && existingId && existingId !== playerId) {
        onSwapPositions(sourcePos, destId)
        setSwappedPositions(new Set([sourcePos, destId]))
        setTimeout(() => setSwappedPositions(new Set()), 3000)
      } else {
        onSetPlayer(playerId, destId)
        setSwappedPositions(new Set([destId]))
        setTimeout(() => setSwappedPositions(new Set()), 3000)
        if (existingId) flashPlayers([existingId])
      }
    }
  }

  function confirmSub() {
    if (!pendingSub) return
    const { benchPlayerId, targetPos } = pendingSub
    const outPlayerId = lineup[targetPos]
    onSetPlayer(benchPlayerId, targetPos)
    if (outPlayerId) {
      const newSubs: Substitution[] = [...substitutions, { outId: outPlayerId, inId: benchPlayerId, position: targetPos }]
      onUpdateMatch({ substitutions: newSubs })
    }
    setSwappedPositions(new Set([targetPos]))
    setTimeout(() => setSwappedPositions(new Set()), 3000)
    if (outPlayerId) flashPlayers([outPlayerId])
    setPendingSub(null)
  }

  const pendingOutPlayer = pendingSub ? players.find(p => p.id === lineup[pendingSub.targetPos]) : null
  const pendingInPlayer = pendingSub ? players.find(p => p.id === pendingSub.benchPlayerId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <MatchHeader match={match} teamName={teamName} onUpdate={onUpdateMatch} />

      {/* Navigation row */}
      <div className="flex items-center px-1 py-0.5 gap-0">
        {/* < > left-aligned */}
        <button
          onClick={onPrev}
          disabled={matchIndex === 0}
          className="w-10 h-10 flex items-center justify-center rounded-full text-violet-400 disabled:opacity-20 active:bg-violet-900/40 text-3xl"
        >
          ‹
        </button>
        <button
          onClick={onNext}
          disabled={matchIndex === totalMatches - 1}
          className="w-10 h-10 flex items-center justify-center rounded-full text-violet-400 disabled:opacity-20 active:bg-violet-900/40 text-3xl"
        >
          ›
        </button>

        {/* date / time / formation — center */}
        <div className="flex-1 flex items-center justify-center gap-2 text-sm text-violet-400">
          <label className="flex items-center gap-0.5 cursor-pointer">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <input
              type="date"
              className="bg-transparent text-violet-400 text-sm outline-none cursor-pointer"
              value={match.date}
              onChange={e => onUpdateMatch({ date: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-0.5 cursor-pointer">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <input
              type="time"
              className="bg-transparent text-violet-400 text-sm outline-none cursor-pointer w-[76px]"
              value={match.time}
              onChange={e => onUpdateMatch({ time: e.target.value })}
            />
          </label>
          <div className="relative">
            <button
              className="flex items-center gap-0.5 font-semibold text-violet-400 whitespace-nowrap"
              onClick={() => setShowFormationPicker(p => !p)}
            >
              {match.formation}
              <svg className="w-2 h-2" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0l5 6 5-6z" /></svg>
            </button>
            {showFormationPicker && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-violet-900 border border-violet-600 rounded-lg shadow-xl z-50 overflow-hidden">
                {FORMATION_LIST.map(f => (
                  <button
                    key={f}
                    className={`block w-full px-5 py-2.5 text-left text-sm whitespace-nowrap text-violet-200 active:bg-violet-700 ${f === match.formation ? 'bg-violet-700 font-bold' : ''}`}
                    onClick={() => { onUpdateMatch({ formation: f }); setShowFormationPicker(false) }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* memo + right */}
        <button
          onClick={() => setShowMemo(v => !v)}
          className={`transition-colors mx-4 ${match.memo ? 'text-orange-400' : showMemo ? 'text-violet-400' : 'text-violet-700'} active:text-orange-300`}
          aria-label="メモ"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
        <button
          onClick={onNew}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-violet-400 text-white text-xl font-bold shadow active:scale-95 active:bg-violet-300 transition-all"
        >
          +
        </button>
      </div>

      {showMemo && (
        <div className="px-3 pb-2">
          <textarea
            value={memoDraft}
            onChange={e => setMemoDraft(e.target.value)}
            onBlur={() => onUpdateMatch({ memo: memoDraft.trim() })}
            placeholder="メモを入力..."
            rows={3}
            autoFocus
            className="w-full bg-violet-950/60 border border-violet-700/60 rounded-xl px-3 py-2 text-sm text-violet-200 placeholder-violet-700 outline-none focus:border-violet-500 resize-none"
          />
        </div>
      )}

      <CourtDisplay positions={positions} lineup={lineup} players={players} subInMap={subInMap} swappedPositions={swappedPositions} />
      <BenchArea players={benchPlayers} subOutMap={subOutMap} restingIds={restingIds} onToggleResting={toggleResting} swappedPlayerIds={swappedPlayerIds} />

      {/* Bottom action row */}
      <div className="px-3 pb-1 flex gap-2">
        {!match.started ? (
          <button
            onClick={() => onUpdateMatch({ started: true })}
            className="flex-1 py-2 rounded-xl font-bold text-sm text-white bg-violet-400 active:bg-violet-300 transition-all active:scale-95 shadow"
          >
            途中交代
          </button>
        ) : (
          <button
            onClick={() => onUpdateMatch({ started: false })}
            className="flex-1 py-2 rounded-xl text-sm text-amber-400 bg-amber-900/30 text-center font-semibold active:bg-amber-900/50 transition-all"
          >
            途中交代中{substitutions.length > 0 ? `　${substitutions.length}回` : ''}　✕
          </button>
        )}
        <button
          onClick={() => setShowClearConfirm(true)}
          className="py-2 px-4 rounded-xl font-bold text-sm text-violet-500 bg-violet-900/40 active:bg-violet-800/60 transition-all active:scale-95"
        >
          クリア
        </button>
      </div>

      <div className="sticky bottom-0 bg-black z-10">
        <MatchTimer />
      </div>

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-6">
          <div className="bg-violet-950 border border-violet-600 rounded-2xl p-6 w-full max-w-xs">
            <p className="text-white font-bold text-center text-base mb-2">クリアしますか？</p>
            <p className="text-violet-400 text-sm text-center mb-6">スタメンと交代情報がリセットされます</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm text-violet-400 bg-violet-900/40 active:bg-violet-800/60 transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={() => { onClear(); onUpdateMatch({ substitutions: [], started: false }); setShowClearConfirm(false) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-700/80 active:bg-red-600 transition-all"
              >
                クリア
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Substitution confirmation modal */}
      {pendingSub && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center pb-12">
          <div className="bg-violet-950 border border-violet-600 rounded-2xl p-5 mx-4 w-full max-w-sm">
            <p className="text-white font-bold text-center text-base mb-4">途中交代</p>
            <div className="flex items-center justify-center gap-6 mb-5">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-full bg-violet-700 border-2 border-violet-400 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-white leading-none">{pendingOutPlayer?.number}</span>
                  <span className="text-[10px] text-violet-200 leading-tight">{pendingOutPlayer?.name}</span>
                </div>
                <span className="text-xs text-violet-400 font-semibold">OUT</span>
              </div>
              <span className="text-violet-400 text-2xl mb-4">→</span>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-full bg-amber-600 border-2 border-amber-400 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-white leading-none">{pendingInPlayer?.number}</span>
                  <span className="text-[10px] text-amber-100 leading-tight">{pendingInPlayer?.name}</span>
                </div>
                <span className="text-xs text-amber-400 font-semibold">IN</span>
              </div>
            </div>
            <button
              onClick={confirmSub}
              className="w-full py-3 bg-violet-400 text-white font-bold rounded-xl mb-2 active:scale-95 transition-all"
            >
              途中交代
            </button>
            <button
              onClick={() => setPendingSub(null)}
              className="w-full py-2 text-violet-400 text-sm"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <DragOverlay dropAnimation={null}>
        {activePlayer && (
          <div className="opacity-90 scale-110 pointer-events-none">
            <PlayerToken player={activePlayer} position={activePosKey} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
