'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Mode = 'login' | 'signup' | 'forgot'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teamName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('メールアドレスまたはパスワードが違います'); setLoading(false); return }
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetch('/api/auth/cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: session.access_token }),
        })
        const adminRes = await fetch(`/api/admin/check?userId=${session.user.id}`)
        const adminJson = await adminRes.json()
        if (adminJson.admin) {
          router.push('/admin')
          return
        }
      }
      router.push('/')

    } else if (mode === 'signup') {
      // signUp でユーザー作成＆確認メール送信
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      // プロフィールをサーバー側で作成
      if (data.user) {
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create-profile', userId: data.user.id, teamName }),
        })
      }
      setMessage('確認メールを送りました。メールのリンクをクリックしてからログインしてください。')
      setMode('login')

    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/reset-password`,
      })
      if (error) { setError('送信に失敗しました'); setLoading(false); return }
      setMessage('パスワードリセットのメールを送りました。')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100svh', background: '#0a0a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <img src="/icon-192.png" alt="LineUp 8" style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 16 }} />
      <h1 style={{ color: 'white', fontWeight: 900, fontSize: 28, marginBottom: 4, textAlign: 'center' }}>LineUp 8</h1>
      <p style={{ color: '#7c3aed', fontSize: 13, marginBottom: 32, textAlign: 'center' }}>8人制サッカー スタメン管理</p>

      {mode !== 'forgot' && (
        <div style={{ display: 'flex', background: '#1a1a2e', borderRadius: 12, padding: 4, marginBottom: 24, width: '100%', maxWidth: 340 }}>
          <button onClick={() => { setMode('login'); setError(''); setMessage('') }} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: mode === 'login' ? '#7c3aed' : 'transparent', color: mode === 'login' ? 'white' : '#7c3aed', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            ログイン
          </button>
          <button onClick={() => { setMode('signup'); setError(''); setMessage('') }} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: mode === 'signup' ? '#7c3aed' : 'transparent', color: mode === 'signup' ? 'white' : '#7c3aed', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
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
        <input type="email" placeholder="メールアドレス" value={email} onChange={e => setEmail(e.target.value)} required
          style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #4c1d95', background: '#1a1a2e', color: 'white', fontSize: 15, outline: 'none' }} />
        {mode !== 'forgot' && (
          <input type="password" placeholder="パスワード" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #4c1d95', background: '#1a1a2e', color: 'white', fontSize: 15, outline: 'none' }} />
        )}

        {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}
        {message && <p style={{ color: '#34d399', fontSize: 13, textAlign: 'center' }}>{message}</p>}

        <button type="submit" disabled={loading}
          style={{ marginTop: 8, padding: '14px', borderRadius: 12, border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
          {mode === 'login' ? 'ログイン' : mode === 'signup' ? '登録する' : 'リセットメールを送る'}
        </button>
      </form>

      {mode === 'login' && (
        <button onClick={() => { setMode('forgot'); setError(''); setMessage('') }}
          style={{ marginTop: 16, background: 'none', border: 'none', color: '#7c3aed', fontSize: 13, cursor: 'pointer' }}>
          パスワードをお忘れですか？
        </button>
      )}
      {mode === 'forgot' && (
        <button onClick={() => { setMode('login'); setError(''); setMessage('') }}
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
