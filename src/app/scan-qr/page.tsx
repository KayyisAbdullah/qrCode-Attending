'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Dynamic import QRScanner dengan loading state yang konsisten
const QRScanner = dynamic(() => import('@/components/QRScanner'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-[300px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
      <p className="text-sm text-gray-500">Memuat modul kamera...</p>
    </div>
  )
})

interface Student {
  id: string
  name: string
  username: string
  class: string
}

export default function ScanQRPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)

  useEffect(() => {
    setIsMounted(true)
    
    // Ambil data student dari localStorage
    try {
      const storedData = localStorage.getItem('studentData')
      if (storedData) {
        setStudent(JSON.parse(storedData))
      }
    } catch (error) {
      console.error('Gagal memuat data siswa:', error)
    }
  }, [])

  // Tampilan Loading Awal (Server & Client Initial Render sama)
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Memuat Aplikasi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-6 px-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header with Back Button */}
        <div className="relative text-center space-y-2">
          <Link href="/dashboard/student" className="absolute left-0 top-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-white/80"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Absensi QR</h1>
          <p className="text-gray-500 text-sm">Scan QR Code untuk melakukan absensi</p>
        </div>

        {/* Student Info Card */}
        {student ? (
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Siswa</p>
                <p className="font-bold text-gray-800">{student.name}</p>
                <p className="text-sm text-gray-600">{student.class}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {student.name.charAt(0)}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Belum Login</AlertTitle>
            <AlertDescription>
              Silakan login terlebih dahulu untuk melakukan absensi.
            </AlertDescription>
          </Alert>
        )}

        {/* Scanner Component */}
        <Card className="overflow-hidden shadow-xl border-0">
          <CardContent className="p-0">
            <QRScanner student={student} />
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200 shadow-md text-sm space-y-3">
          <p className="font-bold text-gray-900 text-base flex items-center gap-2">
            <span className="text-2xl">📱</span> 
            Scan QR dari Kamera Laptop ke Layar HP
          </p>
          
          <div className="bg-white/80 p-3 rounded-lg space-y-2">
            <p className="font-semibold text-gray-800 text-sm">🎯 Langkah Mudah:</p>
            <ol className="list-decimal list-inside space-y-1.5 ml-1 text-xs">
              <li className="font-medium">Brightness HP <span className="text-blue-600">maksimal (100%)</span></li>
              <li className="font-medium">Jarak: <span className="text-blue-600">15-20cm</span> dari kamera laptop</li>
              <li className="font-medium">Miringkan layar HP <span className="text-blue-600">10-15°</span> untuk hindari refleksi</li>
              <li className="font-medium">Posisi QR di <span className="text-blue-600">kotak hijau</span></li>
            </ol>
          </div>
          
          <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-lg">
            <p className="font-semibold text-yellow-900 text-xs mb-1.5">⚠️ Jika Tidak Terdeteksi:</p>
            <ul className="space-y-1 text-xs text-yellow-800">
              <li>• <strong>Miringkan layar HP</strong> lebih banyak (hindari pantulan lampu!)</li>
              <li>• <strong>Perbesar QR</strong> di layar HP (zoom in browser)</li>
              <li>• <strong>Jarak optimal:</strong> 15-20cm, jangan terlalu dekat</li>
              <li>• <strong>Cahaya:</strong> Pastikan ruangan terang tapi tidak backlight</li>
              <li>• Alternatif: <strong>Upload screenshot QR</strong></li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
