'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Player = { id: string; name: string; number: string | number }
type Match = { id: string; date?: string; opponent?: string; formation?: string; score?: string }

export default function UserDetailPage() {
  const router = useRouter()
  const { userId } = useParams<{ userId: string }>()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [teamName, setTeamName] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'players' | 'matches'>('players')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      fetch(`/api/admin/userdata?adminId=${session.user.id}&targetId=${userId}`)
        .then(r => r.json())
        .then(json => {
          if (json.error) { router.push('/admin'); return }
          setEmail(json.email)
          setUsername(json.username ?? '')
          setTeamName(json.teamName ?? '')
          setPlayers(json.players ?? [])
          setMatches(json.matches ?? [])
        })
        .finally(() => setLoading(false))
    })
  }, [router, userId])

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-8">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-4 flex items-center">
        <button onClick={() => router.push('/admin')} className="text-gray-400 mr-3 p-1 -ml-1">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1 flex flex-col items-center pr-7 min-w-0">
          <p className="text-white font-bold text-base truncate max-w-full">
            {username ? `@${username}` : (email || '...')}
          </p>
          {username && teamName && (
            <p className="text-gray-500 text-xs truncate max-w-full">{teamName}</p>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex bg-gray-900 border border-gray-700 rounded-xl p-1 mb-4">
          {(['players', 'matches'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-gray-600 text-white' : 'text-gray-500'}`}
            >
              {t === 'players' ? `選手 (${players.length})` : `試合 (${matches.length})`}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-500 text-sm text-center py-8">読み込み中...</p>}

        {!loading && tab === 'players' && (
          players.length === 0
            ? <p className="text-gray-600 text-sm text-center py-8">登録選手なし</p>
            : <div className="flex flex-col gap-2">
                {players.map(p => (
                  <div key={p.id} className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-8 text-right shrink-0">#{p.number}</span>
                    <span className="text-white text-sm">{p.name}</span>
                  </div>
                ))}
              </div>
        )}

        {!loading && tab === 'matches' && (
          matches.length === 0
            ? <p className="text-gray-600 text-sm text-center py-8">試合データなし</p>
            : <div className="flex flex-col gap-2">
                {matches.map(m => (
                  <div key={m.id} className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">{m.opponent || '対戦相手未設定'}</span>
                      {m.score && <span className="text-gray-300 text-sm font-bold">{m.score}</span>}
                    </div>
                    <div className="flex gap-3 mt-1">
                      {m.date && <span className="text-gray-600 text-xs">{m.date}</span>}
                      {m.formation && <span className="text-gray-600 text-xs">{m.formation}</span>}
                    </div>
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  )
}
