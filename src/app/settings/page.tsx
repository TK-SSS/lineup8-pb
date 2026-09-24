'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    document.cookie = 'lineup8-auth=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-6 pb-4">
      <h1 className="text-xl font-bold text-violet-300 mb-6">設定</h1>

      <div className="space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 bg-violet-950/50 border border-violet-800/40 rounded-xl text-left text-red-400 hover:bg-red-950/30 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          ログアウト
        </button>
      </div>
    </div>
  )
}
