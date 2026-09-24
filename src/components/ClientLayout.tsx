'use client'
import { usePathname } from 'next/navigation'
import BottomNav from './BottomNav'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showNav = pathname !== '/login'

  return (
    <>
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden bg-black"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: showNav ? '3.5rem' : '0' }}
      >
        {children}
      </main>
      {showNav && <BottomNav />}
    </>
  )
}
