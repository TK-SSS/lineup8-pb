'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Mode = 'login' | 'signup' | 'forgot'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function switchMode(m: Mode) {
    setMode(m)
    setError('')
    setMessage('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'login') {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'ログインに失敗しました'); setLoading(false); return }

      await supabase.auth.setSession(json.session)

      router.push(json.isAdmin ? '/admin' : '/')

    } else if (mode === 'signup') {
      if (!username.trim()) { setError('ユーザー名を入力してください'); setLoading(false); return }

      const checkRes = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-username', username }),
      })
      const checkJson = await checkRes.json()
      if (!checkJson.available) { setError('このユーザー名は使用されています'); setLoading(false); return }

      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }

      if (data.user) {
        const profileRes = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create-profile', userId: data.user.id, username, teamName: '' }),
        })
        const profileJson = await profileRes.json()
        if (!profileRes.ok) { setError(profileJson.error || '登録に失敗しました'); setLoading(false); return }
      }
      setMessage('確認メールを送りました。メールのリンクをクリックしてからログインしてください。')
      switchMode('login')
      setUsername('')
      setPassword('')

    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/reset-password`,
      })
      if (error) { setError('送信に失敗しました'); setLoading(false); return }
      setMessage('パスワードリセットのメールを送りました。')
    }
    setLoading(false)
  }

  const input: React.CSSProperties = { padding: '12px 16px', borderRadius: 12, border: '1px solid #4c1d95', background: '#1a1a2e', color: 'white', fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100svh', background: '#0a0a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <img src="/icon-192.png" alt="LineUp 8" style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 16 }} />
      <h1 style={{ color: 'white', fontWeight: 900, fontSize: 28, marginBottom: 4, textAlign: 'center' }}>LineUp 8</h1>
      <p style={{ color: '#7c3aed', fontSize: 13, marginBottom: 32, textAlign: 'center' }}>8人制サッカー スタメン管理</p>

      {mode !== 'forgot' && (
        <div style={{ display: 'flex', background: '#1a1a2e', borderRadius: 12, padding: 4, marginBottom: 24, width: '100%', maxWidth: 340 }}>
          <button onClick={() => switchMode('login')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: mode === 'login' ? '#7c3aed' : 'transparent', color: mode === 'login' ? 'white' : '#7c3aed', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            ログイン
          </button>
          <button onClick={() => switchMode('signup')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: mode === 'signup' ? '#7c3aed' : 'transparent', color: mode === 'signup' ? 'white' : '#7c3aed', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            新規登録
          </button>
        </div>
      )}

      {mode === 'forgot' && (
        <p style={{ color: '#a78bfa', fontSize: 14, marginBottom: 20, textAlign: 'center' }}>
          登録したメールアドレスを入力してください
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode !== 'forgot' && (
          <input
            type="text"
            placeholder={mode === 'login' ? 'ユーザー名' : 'ユーザー名（半角英数字）'}
            value={username}
            onChange={e => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
            required
            autoCapitalize="none"
            autoCorrect="off"
            style={input}
          />
        )}
        {(mode === 'signup' || mode === 'forgot') && (
          <input type="email" placeholder="メールアドレス" value={email} onChange={e => setEmail(e.target.value)} required style={input} />
        )}
        {mode !== 'forgot' && (
          <input type="password" placeholder="パスワード" value={password} onChange={e => setPassword(e.target.value)} required style={input} />
        )}

        {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}
        {message && <p style={{ color: '#34d399', fontSize: 13, textAlign: 'center' }}>{message}</p>}

        <button type="submit" disabled={loading}
          style={{ marginTop: 8, padding: '14px', borderRadius: 12, border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
          {mode === 'login' ? 'ログイン' : mode === 'signup' ? '登録する' : 'リセットメールを送る'}
        </button>
        {mode === 'signup' && (
          <p style={{ fontSize: 11, color: '#6d28d9', textAlign: 'center', lineHeight: 1.8 }}>
            ※18歳未満の方は保護者の同意が必要です<br />
            登録することで
            <a href="/privacy" style={{ color: '#7c3aed', textDecoration: 'underline' }}>プライバシーポリシー</a>
            および
            <a href="/terms" style={{ color: '#7c3aed', textDecoration: 'underline' }}>利用規約</a>
            に同意したことになります
          </p>
        )}
      </form>

      {mode === 'login' && (
        <button onClick={() => switchMode('forgot')}
          style={{ marginTop: 16, background: 'none', border: 'none', color: '#7c3aed', fontSize: 13, cursor: 'pointer' }}>
          パスワードをお忘れですか？
        </button>
      )}
      {mode === 'forgot' && (
        <button onClick={() => switchMode('login')}
          style={{ marginTop: 16, background: 'none', border: 'none', color: '#7c3aed', fontSize: 13, cursor: 'pointer' }}>
          ← ログインに戻る
        </button>
      )}

      <p style={{ marginTop: 32, color: '#4c1d95', fontSize: 11, textAlign: 'center' }}>
        <a href="/privacy" style={{ color: '#6d28d9', textDecoration: 'none' }}>プライバシーポリシー</a>
        {' '}・{' '}
        <a href="/terms" style={{ color: '#6d28d9', textDecoration: 'none' }}>利用規約</a>
      </p>
    </div>
  )
}
