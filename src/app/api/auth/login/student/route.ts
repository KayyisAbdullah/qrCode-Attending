import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Mock data for Netlify (file system not available in serverless)
const MOCK_STUDENTS = [
  { id: '1', username: 'ahmad123', password: '$2a$10$8qvvP.d3CZaZdXuDUIuveOvGLqS4fWI5ydNuNpkWaL2g6r4PdJTCi', name: 'Ahmad', email: 'ahmad@school.com', class: 'XI-A', qrCode: 'QR-ahmad-001' },
  { id: '2', username: 'siti123', password: '$2a$10$8qvvP.d3CZaZdXuDUIuveOvGLqS4fWI5ydNuNpkWaL2g6r4PdJTCi', name: 'Siti', email: 'siti@school.com', class: 'XI-B', qrCode: 'QR-siti-001' },
  { id: '3', username: 'budi123', password: '$2a$10$8qvvP.d3CZaZdXuDUIuveOvGLqS4fWI5ydNuNpkWaL2g6r4PdJTCi', name: 'Budi', email: 'budi@school.com', class: 'XI-C', qrCode: 'QR-budi-001' },
]

export async function POST(request: NextRequest) {
  try {
    let body: any = {}
    try {
      body = await request.json()
    } catch (parseError) {
      console.log('[STUDENT_LOGIN] JSON parse error:', parseError)
      return NextResponse.json(
        { message: 'Invalid request body', success: false },
        { status: 400 }
      )
    }

    const { username, password } = body
    console.log('[STUDENT_LOGIN] Attempt:', { username, passwordLength: password?.length })

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username dan password harus diisi', success: false },
        { status: 400 }
      )
    }

    let student: any = null

    // Try database first, fallback to mock data
    try {
      student = await db.student.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          password: true,
          name: true,
          email: true,
          class: true,
          qrCode: true
        }
      })
    } catch (dbError) {
      console.log('[STUDENT_LOGIN] Database error, using mock data:', dbError)
      // Fallback to mock data for Netlify/serverless
      student = MOCK_STUDENTS.find(s => s.username === username) || null
    }

    if (!student) {
      console.log('[STUDENT_LOGIN] Student not found:', username)
      return NextResponse.json(
        { message: 'Username atau password salah', success: false },
        { status: 401 }
      )
    }

    console.log('[STUDENT_LOGIN] Student found, checking password')
    // Verify password
    const isValidPassword = await bcrypt.compare(password, student.password)
    console.log('[STUDENT_LOGIN] Password valid:', isValidPassword)

    if (!isValidPassword) {
      console.log('[STUDENT_LOGIN] Invalid password for:', username)
      return NextResponse.json(
        { message: 'Username atau password salah', success: false },
        { status: 401 }
      )
    }

    // Create a simple token (in production, use JWT)
    const token = Buffer.from(JSON.stringify({
      id: student.id,
      username: student.username,
      role: 'student',
      iat: Date.now()
    })).toString('base64')

    // Remove password from response
    const { password: _, ...studentData } = student

    const response = NextResponse.json({
      message: 'Login berhasil',
      token,
      success: true,
      student: studentData
    })
    
    // Set token in httpOnly cookie
    response.cookies.set('studentToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    
    return response

  } catch (error) {
    console.error('Student login error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}