'use client'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Player } from '@/types'

interface Props {
  player: Player
  position?: string   // undefined = from bench
  isOver?: boolean
  subFromNum?: number  // on court: subbed in for #N
  subToNum?: number    // on bench: was subbed out for #N
  isSwapped?: boolean  // recently swapped — flash white border
  isResting?: boolean  // bench only: marked as absent
}

export default function PlayerToken({ player, position, isOver, subFromNum, subToNum, isSwapped, isResting }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { position },
  })

  const style = { transform: CSS.Translate.toString(transform) }
  const isBench = !position
  const dragListeners = isResting ? {} : listeners

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dragListeners}
      {...attributes}
      className={`select-none touch-none transition-all ${isDragging ? 'opacity-30 scale-95' : ''} ${isOver ? 'scale-110' : ''}`}
    >
      {isBench ? (
        /* Bench: pill */
        <div className={`flex items-center gap-1 rounded-full px-2 py-1 border-2 shadow-md transition-all duration-500 ${
          isSwapped
            ? 'border-white bg-violet-500'
            : isResting
            ? 'bg-gray-700/60 border-gray-500/60'
            : subToNum !== undefined
            ? 'bg-violet-900/60 border-violet-600/60'
            : 'bg-violet-500 border-violet-300/60'
        }`}>
          <span className={`text-sm font-black w-5 text-center ${isResting ? 'text-gray-400' : subToNum !== undefined ? 'text-violet-400' : 'text-white'}`}>{player.number}</span>
          <span className={`text-sm font-semibold max-w-[52px] truncate ${isResting ? 'text-gray-400' : subToNum !== undefined ? 'text-violet-400' : 'text-white'}`}>{player.name}</span>
          {isResting && <span className="text-gray-400 text-xs">休</span>}
          {!isResting && subToNum !== undefined && (
            <span className="text-amber-400 text-xs font-bold">→{subToNum}</span>
          )}
        </div>
      ) : (
        /* Court: circle */
        <div className="flex flex-col items-center">
          <div className={`w-13 h-13 rounded-full shadow-lg flex flex-col items-center justify-center transition-all duration-500 ${
            subFromNum !== undefined ? 'bg-emerald-600' : 'bg-violet-500'
          } ${
            isSwapped
              ? 'border-4 border-white'
              : subFromNum !== undefined
              ? 'border-2 border-emerald-300/80'
              : 'border-2 border-violet-300/70'
          }`}>
            <span className="text-base font-black leading-none text-white">{player.number}</span>
            <span className="text-[10px] font-bold leading-tight text-white max-w-[46px] truncate text-center">
              {player.name}
            </span>
          </div>
          {subFromNum !== undefined && (
            <span className="mt-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-px leading-none">
              替#{subFromNum}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
