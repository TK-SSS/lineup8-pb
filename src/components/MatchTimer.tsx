'use client'
import { useState, useEffect } from 'react'

const DEFAULT_DURATION = 15

export default function MatchTimer() {
  const [visible, setVisible] = useState(false)
  const [running, setRunning] = useState(false)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [accumulatedMs, setAccumulatedMs] = useState(0)
  const [mode, setMode] = useState<'elapsed' | 'remaining'>('elapsed')
  const [durationMin, setDurationMin] = useState(DEFAULT_DURATION)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const totalMs = accumulatedMs + (running && startedAt ? Date.now() - startedAt : 0)
  const durationMs = durationMin * 60 * 1000
  const remainingMs = Math.max(0, durationMs - totalMs)
  const displayMs = mode === 'elapsed' ? Math.min(totalMs, durationMs) : remainingMs
  const totalSec = Math.floor(displayMs / 1000)
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0')
  const ss = String(totalSec % 60).padStart(2, '0')

  const oneMinMs = 1 * 60 * 1000
  const fiveMinMs = 5 * 60 * 1000
  const timeColor =
    remainingMs <= oneMinMs ? 'text-red-500' :
    remainingMs <= fiveMinMs ? 'text-orange-400' :
    'text-emerald-400'

  function handleStartStop() {
    if (running) {
      setAccumulatedMs(prev => prev + (startedAt ? Date.now() - startedAt : 0))
      setStartedAt(null)
      setRunning(false)
    } else {
      setStartedAt(Date.now())
      setRunning(true)
    }
  }

  function handleReset() {
    setRunning(false)
    setStartedAt(null)
    setAccumulatedMs(0)
  }

  function handleDurationChange(min: number) {
    setDurationMin(min)
    handleReset()
  }

  return (
    <div className="px-3 pb-2">
      {/* Clock toggle icon */}
      <div className="flex justify-center py-1">
        <button
          onClick={() => setVisible(v => !v)}
          className={`transition-opacity ${visible ? 'opacity-60' : 'opacity-25'} active:opacity-80`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </button>
      </div>

      {visible && (
        <div className="bg-black/50 rounded-2xl px-4 py-3 border border-violet-900/60">
          {/* Duration + mode row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
              {[5, 10, 15, 20].map(m => (
                <button
                  key={m}
                  onClick={() => handleDurationChange(m)}
                  className={`text-xs px-2.5 py-0.5 rounded-full border transition-colors ${
                    durationMin === m
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'border-violet-700 text-violet-500'
                  }`}
                >
                  {m}分
                </button>
              ))}
            </div>
            <button
              onClick={() => setMode(m => m === 'elapsed' ? 'remaining' : 'elapsed')}
              className="text-xs text-violet-400 border border-violet-700 rounded-full px-2.5 py-0.5"
            >
              {mode === 'elapsed' ? '経過時間' : '残り時間'}
            </button>
          </div>

          {/* Time display + controls inline */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleStartStop}
              className="py-1.5 px-3 rounded-xl font-bold text-sm text-white bg-violet-500 active:bg-violet-400 transition-all active:scale-95"
            >
              {running ? '一時停止' : accumulatedMs > 0 ? '再開' : 'スタート'}
            </button>
            <div className={`font-mono font-black text-2xl tracking-widest leading-none ${timeColor}`}>
              {mm}:{ss}
            </div>
            <button
              onClick={handleReset}
              className="py-1.5 px-3 rounded-xl text-sm text-violet-400 bg-violet-900/40 active:bg-violet-800/60 active:scale-95 transition-all"
            >
              リセット
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
