import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Mock data for Netlify (file system not available in serverless)
const MOCK_ADMINS = [
  { id: '1', username: 'admin', password: '$2a$10$8qvvP.d3CZaZdXuDUIuveOvGLqS4fWI5ydNuNpkWaL2g6r4PdJTCi', name: 'Administrator', email: 'admin@school.com' },
]

export async function POST(request: NextRequest) {
  try {
    let body: any = {}
    try {
      body = await request.json()
    } catch (parseError) {
      console.log('[ADMIN_LOGIN] JSON parse error:', parseError)
      return NextResponse.json(
        { message: 'Invalid request body', success: false },
        { status: 400 }
      )
    }

    const { username, password } = body
    console.log('[ADMIN_LOGIN] Attempt:', { username })

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username dan password harus diisi', success: false },
        { status: 400 }
      )
    }

    let admin: any = null

    // Try database first, fallback to mock data
    try {
      admin = await db.admin.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          password: true,
          name: true,
          email: true
        }
      })
    } catch (dbError) {
      console.log('[ADMIN_LOGIN] Database error, using mock data:', dbError)
      // Fallback to mock data for Netlify/serverless
      admin = MOCK_ADMINS.find(a => a.username === username) || null
    }

    if (!admin) {
      console.log('[ADMIN_LOGIN] Admin not found:', username)
      return NextResponse.json(
        { message: 'Username atau password salah', success: false },
        { status: 401 }
      )
    }

    console.log('[ADMIN_LOGIN] Admin found, checking password')
    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password)
    console.log('[ADMIN_LOGIN] Password valid:', isValidPassword)

    if (!isValidPassword) {
      console.log('[ADMIN_LOGIN] Invalid password for:', username)
      return NextResponse.json(
        { message: 'Username atau password salah', success: false },
        { status: 401 }
      )
    }

    // Create a simple token (in production, use JWT)
    const token = Buffer.from(JSON.stringify({
      id: admin.id,
      username: admin.username,
      role: 'admin',
      iat: Date.now()
    })).toString('base64')

    // Remove password from response
    const { password: _, ...adminData } = admin

    const response = NextResponse.json({
      message: 'Login berhasil',
      token,
      success: true,
      admin: adminData
    })
    
    // Set token in httpOnly cookie
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    
    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}