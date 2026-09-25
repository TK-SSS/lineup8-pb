'use client'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useMatches } from '@/hooks/useMatches'
import { storage } from '@/lib/storage'
import type { Match } from '@/types'

function formatDate(date: string) {
  if (!date) return '—'
  const [, m, d] = date.split('-')
  return `${m}/${d}`
}

function MatchRow({
  match,
  onSelect,
  onDelete,
  onMemoChange,
}: {
  match: Match
  onSelect: () => void
  onDelete: () => void
  onMemoChange: (memo: string) => void
}) {
  const hasScore = match.scoreUs != null || match.scoreOpp != null
  const us = match.scoreUs ?? 0
  const opp = match.scoreOpp ?? 0
  const [memoOpen, setMemoOpen] = useState(false)
  const [draft, setDraft] = useState(match.memo ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasMemo = !!match.memo

  useEffect(() => {
    if (memoOpen) textareaRef.current?.focus()
  }, [memoOpen])

  function handleMemoBlur() {
    onMemoChange(draft.trim())
  }

  return (
    <div className="border-b border-violet-900/40">
      <div className="flex items-center">
        <button
          onClick={() => setMemoOpen(o => !o)}
          className={`pl-3 pr-1 py-3 flex items-center transition-colors shrink-0 ${hasMemo ? 'text-orange-400' : memoOpen ? 'text-violet-400' : 'text-violet-800'} active:text-orange-300`}
          aria-label="メモ"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>

        <button onClick={onSelect} className="flex-1 px-2 py-3 text-left flex items-center gap-2 min-w-0">
          <span className="text-violet-300 font-black text-base w-10 shrink-0 mr-3">{formatDate(match.date)}</span>
          <span className="text-violet-500 text-sm w-12 shrink-0">{match.time || '—'}</span>
          <span className={`text-base font-bold flex-1 truncate ${match.opponent ? 'text-white' : 'text-violet-700 italic'}`}>
            {match.opponent || '未設定'}
          </span>
          <span className="text-violet-500 text-sm shrink-0 whitespace-nowrap">{match.formation}</span>
          {hasScore && (
            <span className="bg-violet-700 text-white font-black text-sm px-2 py-0.5 rounded-lg tabular-nums shrink-0">
              {us}-{opp}
            </span>
          )}
        </button>

        <button
          onClick={onDelete}
          className="px-3 py-3 flex items-center text-violet-800 active:text-red-400 active:bg-red-900/20 transition-colors shrink-0"
          aria-label="削除"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
        </button>
      </div>

      {!memoOpen && hasMemo && (
        <button onClick={() => setMemoOpen(true)} className="w-full px-4 pb-2 text-left">
          <p className="text-violet-400 text-xs truncate">{match.memo}</p>
        </button>
      )}

      {memoOpen && (
        <div className="px-3 pb-3">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={handleMemoBlur}
            placeholder="メモを入力..."
            rows={3}
            className="w-full bg-violet-950/60 border border-violet-700/60 rounded-xl px-3 py-2 text-sm text-violet-200 placeholder-violet-700 outline-none focus:border-violet-500 resize-none"
          />
        </div>
      )}
    </div>
  )
}

export default function MatchesPage() {
  const router = useRouter()
  const { matches, isLoaded, createMatch, updateMatch, deleteMatch } = useMatches()

  const sorted = [...matches].reverse()

  function handleSelect(id: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lineup8-nav-to-match', id)
    }
    router.push('/')
  }

  function handleNew() {
    const prev = matches[matches.length - 1]
    const m = createMatch(prev?.formation ?? '3-3-1')
    storage.saveMatches([...matches, m])
    localStorage.setItem('lineup8-nav-to-match', m.id)
    router.push('/')
  }

  return (
    <div className="min-h-full bg-black">
      {/* Header */}
      <div className="bg-violet-600 px-4 py-4 flex items-center">
        <h1 className="flex-1 text-white font-bold text-xl text-center">試合リスト</h1>
        <button
          onClick={handleNew}
          className="bg-violet-500 hover:bg-violet-400 active:scale-95 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all shrink-0"
        >
          ＋ 新規作成
        </button>
      </div>

      {!isLoaded ? (
        <div className="flex-1" />
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="text-5xl">📋</div>
          <p className="text-violet-400 text-sm text-center">
            試合がまだありません<br />
            新規作成から始めましょう
          </p>
        </div>
      ) : (
        <div>
          {sorted.map(m => (
            <MatchRow
              key={m.id}
              match={m}
              onSelect={() => handleSelect(m.id)}
              onDelete={() => {
                if (confirm(`${m.date} VS ${m.opponent || '（未設定）'} を削除しますか？`)) {
                  deleteMatch(m.id)
                }
              }}
              onMemoChange={memo => updateMatch(m.id, { memo })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
