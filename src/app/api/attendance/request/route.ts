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

    // Check if already attended today
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    
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

    // Handle File Upload
    let proofFileUrl: string | null = null
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { message: 'Format file tidak didukung. Gunakan PDF atau Gambar (JPG/PNG)', success: false },
          { status: 400 }
        )
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: 'Ukuran file terlalu besar (Maksimal 5MB)', success: false },
          { status: 400 }
        )
      }

      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Create unique filename
        // Sanitize extension
        const originalName = file.name || 'unknown'
        const ext = originalName.split('.').pop() || 'bin'
        const filename = `proof-${studentId}-${Date.now()}.${ext}`
        
        // Ensure directory exists (optional, but good practice if not created manually)
        // For now assuming public/uploads exists as created in previous step
        
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        const filepath = path.join(uploadDir, filename)
        
        await writeFile(filepath, buffer)
        proofFileUrl = `/uploads/${filename}`
      } catch (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json(
          { message: 'Gagal mengupload file bukti', success: false },
          { status: 500 }
        )
      }
    }

    // Create attendance record
    const attendance = await db.attendance.create({
      data: {
        studentId: studentId,
        date: todayString,
        time: today.toLocaleTimeString('en-US', { hour12: false }),
        status: status as Status,
        notes: notes || `Pengajuan ${status}`,
        proofFile: proofFileUrl
      }
    })

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
