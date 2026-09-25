'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { THEMES, type ThemeId, applyTheme, getSavedTheme } from '@/lib/theme'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [teamName, setTeamName] = useState('')
  const [teamNameDraft, setTeamNameDraft] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('violet')
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSending, setFeedbackSending] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  useEffect(() => {
    setCurrentTheme(getSavedTheme())
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setEmail(session.user.email ?? '')
      setUserId(session.user.id)
      const [authRes, adminRes] = await Promise.all([
        fetch(`/api/auth?userId=${session.user.id}`),
        fetch(`/api/admin/check?userId=${session.user.id}`),
      ])
      const json = await authRes.json()
      if (json.team_name !== undefined) {
        setTeamName(json.team_name)
        setTeamNameDraft(json.team_name)
      }
      const adminJson = await adminRes.json()
      setIsAdmin(adminJson.admin === true)
    }
    load()
  }, [])

  async function saveTeamName() {
    setSaving(true)
    setMessage('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { error } = await supabase.from('profiles').upsert({ id: session.user.id, team_name: teamNameDraft.trim() }, { onConflict: 'id' })
    if (!error) { setTeamName(teamNameDraft.trim()); setMessage('保存しました') }
    setSaving(false)
  }

  function handleThemeChange(id: ThemeId) {
    setCurrentTheme(id)
    applyTheme(id)
  }

  async function handleFeedbackSend() {
    if (!feedbackText.trim() || !userId) return
    setFeedbackSending(true)
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message: feedbackText }),
    })
    const json = await res.json()
    if (json.ok) {
      setFeedbackText('')
      setFeedbackMessage('送信しました。ありがとうございます！')
      setTimeout(() => setFeedbackMessage(''), 3000)
    }
    setFeedbackSending(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    document.cookie = 'lineup8-auth=; path=/; max-age=0'
    router.push('/login')
  }

  async function handleDeleteAccount() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', userId: session.user.id }),
    })
    document.cookie = 'lineup8-auth=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-black text-white pb-4">
      <div className="bg-violet-600 px-4 py-4 flex items-center mb-6">
        <h1 className="flex-1 text-white font-bold text-xl text-center">設定</h1>
      </div>
      <div className="px-4">

      {/* チーム名 */}
      <div className="bg-violet-950/50 border border-violet-800/40 rounded-xl p-4 mb-3">
        <p className="text-violet-400 text-xs mb-2">チーム名</p>
        <input
          value={teamNameDraft}
          onChange={e => setTeamNameDraft(e.target.value)}
          className="w-full bg-transparent text-white text-base outline-none border-b border-violet-700 pb-1 mb-3"
          placeholder="チーム名を入力"
        />
        {message && <p className="text-emerald-400 text-xs mb-2">{message}</p>}
        <button
          onClick={saveTeamName}
          disabled={saving || teamNameDraft.trim() === teamName}
          className="text-sm text-violet-300 border border-violet-600 rounded-lg px-4 py-1.5 disabled:opacity-40"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      {/* テーマカラー */}
      <div className="bg-violet-950/50 border border-violet-800/40 rounded-xl p-4 mb-3">
        <p className="text-violet-400 text-xs mb-3">テーマカラー</p>
        <div className="flex flex-wrap gap-3">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id as ThemeId)}
              className="flex flex-col items-center gap-1.5"
              title={t.label}
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: t.oklch,
                  boxShadow: currentTheme === t.id ? `0 0 0 3px white` : 'none',
                  outline: currentTheme === t.id ? '3px solid transparent' : 'none',
                }}
              >
                {currentTheme === t.id && (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span className="text-xs text-violet-300">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* メールアドレス */}
      <div className="bg-violet-950/50 border border-violet-800/40 rounded-xl p-4 mb-3">
        <p className="text-violet-400 text-xs mb-1">メールアドレス</p>
        <p className="text-white text-sm">{email}</p>
      </div>

      {/* 管理画面（管理者のみ） */}
      {isAdmin && (
        <Link
          href="/admin"
          className="w-full flex items-center gap-3 px-4 py-4 bg-violet-950/50 border border-violet-600/60 rounded-xl text-left text-violet-300 hover:bg-violet-900/30 transition-colors mb-3"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          管理画面
          <svg className="w-4 h-4 ml-auto text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      )}

      {/* 使い方 */}
      <Link
        href="/help"
        className="w-full flex items-center gap-3 px-4 py-4 bg-violet-950/50 border border-violet-800/40 rounded-xl text-left text-violet-300 hover:bg-violet-900/30 transition-colors mb-3"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        使い方
        <svg className="w-4 h-4 ml-auto text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>

      {/* ログアウト */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-4 bg-violet-950/50 border border-violet-800/40 rounded-xl text-left text-violet-300 hover:bg-violet-900/30 transition-colors mb-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        ログアウト
      </button>

      {/* アカウント削除 */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="w-full flex items-center gap-3 px-4 py-4 bg-red-950/30 border border-red-900/40 rounded-xl text-left text-red-400 hover:bg-red-950/50 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
        アカウント削除
      </button>

      {/* フィードバック */}
      <div className="bg-violet-950/50 border border-violet-800/40 rounded-xl p-4 mt-3">
        <p className="text-violet-400 text-xs mb-2">フィードバック・ご意見</p>
        <textarea
          value={feedbackText}
          onChange={e => setFeedbackText(e.target.value)}
          placeholder="ご意見・ご要望・不具合の報告など"
          rows={3}
          className="w-full bg-transparent text-white text-sm outline-none border border-violet-700 rounded-lg p-3 placeholder-violet-600 resize-none mb-2"
        />
        {feedbackMessage && <p className="text-emerald-400 text-xs mb-2">{feedbackMessage}</p>}
        <button
          onClick={handleFeedbackSend}
          disabled={feedbackSending || !feedbackText.trim()}
          className="text-sm text-violet-300 border border-violet-600 rounded-lg px-4 py-1.5 disabled:opacity-40"
        >
          {feedbackSending ? '送信中...' : '送信'}
        </button>
      </div>

      {/* バージョン・著作権 */}
      <div className="mt-6 mb-2 text-center">
        <p className="text-violet-700 text-xs">LineUp 8 v1.0.0</p>
        <p className="text-violet-800 text-xs mt-1">© 2026 LineUp 8</p>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-6">
          <div className="bg-violet-950 border border-violet-600 rounded-2xl p-6 w-full max-w-xs">
            <p className="text-white font-bold text-center mb-2">アカウントを削除しますか？</p>
            <p className="text-violet-400 text-sm text-center mb-6">すべてのデータが削除されます。この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-violet-600 text-violet-300 text-sm font-bold">
                キャンセル
              </button>
              <button onClick={handleDeleteAccount}
                className="flex-1 py-3 rounded-xl bg-red-700 text-white text-sm font-bold">
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
