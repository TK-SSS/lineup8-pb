'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const path = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-violet-500/50 flex">
      <Link
        href="/matches"
        className={`flex-1 flex flex-col items-center pt-0.5 pb-0 gap-0.5 text-sm transition-colors ${
          path === '/matches' ? 'text-violet-400' : 'text-violet-700 hover:text-violet-500'
        }`}
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h2M8 18h2M12 14h4M12 18h4" />
        </svg>
      </Link>
      <Link
        href="/"
        className={`flex-1 flex flex-col items-center pt-0.5 pb-0 gap-0.5 transition-colors ${
          path === '/' ? 'text-violet-400' : 'text-violet-700 hover:text-violet-500'
        }`}
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="1.5" />
          <path d="M6 2 A6 6 0 0 0 18 2" />
          <path d="M4 21 L4 13 L20 13 L20 21" />
          <path d="M8 21 L8 17 L16 17 L16 21" />
        </svg>
      </Link>
      <Link
        href="/players"
        className={`flex-1 flex flex-col items-center pt-0.5 pb-0 gap-0.5 transition-colors ${
          path === '/players' ? 'text-violet-400' : 'text-violet-700 hover:text-violet-500'
        }`}
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </Link>
      <button
        onClick={() => window.location.reload()}
        className="flex-1 flex flex-col items-center pt-0.5 pb-0 gap-0.5 transition-colors text-violet-700 hover:text-violet-500 active:text-violet-400"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </nav>
  )
}
