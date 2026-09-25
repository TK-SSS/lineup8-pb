'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Feedback = {
  id: string
  email: string
  message: string
  read: boolean
  created_at: string
}

export default function FeedbacksPage() {
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread'>('unread')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)
      fetch(`/api/feedback?adminId=${session.user.id}`)
        .then(r => r.json())
        .then(json => {
          if (json.error) { router.push('/admin'); return }
          setFeedbacks(json.feedbacks)
        })
        .finally(() => setLoading(false))
    })
  }, [router])

  async function markRead(id: string) {
    await fetch('/api/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: userId, id }),
    })
    setFeedbacks(f => f.map(x => x.id === id ? { ...x, read: true } : x))
  }

  const filtered = filter === 'unread' ? feedbacks.filter(f => !f.read) : feedbacks
  const unreadCount = feedbacks.filter(f => !f.read).length

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-8">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-5 flex items-center">
        <button onClick={() => router.push('/admin')} className="text-gray-400 mr-3 p-1 -ml-1">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="flex-1 text-white font-bold text-xl text-center pr-7">フィードバック</h1>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        <div className="flex bg-gray-900 border border-gray-700 rounded-xl p-1">
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread' ? 'bg-gray-600 text-white' : 'text-gray-500'}`}
          >
            未読 {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">{unreadCount}</span>}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-gray-600 text-white' : 'text-gray-500'}`}
          >
            すべて ({feedbacks.length})
          </button>
        </div>

        {loading && <p className="text-gray-500 text-sm text-center py-8">読み込み中...</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-8">
            {filter === 'unread' ? '未読のフィードバックはありません' : 'フィードバックはありません'}
          </p>
        )}

        {!loading && filtered.map(f => (
          <div key={f.id} className={`border rounded-xl px-4 py-3 flex flex-col gap-2 ${f.read ? 'bg-gray-900 border-gray-700' : 'bg-gray-800 border-gray-500'}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-400 text-xs truncate">{f.email}</span>
              <div className="flex items-center gap-2 shrink-0">
                {!f.read && <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />}
                <span className="text-gray-600 text-xs">{new Date(f.created_at).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{f.message}</p>
            {!f.read && (
              <button
                onClick={() => markRead(f.id)}
                className="self-end text-xs text-gray-500 border border-gray-700 rounded-lg px-3 py-1"
              >
                既読にする
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
