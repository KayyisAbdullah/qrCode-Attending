import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { findMockStudent, mockStudentsDb } from '@/lib/mock-data'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json(
        { message: 'ID siswa harus diisi', success: false },
        { status: 400 }
      )
    }

    let student: any = null

    // Try database first
    try {
      student = await db.student.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          password: false,
          name: true,
          email: true,
          class: true,
          qrCode: true,
          createdAt: true
        }
      })
    } catch (dbError) {
      console.log('[GET_STUDENT] Database error, checking mock data:', dbError)
      // Fallback to mock data
      const mockStudent = findMockStudent('')
      if (mockStudent && mockStudent.id === id) {
        student = {
          id: mockStudent.id,
          username: mockStudent.username,
          name: mockStudent.name,
          email: mockStudent.email,
          class: mockStudent.class,
          qrCode: mockStudent.qrCode,
          createdAt: mockStudent.createdAt
        }
      }
    }

    if (!student) {
      return NextResponse.json(
        { message: 'Siswa tidak ditemukan', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      student,
      success: true
    })

  } catch (error) {
    console.error('Get student by ID error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', success: false },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json(
        { message: 'ID siswa harus diisi', success: false },
        { status: 400 }
      )
    }

    let deleted = false

    // Try database first
    try {
      await db.student.delete({
        where: { id }
      })
      deleted = true
    } catch (dbError) {
      console.log('[DELETE_STUDENT] Database error, trying mock data:', dbError)
      // Fallback to mock data
      const index = mockStudentsDb.findIndex(s => s.id === id)
      if (index !== -1) {
        mockStudentsDb.splice(index, 1)
        deleted = true
      }
    }

    if (!deleted) {
      return NextResponse.json(
        { message: 'Siswa tidak ditemukan', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Siswa berhasil dihapus',
      success: true
    })

  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', success: false },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const { name, username, email, class: studentClass } = await request.json()

    if (!id) {
      return NextResponse.json(
        { message: 'ID siswa harus diisi', success: false },
        { status: 400 }
      )
    }

    let updatedStudent: any = null

    // Try database first
    try {
      updatedStudent = await db.student.update({
        where: { id },
        data: {
          name,
          username,
          email,
          class: studentClass
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
    } catch (dbError) {
      console.log('[UPDATE_STUDENT] Database error, trying mock data:', dbError)
      // Fallback to mock data
      const index = mockStudentsDb.findIndex(s => s.id === id)
      if (index !== -1) {
        mockStudentsDb[index] = {
          ...mockStudentsDb[index],
          name: name || mockStudentsDb[index].name,
          username: username || mockStudentsDb[index].username,
          email: email || mockStudentsDb[index].email,
          class: studentClass || mockStudentsDb[index].class
        }
        updatedStudent = mockStudentsDb[index]
      }
    }

    if (!updatedStudent) {
      return NextResponse.json(
        { message: 'Siswa tidak ditemukan', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      student: updatedStudent,
      message: 'Data siswa berhasil diperbarui',
      success: true
    })

  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', success: false },
      { status: 500 }
    )
  }
}
