'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('パスワードが一致しません'); return }
    if (password.length < 6) { setError('パスワードは6文字以上にしてください'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError('変更に失敗しました'); setLoading(false); return }
    document.cookie = 'lineup8-auth=ok; path=/; max-age=2592000; SameSite=Lax'
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100svh', background: '#0a0a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <h1 style={{ color: 'white', fontWeight: 900, fontSize: 24, marginBottom: 8 }}>パスワード変更</h1>
      {!ready ? (
        <p style={{ color: '#7c3aed', fontSize: 14 }}>リンクを確認中...</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          <input type="password" placeholder="新しいパスワード" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #4c1d95', background: '#1a1a2e', color: 'white', fontSize: 15, outline: 'none' }} />
          <input type="password" placeholder="パスワード（確認）" value={confirm} onChange={e => setConfirm(e.target.value)} required
            style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #4c1d95', background: '#1a1a2e', color: 'white', fontSize: 15, outline: 'none' }} />
          {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ padding: '14px', borderRadius: 12, border: 'none', background: loading ? '#4c1d95' : '#7c3aed', color: 'white', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '...' : '変更する'}
          </button>
        </form>
      )}
    </div>
  )
}
