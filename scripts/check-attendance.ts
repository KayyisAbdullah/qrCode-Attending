// Quick script to check attendance data
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  try {
    const today = new Date().toISOString().split('T')[0]
    console.log('Today date:', today)
    
    const attendances = await prisma.attendance.findMany({
      include: {
        student: true
      }
    })
    
    console.log('\n=== All Attendances ===')
    console.log('Total:', attendances.length)
    
    attendances.forEach(a => {
      console.log(`- ${a.student.name}: ${a.status} on ${a.date}`)
    })
    
    const todayAttendances = attendances.filter(a => a.date === today)
    console.log('\n=== Today Attendances ===')
    console.log('Total:', todayAttendances.length)
    
    const stats = {
      hadir: todayAttendances.filter(a => a.status === 'HADIR').length,
      terlambat: todayAttendances.filter(a => a.status === 'TERLAMBAT').length,
      izin: todayAttendances.filter(a => a.status === 'IZIN').length,
      sakit: todayAttendances.filter(a => a.status === 'SAKIT').length,
    }
    
    console.log('Stats:', stats)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
