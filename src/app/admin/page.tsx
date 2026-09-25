'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type User = {
  id: string
  email: string
  created_at: string
  team_name: string
  last_active_at: string | null
}

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 9999
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function activityBadge(days: number) {
  if (days <= 30) return { label: 'アクティブ', color: '#059669', bg: '#d1fae5' }
  if (days <= 90) return { label: `${days}日前`, color: '#d97706', bg: '#fef3c7' }
  if (days <= 180) return { label: `${days}日前`, color: '#dc2626', bg: '#fee2e2' }
  return { label: `${days}日前`, color: '#991b1b', bg: '#fca5a5' }
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)
      fetch(`/api/admin/users?userId=${session.user.id}`)
        .then(r => r.json())
        .then(json => {
          if (json.error) { setError(json.error); return }
          setUsers(json.users)
        })
        .catch(() => setError('取得に失敗しました'))
        .finally(() => setLoading(false))
    })
  }, [router])

  async function handleDelete() {
    if (!deleteTarget || !userId) return
    setDeleting(true)
    const res = await fetch(`/api/admin/users?userId=${userId}&targetId=${deleteTarget.id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.ok) {
      setUsers(u => u.filter(x => x.id !== deleteTarget.id))
      setDeleteTarget(null)
    } else {
      alert('削除に失敗しました: ' + json.error)
    }
    setDeleting(false)
  }

  const filtered = users.filter(u =>
    u.email.includes(search) || u.team_name.includes(search)
  )

  const activeCount = users.filter(u => daysSince(u.last_active_at) <= 30).length
  const pendingDelete = users.filter(u => daysSince(u.last_active_at) > 150).length

  return (
    <div className="min-h-screen bg-black text-white pb-8">
      <div className="bg-violet-600 px-4 py-4 flex items-center">
        <button onClick={() => router.push('/')} className="text-white/80 mr-3 p-1 -ml-1">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="flex-1 text-white font-bold text-xl text-center pr-7">管理画面</h1>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '総ユーザー', value: users.length, color: 'text-violet-300' },
            { label: 'アクティブ（30日）', value: activeCount, color: 'text-emerald-400' },
            { label: '削除予定（150日+）', value: pendingDelete, color: 'text-rose-400' },
          ].map(s => (
            <div key={s.label} className="bg-violet-950/50 border border-violet-800/40 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{loading ? '–' : s.value}</div>
              <div className="text-violet-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <input
          type="text"
          placeholder="メール・チーム名で検索"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-violet-950/50 border border-violet-800/40 rounded-xl px-4 py-3 text-sm text-white placeholder-violet-500 outline-none"
        />

        {loading && <p className="text-violet-400 text-sm text-center py-8">読み込み中...</p>}
        {error && <p className="text-rose-400 text-sm text-center py-4">{error}</p>}

        {!loading && filtered.map(u => {
          const days = daysSince(u.last_active_at)
          const badge = activityBadge(days)
          return (
            <div key={u.id} className="bg-violet-950/50 border border-violet-800/40 rounded-xl px-4 py-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.email}</p>
                  <p className="text-violet-400 text-xs">{u.team_name || '（チーム名なし）'}</p>
                </div>
                <button
                  onClick={() => setDeleteTarget(u)}
                  className="text-rose-500 p-1 shrink-0"
                  aria-label="削除"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6l-1 14H6L5 6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className="px-2 py-0.5 rounded-full font-medium"
                  style={{ color: badge.color, background: badge.bg }}
                >
                  {badge.label}
                </span>
                <span className="text-violet-500">登録: {new Date(u.created_at).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          )
        })}

        {!loading && filtered.length === 0 && !error && (
          <p className="text-violet-500 text-sm text-center py-8">ユーザーが見つかりません</p>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-6">
          <div className="bg-violet-950 border border-violet-600 rounded-2xl p-6 w-full max-w-xs">
            <p className="text-white font-bold text-center text-base mb-2">アカウントを削除しますか？</p>
            <p className="text-rose-400 text-sm text-center mb-1">{deleteTarget.email}</p>
            <p className="text-violet-400 text-xs text-center mb-6">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm text-violet-400 bg-violet-900/40"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 active:bg-rose-500"
              >
                {deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
