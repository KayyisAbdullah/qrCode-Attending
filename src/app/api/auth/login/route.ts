import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { findMockStudent, findMockAdmin } from '@/lib/mock-data'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    let body: any = {}
    try {
      body = await request.json()
    } catch (parseError) {
      console.log('[UNIFIED_LOGIN] JSON parse error:', parseError)
      return NextResponse.json(
        { message: 'Invalid request body', success: false },
        { status: 400 }
      )
    }

    const { username, password } = body
    console.log('[UNIFIED_LOGIN] Attempt:', { username, passwordLength: password?.length })

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username dan password harus diisi', success: false },
        { status: 400 }
      )
    }

    // Try admin login first
    let admin: any = null
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
      console.log('[UNIFIED_LOGIN] Database error for admin, checking mock:', dbError)
      admin = findMockAdmin(username)
    }

    if (admin) {
      console.log('[UNIFIED_LOGIN] Admin found, checking password')
      const isValidPassword = await bcrypt.compare(password, admin.password)
      
      if (isValidPassword) {
        console.log('[UNIFIED_LOGIN] Admin login successful')
        const token = Buffer.from(JSON.stringify({
          id: admin.id,
          username: admin.username,
          role: 'admin',
          iat: Date.now()
        })).toString('base64')

        const { password: _, ...adminData } = admin

        const response = NextResponse.json({
          message: 'Login berhasil',
          token,
          success: true,
          role: 'admin',
          user: adminData
        })
        
        response.cookies.set('authToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60
        })
        
        response.cookies.set('userRole', 'admin', {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60
        })
        
        return response
      }
    }

    // If admin not found or password wrong, try student
    let student: any = null
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
      console.log('[UNIFIED_LOGIN] Database error for student, checking mock:', dbError)
      student = findMockStudent(username)
    }

    if (student) {
      console.log('[UNIFIED_LOGIN] Student found, checking password')
      const isValidPassword = await bcrypt.compare(password, student.password)
      
      if (isValidPassword) {
        console.log('[UNIFIED_LOGIN] Student login successful')
        const token = Buffer.from(JSON.stringify({
          id: student.id,
          username: student.username,
          role: 'student',
          iat: Date.now()
        })).toString('base64')

        const { password: _, ...studentData } = student

        const response = NextResponse.json({
          message: 'Login berhasil',
          token,
          success: true,
          role: 'student',
          user: studentData
        })
        
        response.cookies.set('authToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60
        })
        
        response.cookies.set('userRole', 'student', {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60
        })
        
        return response
      }
    }

    // No user found or password invalid
    console.log('[UNIFIED_LOGIN] Login failed for username:', username)
    return NextResponse.json(
      { message: 'Username atau password salah', success: false },
      { status: 401 }
    )

  } catch (error) {
    console.error('Unified login error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', success: false },
      { status: 500 }
    )
  }
}
