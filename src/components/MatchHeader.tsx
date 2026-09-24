'use client'
import type { Match } from '@/types'

interface Props {
  match: Match
  onUpdate: (patch: Partial<Match>) => void
}

function ScoreBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center text-violet-200 text-lg font-bold active:text-white active:scale-110 transition-all"
    >
      {label}
    </button>
  )
}

export default function MatchHeader({ match, onUpdate }: Props) {

  const us = match.scoreUs ?? 0
  const opp = match.scoreOpp ?? 0

  return (
    <div className="bg-violet-600 px-3 pt-0.5 pb-0.5 text-white">
      {/* Row 1: our score | vs | opponent input + their score */}
      <div className="flex items-end justify-between gap-2">
        {/* Our score */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="bg-violet-700 text-white text-xs font-bold text-center rounded-lg px-2 py-0.5 w-16 border border-violet-400/60">
            仲本
          </div>
          <div className="flex items-center gap-0.5">
            <ScoreBtn label="−" onClick={() => onUpdate({ scoreUs: Math.max(0, us - 1) })} />
            <span className="text-xl font-black w-8 text-center tabular-nums leading-none">{us}</span>
            <ScoreBtn label="＋" onClick={() => onUpdate({ scoreUs: us + 1 })} />
          </div>
        </div>

        {/* vs — lifted to align with score row center */}
        <span className="text-base text-violet-300 font-bold mb-1.5">vs</span>

        {/* Opponent: name input + score */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="relative">
            <input
              className="bg-violet-700 text-white text-xs font-bold text-center rounded-lg px-2 py-0.5 w-28 outline-none border border-violet-400/60 focus:border-violet-200 placeholder-violet-400 transition-colors"
              value={match.opponent}
              placeholder="相手チーム名"
              onChange={e => onUpdate({ opponent: e.target.value })}
            />
            {!match.opponent && (
              <span className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-amber-400 text-violet-900 text-[10px] font-black flex items-center justify-center animate-bounce leading-none">
                !
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <ScoreBtn label="−" onClick={() => onUpdate({ scoreOpp: Math.max(0, opp - 1) })} />
            <span className="text-xl font-black w-8 text-center tabular-nums leading-none">{opp}</span>
            <ScoreBtn label="＋" onClick={() => onUpdate({ scoreOpp: opp + 1 })} />
          </div>
        </div>
      </div>

    </div>
  )
}
