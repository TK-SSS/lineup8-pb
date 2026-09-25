'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { storage } from '@/lib/storage'
import { THEMES, type ThemeId, applyTheme, getSavedTheme } from '@/lib/theme'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [teamName, setTeamName] = useState('')
  const [teamNameDraft, setTeamNameDraft] = useState('')
  const [username, setUsername] = useState('')
  const [usernameDraft, setUsernameDraft] = useState('')
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameMessage, setUsernameMessage] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('violet')
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState('')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSending, setFeedbackSending] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

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
      if (json.username !== undefined) {
        setUsername(json.username)
        setUsernameDraft(json.username)
      }
      const adminJson = await adminRes.json()
      setIsAdmin(adminJson.admin === true)
    }
    load()
  }, [])

  async function saveUsername() {
    setUsernameSaving(true)
    setUsernameMessage('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const val = usernameDraft.trim().toLowerCase()
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: session.user.id, username: val }, { onConflict: 'id' })
    if (error) {
      setUsernameMessage(error.code === '23505' ? 'このユーザー名は使用されています' : '保存に失敗しました')
    } else {
      setUsername(val)
      setUsernameMessage('保存しました')
    }
    setUsernameSaving(false)
  }

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

  async function handlePasswordChange() {
    if (newPassword !== confirmPassword) { setPasswordMessage('パスワードが一致しません'); return }
    if (newPassword.length < 8) { setPasswordMessage('8文字以上で入力してください'); return }
    setPasswordSaving(true)
    setPasswordMessage('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordMessage('変更に失敗しました')
    } else {
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage('パスワードを変更しました')
      setTimeout(() => setPasswordMessage(''), 3000)
    }
    setPasswordSaving(false)
  }

  async function handleFeedbackSend() {
    if (!feedbackText.trim() || !userId) return
    setFeedbackSending(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
      },
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

  function downloadCsv(filename: string, rows: string[]) {
    const bom = '﻿'
    const blob = new Blob([bom + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleExportPlayers() {
    const players = await storage.loadPlayers()
    const rows = ['背番号,名前', ...players.map(p => `${p.number},${p.name}`)]
    downloadCsv('lineup8-players.csv', rows)
  }

  async function handleExportMatches() {
    const matches = await storage.loadMatches()
    const rows = [
      '日付,時刻,対戦相手,フォーメーション,得点,失点,メモ',
      ...matches.map(m =>
        `${m.date},${m.time},"${m.opponent}",${m.formation},${m.scoreUs ?? ''},${m.scoreOpp ?? ''},"${m.memo ?? ''}"`
      ),
    ]
    downloadCsv('lineup8-matches.csv', rows)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    await fetch('/api/auth/cookie', { method: 'DELETE' })
    router.push('/login')
  }

  async function handleDeleteAccount() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action: 'delete', userId: session.user.id }),
    })
    await fetch('/api/auth/cookie', { method: 'DELETE' })
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
        <div className="flex items-center gap-2 border-b border-violet-700 pb-1">
          <input
            value={teamNameDraft}
            onChange={e => setTeamNameDraft(e.target.value)}
            className="flex-1 bg-transparent text-white text-base outline-none"
            placeholder="チーム名を入力"
          />
          <button
            onClick={saveTeamName}
            disabled={saving || teamNameDraft.trim() === teamName}
            className="text-sm text-violet-300 border border-violet-600 rounded-lg px-3 py-1 disabled:opacity-40 shrink-0"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
        {message && <p className="text-emerald-400 text-xs mt-2">{message}</p>}
      </div>

      {/* ユーザー名 */}
      <div className="bg-violet-950/50 border border-violet-800/40 rounded-xl p-4 mb-3">
        <p className="text-violet-400 text-xs mb-2">ユーザー名（ログインに使用）</p>
        <div className="flex items-center gap-2 border-b border-violet-700 pb-1">
          <input
            value={usernameDraft}
            onChange={e => setUsernameDraft(e.target.value.replace(/\s/g, '').toLowerCase())}
            className="flex-1 bg-transparent text-white text-base outline-none"
            placeholder="ユーザー名を入力"
            autoCapitalize="none"
            autoCorrect="off"
          />
          <button
            onClick={saveUsername}
            disabled={usernameSaving || usernameDraft.trim() === username || !usernameDraft.trim()}
            className="text-sm text-violet-300 border border-violet-600 rounded-lg px-3 py-1 disabled:opacity-40 shrink-0"
          >
            {usernameSaving ? '保存中...' : '保存'}
          </button>
        </div>
        {usernameMessage && (
          <p className={`text-xs mt-2 ${usernameMessage.includes('使用') || usernameMessage.includes('失敗') ? 'text-red-400' : 'text-emerald-400'}`}>
            {usernameMessage}
          </p>
        )}
      </div>

      {/* テーマカラー */}
      <div className="bg-violet-950/50 border border-violet-800/40 rounded-xl p-4 mb-3">
        <p className="text-violet-400 text-xs mb-3">テーマカラー</p>
        <div className="flex">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id as ThemeId)}
              className="flex-1 flex flex-col items-center gap-1.5"
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

      {/* パスワード変更 */}
      <div className="bg-violet-950/50 border border-violet-800/40 rounded-xl mt-3 overflow-hidden">
        <button
          onClick={() => setPasswordOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-4 text-left"
        >
          <span className="text-violet-300 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            パスワード変更
          </span>
          <svg
            className="w-4 h-4 text-violet-600 transition-transform duration-200 shrink-0"
            style={{ transform: passwordOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        {passwordOpen && (
          <div className="px-4 pb-4 border-t border-violet-800/40 pt-3 flex flex-col gap-2">
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="新しいパスワード（8文字以上）"
              className="w-full bg-transparent text-white text-sm outline-none border border-violet-700 rounded-lg p-3 placeholder-violet-600"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="確認（再入力）"
              className="w-full bg-transparent text-white text-sm outline-none border border-violet-700 rounded-lg p-3 placeholder-violet-600"
            />
            {passwordMessage && (
              <p className={`text-xs ${passwordMessage.includes('失敗') || passwordMessage.includes('一致') || passwordMessage.includes('8文字') ? 'text-red-400' : 'text-emerald-400'}`}>
                {passwordMessage}
              </p>
            )}
            <button
              onClick={handlePasswordChange}
              disabled={passwordSaving || !newPassword || newPassword !== confirmPassword}
              className="text-sm text-violet-300 border border-violet-600 rounded-lg px-4 py-1.5 disabled:opacity-40 self-start"
            >
              {passwordSaving ? '変更中...' : '変更する'}
            </button>
          </div>
        )}
      </div>

      {/* フィードバック */}
      <div className="bg-violet-950/50 border border-violet-800/40 rounded-xl mt-3 overflow-hidden">
        <button
          onClick={() => setFeedbackOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-4 text-left"
        >
          <span className="text-violet-300 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            フィードバック・ご意見
          </span>
          <svg
            className="w-4 h-4 text-violet-600 transition-transform duration-200 shrink-0"
            style={{ transform: feedbackOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        {feedbackOpen && (
          <div className="px-4 pb-4 border-t border-violet-800/40 pt-3">
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
        )}
      </div>

      {/* データエクスポート */}
      <div className="bg-violet-950/50 border border-violet-800/40 rounded-xl p-4 mt-3">
        <p className="text-violet-400 text-xs mb-3">データをエクスポート（CSV）</p>
        <div className="flex gap-2">
          <button
            onClick={handleExportPlayers}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-violet-300 border border-violet-700 rounded-lg hover:bg-violet-900/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 3 17 8 12 8" />
            </svg>
            選手リスト
          </button>
          <button
            onClick={handleExportMatches}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-violet-300 border border-violet-700 rounded-lg hover:bg-violet-900/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 3 17 8 12 8" />
            </svg>
            試合リスト
          </button>
        </div>
      </div>

      {/* プライバシーポリシー・利用規約 */}
      <div className="flex gap-2 mt-3 mb-3">
        <Link href="/privacy" className="flex-1 flex items-center justify-center px-3 py-3 bg-violet-950/50 border border-violet-800/40 rounded-xl text-violet-400 text-xs hover:bg-violet-900/30 transition-colors">
          プライバシーポリシー
        </Link>
        <Link href="/terms" className="flex-1 flex items-center justify-center px-3 py-3 bg-violet-950/50 border border-violet-800/40 rounded-xl text-violet-400 text-xs hover:bg-violet-900/30 transition-colors">
          利用規約
        </Link>
      </div>

      {/* アカウント削除 */}
      <button
        onClick={() => { setShowDeleteConfirm(true); setDeleteConfirmText('') }}
        className="w-full flex items-center gap-3 px-4 py-4 bg-red-950/30 border border-red-900/40 rounded-xl text-left text-red-400 hover:bg-red-950/50 transition-colors mb-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
        アカウント削除
      </button>

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
            <p className="text-violet-400 text-sm text-center mb-4">すべてのデータが削除されます。この操作は取り消せません。</p>
            <p className="text-violet-500 text-xs text-center mb-2">確認のため「削除する」と入力してください</p>
            <input
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="削除する"
              className="w-full bg-transparent text-white text-sm text-center outline-none border border-violet-700 rounded-lg p-2 mb-4 placeholder-violet-800"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-violet-600 text-violet-300 text-sm font-bold">
                キャンセル
              </button>
              <button onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== '削除する'}
                className="flex-1 py-3 rounded-xl bg-red-700 text-white text-sm font-bold disabled:opacity-30">
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
