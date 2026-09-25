import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 日本からのアクセスのみ許可
  const country = request.headers.get('x-vercel-ip-country')
  if (country && country !== 'JP') {
    return new NextResponse('このサービスは日本国内からのみご利用いただけます。', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const auth = request.cookies.get('lineup8-auth')?.value
  const { pathname } = request.nextUrl

  if (pathname === '/login' || pathname === '/reset-password') return NextResponse.next()

  if (auth !== 'ok') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/admin')) {
    const adminCookie = request.cookies.get('lineup8-admin')?.value
    if (adminCookie !== 'ok') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|api/auth|privacy|terms|.*\\.png|.*\\.ico|.*\\.svg|.*\\.webmanifest).*)'],
}
