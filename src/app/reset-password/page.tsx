'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const POLICY = [
  { label: '8文字以上', test: (p: string) => p.length >= 8 },
  { label: '英字を含む', test: (p: string) => /[a-zA-Z]/.test(p) },
  { label: '数字を含む', test: (p: string) => /[0-9]/.test(p) },
]

function policyValid(p: string) { return POLICY.every(r => r.test(p)) }

function PasswordPolicy({ password, show }: { password: string; show: boolean }) {
  if (!show) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 12px', background: '#0d0d1f', borderRadius: 10, border: '1px solid #2d1b69' }}>
      {POLICY.map(r => {
        const ok = r.test(password)
        return (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ color: ok ? '#34d399' : '#6b7280', fontSize: 14, lineHeight: 1 }}>{ok ? '✓' : '✗'}</span>
            <span style={{ color: ok ? '#34d399' : '#6b7280' }}>{r.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [pwTouched, setPwTouched] = useState(false)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    async function init() {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')

      if (accessToken && refreshToken && type === 'recovery') {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (!error) {
          setReady(true)
          window.history.replaceState(null, '', window.location.pathname)
          return
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) { setReady(true); return }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true)
      })
      unsubscribe = () => subscription.unsubscribe()
    }

    init()
    return () => unsubscribe?.()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!policyValid(password)) { setError('パスワードポリシーを満たしていません'); return }
    if (password !== confirm) { setError('パスワードが一致しません'); return }
    setLoading(true)
    setError('')

    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) { setError('変更に失敗しました'); setLoading(false); return }

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await fetch('/api/auth/cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: session.access_token }),
      })
    }
    router.push('/')
  }

  const inputStyle: React.CSSProperties = {
    padding: '12px 16px', borderRadius: 12, border: '1px solid #4c1d95',
    background: '#1a1a2e', color: 'white', fontSize: 16, outline: 'none', width: '100%', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100svh', background: '#0a0a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <h1 style={{ color: 'white', fontWeight: 900, fontSize: 24, marginBottom: 8 }}>パスワード変更</h1>
      {!ready ? (
        <p style={{ color: '#7c3aed', fontSize: 14 }}>リンクを確認中...</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
          <input type="password" placeholder="新しいパスワード" value={password}
            onChange={e => { setPassword(e.target.value); setPwTouched(true) }}
            required style={inputStyle} />
          <PasswordPolicy password={password} show={pwTouched} />
          <input type="password" placeholder="パスワード（確認）" value={confirm}
            onChange={e => setConfirm(e.target.value)} required style={inputStyle} />
          {confirm && password !== confirm && (
            <p style={{ color: '#f87171', fontSize: 12, margin: '-4px 0 0 4px' }}>パスワードが一致しません</p>
          )}
          {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}
          <button type="submit" disabled={loading || !policyValid(password) || password !== confirm} style={{
            padding: '14px', borderRadius: 12, border: 'none', marginTop: 4,
            background: (!policyValid(password) || password !== confirm) ? '#2d1b69' : loading ? '#4c1d95' : '#7c3aed',
            color: 'white', fontWeight: 700, fontSize: 16,
            cursor: (loading || !policyValid(password) || password !== confirm) ? 'not-allowed' : 'pointer',
            opacity: (!policyValid(password) || password !== confirm) ? 0.5 : 1,
          }}>
            {loading ? '変更中...' : '変更する'}
          </button>
        </form>
      )}
    </div>
  )
}
