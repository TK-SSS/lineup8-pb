'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import BottomNav from './BottomNav'
import { storage } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

const UNAUTHED_PATHS = ['/login', '/privacy', '/terms', '/reset-password']

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const showNav = pathname !== '/login' && !pathname.startsWith('/admin')
  const isPublic = UNAUTHED_PATHS.some(p => pathname.startsWith(p))
  const [authed, setAuthed] = useState(isPublic)

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
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden bg-black"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: showNav ? 'calc(3.5rem + env(safe-area-inset-bottom))' : '0' }}
      >
        {children}
      </main>
      {showNav && <BottomNav />}
    </>
  )
}
