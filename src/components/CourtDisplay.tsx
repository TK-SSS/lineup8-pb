'use client'
import { useDroppable } from '@dnd-kit/core'
import type { Player, LineupMap } from '@/types'
import type { PositionDef } from '@/lib/formations'
import PlayerToken from './PlayerToken'

interface SlotProps {
  pos: PositionDef
  player: Player | undefined
  subFromNum?: number
  isSwapped?: boolean
}

function PositionSlot({ pos, player, subFromNum, isSwapped }: SlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id: pos.key })
  const isEmpty = !player

  return (
    <div
      ref={setNodeRef}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      {isEmpty ? (
        <div
          className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center text-base font-bold text-white/60 transition-all ${
            isOver ? 'border-violet-400 bg-violet-500/20 scale-110 text-white' : 'border-white/30'
          }`}
        >
          {pos.label}
        </div>
      ) : (
        <>
          <PlayerToken player={player} position={pos.key} isOver={isOver} subFromNum={subFromNum} isSwapped={isSwapped} />
          <div className="absolute bottom-0 right-full text-white/30 text-[11px] font-bold tracking-wide pointer-events-none select-none">
            {pos.label}
          </div>
        </>
      )}
    </div>
  )
}

interface Props {
  positions: PositionDef[]
  lineup: LineupMap
  players: Player[]
  subInMap?: Map<string, number>
  swappedPositions?: Set<string>
}

export default function CourtDisplay({ positions, lineup, players, subInMap, swappedPositions }: Props) {
  const playerMap = new Map(players.map(p => [p.id, p]))

  return (
    <div className="mx-3 my-1 rounded-xl overflow-hidden" style={{ height: 330 }}>
      <div className="relative w-full h-full bg-black">
        <div className="absolute inset-[3px] border-2 border-white rounded-lg pointer-events-none" />
        <div
          className="absolute border-2 border-white pointer-events-none"
          style={{ top: -52, left: 'calc(50% - 52px)', width: 104, height: 104, borderRadius: '50%' }}
        />
        <div
          className="absolute border-2 border-white border-b-0 pointer-events-none"
          style={{ bottom: 3, left: '14%', right: '14%', height: '26%' }}
        />
        <div
          className="absolute border-2 border-white border-b-0 pointer-events-none"
          style={{ bottom: 3, left: '30%', right: '30%', height: '12%' }}
        />
        {positions.map(pos => {
          const playerId = lineup[pos.key]
          return (
            <PositionSlot
              key={pos.key}
              pos={pos}
              player={playerMap.get(playerId ?? '')}
              subFromNum={playerId ? subInMap?.get(playerId) : undefined}
              isSwapped={swappedPositions?.has(pos.key)}
            />
          )
        })}
      </div>
    </div>
  )
}
