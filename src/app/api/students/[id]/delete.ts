import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mockStudentsDb } from '@/lib/mock-data'

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
