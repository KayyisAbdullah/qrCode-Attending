import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Mock data storage for Netlify serverless (will reset on redeploy)
let mockStudentsDb: any[] = [
  { id: '1', username: 'ahmad123', password: '$2b$10$To6gsNtXX0qwKGtT85cIs.J9vSYJgXsjb5Asrbqv8ZSVGf7fUiI1', name: 'Ahmad', email: 'ahmad@school.com', class: 'XI-A', qrCode: 'QR-ahmad-001', createdAt: new Date() },
  { id: '2', username: 'siti123', password: '$2b$10$To6gsNtXX0qwKGtT85cIs.J9vSYJgXsjb5Asrbqv8ZSVGf7fUiI1', name: 'Siti', email: 'siti@school.com', class: 'XI-B', qrCode: 'QR-siti-001', createdAt: new Date() },
  { id: '3', username: 'budi123', password: '$2b$10$To6gsNtXX0qwKGtT85cIs.J9vSYJgXsjb5Asrbqv8ZSVGf7fUiI1', name: 'Budi', email: 'budi@school.com', class: 'XI-C', qrCode: 'QR-budi-001', createdAt: new Date() },
]

// GET all students
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const classFilter = searchParams.get('class')

    try {
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

    } catch (dbError) {
      console.log('[GET_STUDENTS] Database error, using mock data:', dbError)
      
      // Fallback to mock data for Netlify/serverless
      let students = mockStudentsDb.map(s => ({
        id: s.id,
        username: s.username,
        name: s.name,
        email: s.email,
        class: s.class,
        qrCode: s.qrCode,
        createdAt: s.createdAt
      }))

      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase()
        students = students.filter(s =>
          s.name.toLowerCase().includes(searchLower) ||
          s.username.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower)
        )
      }

      if (classFilter && classFilter !== 'all') {
        students = students.filter(s => s.class === classFilter)
      }

      // Sort by creation date descending
      students.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      const response = NextResponse.json(students)
      response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
      return response
    }

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
        { message: 'Semua field harus diisi', success: false },
        { status: 400 }
      )
    }

    // Try database first, with mock fallback for Netlify
    try {
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
          { message: 'Username atau email sudah digunakan', success: false },
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
        student,
        success: true
      })

    } catch (dbError) {
      console.log('[CREATE_STUDENT] Database error, using mock data:', dbError)
      
      // Fallback to mock data for Netlify/serverless
      const existingMockStudent = mockStudentsDb.find(s => s.username === username || s.email === email)
      if (existingMockStudent) {
        return NextResponse.json(
          { message: 'Username atau email sudah digunakan', success: false },
          { status: 400 }
        )
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Generate unique QR code
      const qrCode = `QR${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Create mock student
      const newStudent = {
        id: `${mockStudentsDb.length + 1}`,
        username,
        name,
        email,
        class: studentClass,
        password: hashedPassword,
        qrCode,
        createdAt: new Date()
      }

      mockStudentsDb.push(newStudent)

      const { password: _, ...studentData } = newStudent

      return NextResponse.json({
        message: 'Siswa berhasil ditambahkan',
        student: studentData,
        success: true
      })
    }

  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', success: false },
      { status: 500 }
    )
  }
}