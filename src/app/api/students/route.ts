import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET all students
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const classFilter = searchParams.get('class')

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (classFilter && classFilter !== 'all') {
      where.class = classFilter
    }

    const students = await db.student.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        class: true,
        qrCode: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const response = NextResponse.json(students)
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    return response

  } catch (error) {
    console.error('Get students error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create new student
export async function POST(request: NextRequest) {
  try {
    const { name, username, email, class: studentClass, password } = await request.json()

    if (!name || !username || !email || !studentClass || !password) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Check if username or email already exists
    const existingStudent = await db.student.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingStudent) {
      return NextResponse.json(
        { message: 'Username atau email sudah digunakan' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate unique QR code
    const qrCode = `QR${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create student
    const student = await db.student.create({
      data: {
        name,
        username,
        email,
        class: studentClass,
        password: hashedPassword,
        qrCode
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        class: true,
        qrCode: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Siswa berhasil ditambahkan',
      student
    })

  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}