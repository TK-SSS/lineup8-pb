'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import BottomNav from './BottomNav'
import { storage } from '@/lib/storage'

const UNAUTHED_PATHS = ['/login', '/privacy', '/terms', '/reset-password']

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showNav = pathname !== '/login' && !pathname.startsWith('/admin')

  useEffect(() => {
    if (!UNAUTHED_PATHS.some(p => pathname.startsWith(p))) {
      storage.pingActivity()
    }
  }, [])

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
