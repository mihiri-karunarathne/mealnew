import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const session  = req.cookies.get('de_session')?.value
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/login') && session)
    return NextResponse.redirect(new URL('/admin', req.url))

  if (pathname.startsWith('/admin') && !session)
    return NextResponse.redirect(new URL('/login', req.url))

  return NextResponse.next()
}

export const config = { matcher: ['/login', '/admin/:path*'] }