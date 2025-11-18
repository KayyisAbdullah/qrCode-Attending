'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  QrCode, 
  Camera, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  CameraOff
} from 'lucide-react'
import Link from 'next/link'
import jsQR from 'jsqr'

export default function QRScannerPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string>('')
  const [scanMessage, setScanMessage] = useState('')
  const [scanStatus, setScanStatus] = useState<'success' | 'error' | 'info'>('info')
  const [showResult, setShowResult] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [student, setStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get student data from localStorage
  useEffect(() => {
    const studentData = localStorage.getItem('studentData')
    if (studentData) {
      setStudent(JSON.parse(studentData))
    }
    setIsLoading(false)
  }, [])

  const handleStartScan = async () => {
    setCameraError('')
    setIsScanning(true)
    setScanResult('')
    setScanMessage('Meminta akses kamera...')
    setScanStatus('info')

    try {
      // Check if browser supports mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser Anda tidak mendukung akses kamera. Gunakan browser modern seperti Chrome, Firefox, Safari, atau Edge.')
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Wait for video to load before starting detection
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => {
            console.error('Error playing video:', err)
            setCameraError('Gagal memutar video dari kamera')
            setIsScanning(false)
          })
          setScanMessage('Kamera aktif - Arahkan ke QR Code')
          startQRCodeDetection()
        }
        
        videoRef.current.onerror = () => {
          setCameraError('Error membuka kamera. Pastikan izin kamera sudah diberikan.')
          setIsScanning(false)
        }
      }
    } catch (err: any) {
      console.error('Camera error:', err)
      
      let errorMessage = 'Terjadi kesalahan saat mengakses kamera'
      
      if (err.name === 'NotAllowedError') {
        errorMessage = '❌ Akses kamera ditolak.\n\nSilakan:\n1. Klik icon kamera di address bar\n2. Pilih "Allow" untuk izinkan akses kamera\n3. Coba lagi'
      } else if (err.name === 'NotFoundError') {
        errorMessage = '❌ Tidak ada kamera yang ditemukan.\n\nPastikan perangkat Anda memiliki kamera dan driver sudah terinstall.'
      } else if (err.name === 'NotReadableError') {
        errorMessage = '❌ Kamera sedang digunakan aplikasi lain.\n\nTutup aplikasi lain yang menggunakan kamera dan coba lagi.'
      } else if (err.name === 'SecurityError') {
        errorMessage = '❌ Akses kamera diblokir karena alasan keamanan.\n\nPastikan website menggunakan HTTPS.'
      } else {
        errorMessage = `❌ Kesalahan: ${err.message}`
      }
      
      setCameraError(errorMessage)
      setScanMessage(errorMessage)
      setScanStatus('error')
      setIsScanning(false)
    }
  }

  const startQRCodeDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }

    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current
        const video = videoRef.current

        // Check if video is ready
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const context = canvas.getContext('2d')
          if (!context) return

          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          // Draw video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Get image data and scan for QR code
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          })

          if (code) {
            handleQRCodeDetected(code.data)
          }
        }
      }
    }, 250) // Check every 250ms
  }

  const handleQRCodeDetected = async (qrData: string) => {
    // Stop scanning immediately
    handleStopScan()
    
    setIsProcessing(true)
    setScanMessage('QR Code terdeteksi! Memproses...')
    setScanResult(qrData)

    try {
      // Send to API to validate and record attendance
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode: qrData,
          studentId: student?.id,
          timestamp: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setScanMessage('✓ Absensi berhasil! Anda telah tercatat hadir.')
        setScanStatus('success')

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard/student'
        }, 2000)
      } else {
        setScanMessage(data.message || 'QR Code tidak valid atau sudah digunakan.')
        setScanStatus('error')
      }
    } catch (error) {
      console.error('Error scanning QR code:', error)
      setScanMessage('Terjadi kesalahan saat memproses QR Code.')
      setScanStatus('error')
    } finally {
      setIsProcessing(false)
      setShowResult(true)
    }
  }

  const handleStopScan = () => {
    // Stop the interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    // Stop the video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
    }

    setIsScanning(false)
  }

  const handleTryAgain = () => {
    setShowResult(false)
    setScanResult('')
    setScanMessage('')
    setScanStatus('info')
    setIsProcessing(false)
    setCameraError('')
  }

  useEffect(() => {
    return () => {
      handleStopScan()
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <Link href="/dashboard/student" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Scanner QR Code</CardTitle>
            <CardDescription>
              Scan QR Code untuk melakukan absensi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hidden canvas for QR detection */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Video element for camera - Show full size when scanning */}
            {isScanning && (
              <div className="relative w-full mb-4 rounded-lg overflow-hidden bg-black aspect-square flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                />
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-green-500 rounded-lg animate-pulse shadow-lg shadow-green-500/50"></div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white text-center py-2 rounded text-sm">
                  Arahkan QR Code ke dalam kotak
                </div>
              </div>
            )}

            {/* Scanner Area */}
            <div className="relative">
              <div className={`mx-auto w-64 h-64 rounded-lg flex items-center justify-center transition-all duration-300 overflow-hidden ${
                isScanning 
                  ? 'bg-blue-100 border-2 border-blue-300' 
                  : 'bg-gray-100 border-2 border-gray-300'
              }`}>
                {isScanning ? (
                  <div className="text-center space-y-4 w-full h-full flex flex-col items-center justify-center">
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                        <p className="text-sm text-gray-600 font-medium">
                          Memproses...
                        </p>
                      </>
                    ) : (
                      <>
                        <Camera className="w-16 h-16 text-blue-600" />
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 font-medium">
                            {scanMessage}
                          </p>
                          <div className="animate-pulse">
                            <div className="w-32 h-1 bg-blue-300 rounded"></div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Klik "Mulai Scan" untuk memulai
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Camera Error Alert */}
            {cameraError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <AlertDescription className="text-red-800 whitespace-pre-wrap text-sm ml-2">
                  {cameraError}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isScanning ? (
                <Button 
                  onClick={handleStartScan}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  disabled={isProcessing}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Mulai Scan
                </Button>
              ) : (
                <Button 
                  onClick={handleStopScan}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  <CameraOff className="w-4 h-4 mr-2" />
                  Hentikan Scan
                </Button>
              )}
            </div>

            {/* Instructions */}
            <div className="text-center space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📱 Cara Penggunaan:</h3>
                <ol className="text-gray-600 space-y-1 text-left list-decimal list-inside">
                  <li>Klik "Mulai Scan" untuk mengaktifkan kamera</li>
                  <li>Arahkan kamera ke QR Code yang disediakan</li>
                  <li>Tunggu hingga QR Code terdeteksi otomatis</li>
                  <li>Sistem akan mencatat waktu absensi Anda</li>
                </ol>
              </div>

              {/* Permission Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
                <h4 className="font-semibold text-blue-900 mb-2">🔒 Izin Akses Kamera:</h4>
                <p className="text-blue-800 text-xs mb-2">Saat pertama kali klik "Mulai Scan", browser akan minta izin untuk mengakses kamera.</p>
                <p className="text-blue-800 text-xs font-semibold mb-1">Jika muncul popup:</p>
                <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside">
                  <li><strong>Pilih "Allow" atau "Izinkan"</strong> untuk memberi akses kamera</li>
                  <li>Jika ditolak, klik icon 🔒 di address bar untuk ubah izin</li>
                  <li>Refresh halaman dan coba lagi</li>
                </ul>
              </div>
            </div>

            {/* Important Note */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Pastikan QR Code dalam kondisi baik dan pencahayaan cukup untuk hasil optimal.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {scanStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 text-red-600" />
              )}
              Hasil Scan
            </DialogTitle>
            <DialogDescription>
              {scanStatus === 'success' 
                ? 'Absensi Anda telah berhasil dicatat' 
                : 'Terjadi kesalahan saat memproses QR Code'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {scanResult && (
              <div className="space-y-2">
                <p className="text-sm font-medium">QR Code:</p>
                <p className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded break-all">
                  {scanResult}
                </p>
              </div>
            )}
            
            <Alert className={scanStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={scanStatus === 'success' ? 'text-green-800 text-sm' : 'text-red-800 text-sm'}>
                {scanMessage}
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end space-x-2">
              {scanStatus === 'error' && (
                <Button variant="outline" onClick={handleTryAgain}>
                  Coba Lagi
                </Button>
              )}
              <Button onClick={() => setShowResult(false)}>
                {scanStatus === 'success' ? 'OK' : 'Tutup'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

  const handleTryAgain = () => {
    setShowResult(false)
    setScanResult('')
    setScanMessage('')
    setScanStatus('info')
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <Link href="/login/student" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Login
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Scanner QR Code</CardTitle>
            <CardDescription>
              Scan QR Code untuk melakukan absensi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scanner Area */}
            <div className="relative">
              <div className={`mx-auto w-64 h-64 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isScanning 
                  ? 'bg-blue-100 border-2 border-blue-300' 
                  : 'bg-gray-100 border-2 border-gray-300'
              }`}>
                {isScanning ? (
                  <div className="text-center space-y-4">
                    {isProcessing ? (
                      <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                    ) : (
                      <Camera className="w-16 h-16 text-blue-600 mx-auto" />
                    )}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">
                        {scanMessage}
                      </p>
                      {isScanning && !isProcessing && (
                        <div className="animate-pulse">
                          <div className="w-32 h-1 bg-blue-300 mx-auto rounded"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Klik "Mulai Scan" untuk memulai
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isScanning ? (
                <Button 
                  onClick={handleStartScan}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Mulai Scan
                </Button>
              ) : (
                <Button 
                  onClick={handleStopScan}
                  variant="outline"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  Hentikan Scan
                </Button>
              )}
            </div>

            {/* Instructions */}
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-gray-900">Cara Penggunaan:</h3>
              <ol className="text-sm text-gray-600 space-y-1 text-left">
                <li>1. Klik "Mulai Scan" untuk mengaktifkan kamera</li>
                <li>2. Arahkan kamera ke QR Code yang disediakan</li>
                <li>3. Tunggu hingga QR Code terdeteksi</li>
                <li>4. Sistem akan mencatat waktu absensi Anda</li>
              </ol>
            </div>

            {/* Important Note */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Pastikan QR Code yang discan adalah QR Code resmi dari sekolah dan dalam kondisi baik.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {scanStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 text-red-600" />
              )}
              Hasil Scan
            </DialogTitle>
            <DialogDescription>
              {scanStatus === 'success' 
                ? 'Absensi Anda telah berhasil dicatat' 
                : 'Terjadi kesalahan saat memproses QR Code'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {scanResult && (
              <div className="space-y-2">
                <p className="text-sm font-medium">QR Code Terdeteksi:</p>
                <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                  {scanResult}
                </p>
              </div>
            )}
            
            <Alert className={scanStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={scanStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                {scanMessage}
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end space-x-2">
              {scanStatus === 'error' && (
                <Button variant="outline" onClick={handleTryAgain}>
                  Coba Lagi
                </Button>
              )}
              <Button onClick={() => setShowResult(false)}>
                {scanStatus === 'success' ? 'OK' : 'Tutup'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}