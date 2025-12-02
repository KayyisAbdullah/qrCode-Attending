// Add test attendance data
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTestData() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    
    // Get all students
    const students = await prisma.student.findMany()
    console.log(`Found ${students.length} students`)
    
    if (students.length === 0) {
      console.log('No students found!')
      return
    }
    
    // Clear today's attendance first
    await prisma.attendance.deleteMany({
      where: { date: today }
    })
    console.log('Cleared today\'s attendance')
    
    // Add test attendance for each student
    const statuses = ['HADIR', 'HADIR', 'HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'HADIR', 'HADIR']
    
    for (let i = 0; i < students.length; i++) {
      const status = statuses[i % statuses.length]
      await prisma.attendance.create({
        data: {
          studentId: students[i].id,
          date: today,
          time: time,
          status: status as any,
          notes: `Test data for ${status}`
        }
      })
      console.log(`Added ${status} for ${students[i].name}`)
    }
    
    console.log('\n✅ Test data added successfully!')
    
    // Show stats
    const todayAttendances = await prisma.attendance.findMany({
      where: { date: today }
    })
    
    const stats = {
      hadir: todayAttendances.filter(a => a.status === 'HADIR').length,
      terlambat: todayAttendances.filter(a => a.status === 'TERLAMBAT').length,
      izin: todayAttendances.filter(a => a.status === 'IZIN').length,
      sakit: todayAttendances.filter(a => a.status === 'SAKIT').length,
    }
    
    console.log('\nToday Stats:', stats)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestData()
