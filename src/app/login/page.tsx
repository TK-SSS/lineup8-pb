'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.replace('/')
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-xs">
        {/* Logo / title */}
        <div className="text-center mb-8">
          <img src="/icon-192.png" alt="LineUp 8" style={{ width: 80, height: 80, borderRadius: 16, display: 'block', margin: '0 auto 16px' }} />
          <h1 className="text-2xl font-black text-white">LineUp 8</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="パスワード"
              autoComplete="current-password"
              className="w-full bg-violet-950 border border-violet-700 text-white placeholder-violet-500 rounded-xl px-4 py-3.5 text-base outline-none focus:border-violet-400 transition-colors"
            />
            {error && (
              <p className="text-red-400 text-sm mt-2 text-center">パスワードが違います</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3.5 bg-violet-500 text-white font-bold rounded-xl text-base active:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? '…' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
