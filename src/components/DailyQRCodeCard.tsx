'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCw, Calendar } from 'lucide-react'
import QRCodeReact from 'react-qr-code'

export function DailyQRCodeCard() {
  const [qrData, setQrData] = useState<string>('')
  const [todayDate, setTodayDate] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate QR Code data based on today's date
  const generateDailyQRCode = () => {
    const today = new Date()
    const dateString = today.toISOString().split('T')[0]
    
    // Create unique QR data for today
    const qrPayload = {
      type: 'DAILY_ATTENDANCE',
      date: dateString,
      timestamp: today.getTime(),
      token: `ABSEN-${dateString}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }
    
    setQrData(JSON.stringify(qrPayload))
    setTodayDate(dateString)
  }

  // Auto-generate QR code on component mount and refresh daily
  useEffect(() => {
    generateDailyQRCode()
    
    // Check every minute if date has changed
    const interval = setInterval(() => {
      const currentDate = new Date().toISOString().split('T')[0]
      if (currentDate !== todayDate) {
        generateDailyQRCode()
      }
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [todayDate])

  const handleRefresh = () => {
    setIsGenerating(true)
    setTimeout(() => {
      generateDailyQRCode()
      setIsGenerating(false)
    }, 500)
  }

  const handleDownloadQR = () => {
    // Create SVG element from QR code
    const svg = document.getElementById('daily-qr-code')
    if (!svg) return

    // Create canvas and draw SVG
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      // Download as PNG
      canvas.toBlob((blob) => {
        if (!blob) return
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `QR-Absensi-${todayDate}.png`
        link.click()
        URL.revokeObjectURL(url)
      })
    }
    img.src = url
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <CardTitle className="text-2xl">QR Code Absensi Harian</CardTitle>
            <CardDescription className="mt-2">
              QR Code ini otomatis berubah setiap hari dan berlaku untuk semua siswa
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            <Calendar className="w-3 h-3 mr-1" />
            Hari Ini
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl">
          <div className="bg-white p-6 rounded-lg shadow-lg mx-auto w-fit">
            {qrData ? (
              <div id="daily-qr-code-container" className="space-y-4">
                <QRCodeReact
                  id="daily-qr-code"
                  value={qrData}
                  size={320}
                  level="H"
                  className="mx-auto"
                  style={{ width: '320px', height: '320px' }}
                />
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(todayDate)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Scan QR Code ini untuk absensi
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-[320px] h-[320px] flex items-center justify-center">
                <p className="text-gray-400">Memuat QR Code...</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Informasi QR Code
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• QR Code ini berlaku untuk <strong>semua siswa</strong></li>
            <li>• Otomatis berubah setiap hari pada pukul 00:00</li>
            <li>• Setiap siswa hanya bisa scan sekali per hari</li>
            <li>• QR Code berlaku untuk tanggal: <strong>{formatDate(todayDate)}</strong></li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="flex-1"
            disabled={isGenerating}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Memuat...' : 'Refresh QR Code'}
          </Button>
          <Button
            onClick={handleDownloadQR}
            className="flex-1"
            disabled={!qrData}
          >
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>

        {/* Usage Instructions */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Cara Penggunaan:</h3>
          <ol className="text-sm text-gray-600 space-y-2">
            <li>1. Tampilkan QR Code ini di layar atau cetak</li>
            <li>2. Siswa membuka aplikasi dan pilih menu "Scan QR"</li>
            <li>3. Siswa scan QR Code ini untuk absensi</li>
            <li>4. Sistem otomatis mencatat kehadiran siswa</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
