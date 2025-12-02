import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Status } from '@prisma/client'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const studentId = formData.get('studentId') as string
    const status = formData.get('status') as string
    const notes = formData.get('notes') as string
    const file = formData.get('file') as File | null

    if (!studentId || !status) {
      return NextResponse.json(
        { message: 'Data tidak lengkap', success: false },
        { status: 400 }
      )
    }

    if (status !== 'IZIN' && status !== 'SAKIT') {
      return NextResponse.json(
        { message: 'Status tidak valid', success: false },
        { status: 400 }
      )
    }

    // Check if student exists
    const student = await db.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json(
        { message: 'Siswa tidak ditemukan', success: false },
        { status: 404 }
      )
    }

    // Check if already attended today (WIB timezone)
    const now = new Date()
    const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
    const todayString = wibTime.toISOString().split('T')[0]
    
    const existingAttendance = await db.attendance.findFirst({
      where: {
        studentId: studentId,
        date: todayString
      }
    })

    if (existingAttendance) {
      return NextResponse.json({
        message: `Anda sudah melakukan absensi hari ini dengan status: ${existingAttendance.status}`,
        success: false
      })
    }

    // Handle File Upload - Simplified for Vercel serverless
    let proofFileUrl: string | null = null
    if (file && file.size > 0) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { message: 'Format file tidak didukung. Gunakan PDF atau Gambar (JPG/PNG)', success: false },
          { status: 400 }
        )
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: 'Ukuran file terlalu besar (Maksimal 5MB)', success: false },
          { status: 400 }
        )
      }

      // For now, just store filename (in production, upload to cloud storage like Vercel Blob)
      proofFileUrl = `proof-${studentId}-${Date.now()}-${file.name}`
      console.log('[REQUEST_API] File would be uploaded:', proofFileUrl)
    }

    // Create attendance record with WIB time
    const currentTime = wibTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
    
    const attendance = await db.attendance.create({
      data: {
        studentId: studentId,
        date: todayString,
        time: currentTime,
        status: status as Status,
        notes: notes || `Pengajuan ${status}`,
        proofFile: proofFileUrl
      }
    })
    
    console.log(`[REQUEST_API] ${status} created for ${student.name} at ${currentTime} WIB`)

    return NextResponse.json({
      message: `Berhasil mengajukan ${status}`,
      success: true,
      data: attendance
    })

  } catch (error) {
    console.error('[REQUEST_API] Error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', success: false },
      { status: 500 }
    )
  }
}
