'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('メールアドレスまたはパスワードが違います'); setLoading(false); return }
      document.cookie = 'lineup8-auth=ok; path=/; max-age=2592000; SameSite=Lax'
      router.push('/')
    } else {
      if (!teamName.trim()) { setError('チーム名を入力してください'); setLoading(false); return }
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email, password, teamName }),
      })
      const json = await res.json()
      if (json.error) { setError(json.error); setLoading(false); return }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('登録しました。ログインしてください'); setLoading(false); return }
      document.cookie = 'lineup8-auth=ok; path=/; max-age=2592000; SameSite=Lax'
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100svh', background: '#0a0a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <img src="/icon-192.png" alt="LineUp 8" style={{ width: 80, height: 80, borderRadius: 16, display: 'block', margin: '0 auto 16px' }} />
      <h1 style={{ color: 'white', fontWeight: 900, fontSize: 28, marginBottom: 4, textAlign: 'center' }}>LineUp 8</h1>
      <p style={{ color: '#7c3aed', fontSize: 13, marginBottom: 32, textAlign: 'center' }}>8人制サッカー スタメン管理</p>

      {/* モード切替 */}
      <div style={{ display: 'flex', background: '#1a1a2e', borderRadius: 12, padding: 4, marginBottom: 24, width: '100%', maxWidth: 340 }}>
        <button onClick={() => setMode('login')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: mode === 'login' ? '#7c3aed' : 'transparent', color: mode === 'login' ? 'white' : '#7c3aed', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          ログイン
        </button>
        <button onClick={() => setMode('signup')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: mode === 'signup' ? '#7c3aed' : 'transparent', color: mode === 'signup' ? 'white' : '#7c3aed', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          新規登録
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="チーム名"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            required
            style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #4c1d95', background: '#1a1a2e', color: 'white', fontSize: 15, outline: 'none' }}
          />
        )}
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #4c1d95', background: '#1a1a2e', color: 'white', fontSize: 15, outline: 'none' }}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #4c1d95', background: '#1a1a2e', color: 'white', fontSize: 15, outline: 'none' }}
        />
        {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: 8, padding: '14px', borderRadius: 12, border: 'none', background: loading ? '#4c1d95' : '#7c3aed', color: 'white', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? '...' : mode === 'login' ? 'ログイン' : '登録する'}
        </button>
      </form>
    </div>
  )
}
