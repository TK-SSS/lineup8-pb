import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('lineup8-auth')?.value
  const { pathname } = request.nextUrl

  if (pathname === '/login') return NextResponse.next()

  if (auth !== 'ok') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|api/auth|.*\\.png|.*\\.ico|.*\\.svg|.*\\.webmanifest).*)'],
}
