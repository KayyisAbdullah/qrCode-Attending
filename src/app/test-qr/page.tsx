'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import QRCode from 'react-qr-code'
import Link from 'next/link'
import { ArrowLeft, QrCode } from 'lucide-react'

export default function TestQRPage() {
  const [qrValue, setQrValue] = useState('ATTENDANCE-QR-TEST-001')

  const generateNewQR = () => {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase()
    const dateStr = new Date().toISOString().split('T')[0]
    setQrValue(`ATTENDANCE-QR-TEST-${dateStr}-${randomStr}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/dashboard/student" className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Dashboard
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Test QR Code</CardTitle>
            <CardDescription>QR Code untuk testing scanner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 flex justify-center">
              <QRCode
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={qrValue}
                viewBox={`0 0 200 200`}
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-700">QR Code Value:</p>
              <p className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded break-all">
                {qrValue}
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={generateNewQR} 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                size="lg"
              >
                Generate QR Code Baru
              </Button>
              
              <Link href="/scan-qr" className="block">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                >
                  Test Scanner
                </Button>
              </Link>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🧪 Cara Testing:</h4>
              <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                <li>Generate QR code baru di halaman ini</li>
                <li>Klik "Test Scanner" untuk buka kamera</li>
                <li>Arahkan kamera ke QR code di layar ini</li>
                <li>Scanner akan mendeteksi dan mencatat absensi test</li>
                <li>Absensi akan muncul di riwayat dengan status "Hadir"</li>
              </ol>
              <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-xs text-green-800">
                ✅ <strong>QR Test ini akan mencatat absensi sungguhan!</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}