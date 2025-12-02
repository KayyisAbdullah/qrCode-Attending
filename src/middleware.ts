import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Get auth token and role from cookies
  const authToken = request.cookies.get('authToken')?.value
  const userRole = request.cookies.get('userRole')?.value
  
  // Protect dashboard/student routes - hanya student yang bisa akses
  if (pathname.startsWith('/dashboard/student') && (!authToken || userRole !== 'student')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Protect dashboard/admin routes - hanya admin yang bisa akses
  if (pathname.startsWith('/dashboard/admin') && (!authToken || userRole !== 'admin')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect /scan-qr - hanya student
  if (pathname === '/scan-qr' && (!authToken || userRole !== 'student')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/scan-qr'
  ]
}
