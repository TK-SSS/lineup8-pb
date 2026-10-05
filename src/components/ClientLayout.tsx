'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import BottomNav from './BottomNav'
import { storage, syncDirtyData } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

const UNAUTHED_PATHS = ['/login', '/privacy', '/terms', '/reset-password']

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const showNav = pathname !== '/login' && !pathname.startsWith('/admin') && !pathname.startsWith('/reset-password') && !pathname.startsWith('/privacy') && !pathname.startsWith('/terms')
  const isPublic = UNAUTHED_PATHS.some(p => pathname.startsWith(p))
  const [authed, setAuthed] = useState(isPublic)
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(navigator.onLine)
    const goOnline = () => { setOnline(true); syncDirtyData() }
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  useEffect(() => {
    if (isPublic) {
      setAuthed(true)
      return
    }
    setAuthed(false)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setAuthed(true)
        storage.pingActivity()
      }
    })
  }, [pathname])

  if (!authed) return null

  return (
    <>
      {!online && (
        <div style={{
          position: 'fixed', top: 'env(safe-area-inset-top)', left: 0, right: 0, zIndex: 200,
          background: '#374151', color: '#d1d5db', fontSize: 11, textAlign: 'center',
          padding: '3px 8px', letterSpacing: '0.02em',
        }}>
          オフライン — 変更はオンライン復帰後に自動同期されます
        </div>
      )}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden bg-black"
        style={{
          paddingTop: online ? 'env(safe-area-inset-top)' : 'calc(env(safe-area-inset-top) + 22px)',
          paddingBottom: showNav ? 'calc(3.5rem + env(safe-area-inset-bottom))' : '0',
        }}
      >
        {children}
      </main>
      {showNav && <BottomNav />}
    </>
  )
}
