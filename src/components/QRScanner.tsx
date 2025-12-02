'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, ArrowLeft, CheckCircle, XCircle, AlertCircle, Loader2, SwitchCamera, FlipHorizontal, Upload, Image as ImageIcon, Flashlight, FlashlightOff } from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: string
  name: string
  username: string
  class: string
}

interface QRScannerProps {
  student: Student | null
}

type ScannerState = 'idle' | 'requesting' | 'scanning' | 'processing' | 'success' | 'error'

export default function QRScanner({ student }: QRScannerProps) {
  // Log version untuk debugging cache
  useEffect(() => {
    console.log('QR Scanner Component v9.3 - No Mirror + Extreme Preprocessing for Laptop Webcam')
  }, [])

  const [state, setState] = useState<ScannerState>('idle')
  const [error, setError] = useState('')
  const [scanResult, setScanResult] = useState('')
  const [message, setMessage] = useState('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [torchSupported, setTorchSupported] = useState(false)
  const [torchEnabled, setTorchEnabled] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef<boolean>(false)
  const animationRef = useRef<number | null>(null)

  // Cleanup function yang robust
  const cleanup = useCallback(() => {
    scanningRef.current = false
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        // Pastikan track benar-benar berhenti
        track.enabled = false
      })
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.load() // Reset video element
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  // Callback ref untuk menangani video element saat mounting
  // Ini lebih stabil daripada useEffect karena menjamin node sudah ada
  const onVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node
    if (node && streamRef.current) {
      console.log('Video element mounted, attaching stream')
      node.srcObject = streamRef.current
      node.play().catch(e => console.warn('Video play failed:', e))
    }
  }, [])

  // Start camera dengan error handling yang lebih baik
  // Start camera dengan error handling yang lebih baik
  const startCamera = async () => {
    setState('requesting')
    setError('')
    setScanResult('')
    setMessage('')

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      }

      // Stop stream sebelumnya jika ada
      cleanup()

      let stream: MediaStream | null = null

      try {
        // Coba dengan facingMode yang diminta dengan resolusi optimal untuk scanning layar HP
        console.log(`Requesting camera (${facingMode})...`)
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode,
            width: { ideal: 1920, max: 3840 },
            height: { ideal: 1080, max: 2160 },
            // Setting tambahan untuk kualitas lebih baik
            aspectRatio: { ideal: 16/9 },
            frameRate: { ideal: 30, max: 60 }
          } 
        })
      } catch (err) {
        console.warn('High-res camera config failed, trying standard...', err)
        try {
          // Coba dengan resolusi standar
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 }
            } 
          })
        } catch (err2) {
          console.warn('Standard camera config failed, trying fallback...', err2)
          // Fallback: coba kamera apapun yang tersedia
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true 
          })
          // Jika fallback berhasil (biasanya webcam laptop), anggap sebagai user facing agar dimirror
          setFacingMode('user')
        }
      }

      if (!stream) throw new Error('Gagal mendapatkan stream kamera')

      streamRef.current = stream
      
      // Check if torch/flash is supported
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities?.() as any
      if (capabilities && capabilities.torch) {
        setTorchSupported(true)
        console.log('Torch/Flash is supported on this device')
      } else {
        setTorchSupported(false)
        setTorchEnabled(false)
      }
      
      // Langsung set state ke scanning agar video element ter-render
      // Video akan di-handle oleh onVideoRef
      setState('scanning')
      
      // Mulai loop scanning
      startScanning()

    } catch (err: any) {
      console.error('Camera error:', err)
      let errorMsg = 'Gagal mengakses kamera'
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Izin kamera ditolak. Mohon izinkan akses kamera di browser Anda.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'Kamera tidak ditemukan pada perangkat ini.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Kamera sedang digunakan oleh aplikasi lain.'
      } else if (err.name === 'OverconstrainedError') {
        errorMsg = 'Kamera tidak mendukung resolusi yang diminta.'
      }
      
      setError(errorMsg)
      setState('error')
      cleanup()
    }
  }

  // Scanning loop dengan optimasi deteksi
  const startScanning = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d', { willReadFrequently: true })

    if (!context) return

    scanningRef.current = true

    // Import jsQR secara dinamis
    const jsQR = (await import('jsqr')).default

    let lastScanTime = 0
    const scanInterval = 150 // 150ms untuk balance processing time dengan detection

    const scan = () => {
      if (!scanningRef.current) return

      const now = Date.now()
      
      if (video.readyState === video.HAVE_ENOUGH_DATA && now - lastScanTime >= scanInterval) {
        lastScanTime = now
        
        const { videoWidth, videoHeight } = video
        
        // Set canvas size sesuai video
        if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
          canvas.width = videoWidth
          canvas.height = videoHeight
        }

        // Draw frame ke canvas
        context.drawImage(video, 0, 0, videoWidth, videoHeight)
        
        // Get image data untuk scanning
        let imageData = context.getImageData(0, 0, videoWidth, videoHeight)
        
        // EXTREME Preprocessing: Optimized untuk laptop webcam ke layar HP
        const data = imageData.data
        
        // Step 1: Convert to grayscale dengan weighted average
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
          data[i] = data[i + 1] = data[i + 2] = gray
        }
        
        // Step 2: Adaptive thresholding untuk high contrast B&W
        const threshold = 140 // Threshold untuk binarization
        for (let i = 0; i < data.length; i += 4) {
          const value = data[i]
          // Binarize: pure black or pure white
          if (value > threshold) {
            data[i] = data[i + 1] = data[i + 2] = 255 // Pure white
          } else {
            data[i] = data[i + 1] = data[i + 2] = 0   // Pure black
          }
        }
        
        // Step 3: Slight blur reduction dengan sharpening
        const tempData = new Uint8ClampedArray(data)
        for (let y = 1; y < videoHeight - 1; y++) {
          for (let x = 1; x < videoWidth - 1; x++) {
            const idx = (y * videoWidth + x) * 4
            const center = tempData[idx]
            const top = tempData[((y - 1) * videoWidth + x) * 4]
            const bottom = tempData[((y + 1) * videoWidth + x) * 4]
            const left = tempData[(y * videoWidth + (x - 1)) * 4]
            const right = tempData[(y * videoWidth + (x + 1)) * 4]
            
            // Sharpening kernel
            const sharpened = center * 5 - top - bottom - left - right
            const clamped = Math.min(255, Math.max(0, sharpened))
            data[idx] = data[idx + 1] = data[idx + 2] = clamped
          }
        }

        // Scan QR Code dengan multiple inversion attempts untuk akurasi lebih baik
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth", // Coba normal dan inverted untuk layar HP
        })

        if (code && code.data && code.data.trim() !== '') {
          console.log('QR Detected:', code.data)
          handleQRDetected(code.data)
          return // Stop loop saat terdeteksi
        }
      }

      // Lanjut loop jika belum terdeteksi
      animationRef.current = requestAnimationFrame(scan)
    }

    // Mulai loop
    animationRef.current = requestAnimationFrame(scan)
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset input value agar bisa upload file yang sama
    event.target.value = ''

    setState('processing')
    setMessage('Membaca gambar...')

    try {
      const jsQR = (await import('jsqr')).default
      const image = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        image.src = e.target?.result as string
        image.onload = () => {
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          
          if (!context) {
            setError('Gagal memproses gambar')
            setState('error')
            return
          }

          canvas.width = image.width
          canvas.height = image.height
          context.drawImage(image, 0, 0)
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          })

          if (code && code.data) {
            console.log('QR Detected from image:', code.data)
            handleQRDetected(code.data)
          } else {
            setError('QR Code tidak ditemukan dalam gambar')
            setState('error')
          }
        }
      }

      reader.readAsDataURL(file)
    } catch (err) {
      console.error('File processing error:', err)
      setError('Gagal memproses file gambar')
      setState('error')
    }
  }

  // Handle hasil scan
  const handleQRDetected = async (qrData: string) => {
    scanningRef.current = false // Stop scanning
    setState('processing')
    setScanResult(qrData)

    // Robust way to get student ID
    let currentStudentId = student?.id
    
    // Fallback: jika props student kosong, coba ambil dari localStorage
    if (!currentStudentId && typeof window !== 'undefined') {
      try {
        const storedStudent = localStorage.getItem('studentData')
        if (storedStudent) {
          const parsed = JSON.parse(storedStudent)
          currentStudentId = parsed.id
          console.log('Recovered student ID from localStorage:', currentStudentId)
        }
      } catch (e) {
        console.warn('Failed to recover student ID:', e)
      }
    }

    console.log('Sending scan request:', { qrData, studentId: currentStudentId })

    try {
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          qrData,
          studentId: currentStudentId || null 
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        setMessage(result.message)
        setState('success')
      } else {
        setMessage(result.message || 'Scan gagal')
        setState('error')
      }

    } catch (error) {
      console.error('API error:', error)
      setMessage('Terjadi kesalahan koneksi server')
      setState('error')
    }
  }

  const stopCamera = () => {
    cleanup()
    setState('idle')
  }

  const resetScanner = () => {
    cleanup()
    startCamera()
  }

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    setTorchEnabled(false) // Reset torch saat ganti kamera
    // Efek samping perubahan facingMode akan mentrigger re-start di useEffect jika kita mau,
    // tapi lebih aman manual restart untuk kontrol penuh
    setTimeout(() => {
      cleanup()
      startCamera()
    }, 100)
  }

  const toggleTorch = async () => {
    if (!streamRef.current || !torchSupported) return
    
    try {
      const track = streamRef.current.getVideoTracks()[0]
      const newTorchState = !torchEnabled
      
      await track.applyConstraints({
        advanced: [{ torch: newTorchState } as any]
      })
      
      setTorchEnabled(newTorchState)
      console.log('Torch toggled:', newTorchState)
    } catch (err) {
      console.error('Failed to toggle torch:', err)
    }
  }

  // Render UI berdasarkan state
  const renderContent = () => {
    switch (state) {
      case 'idle':
        return (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[300px]">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <div className="text-center max-w-xs">
              <h3 className="text-lg font-semibold text-gray-900">Siap Memindai</h3>
              <p className="text-sm text-gray-500 mt-1">Pastikan browser mengizinkan akses kamera</p>
              <p className="text-xs text-blue-600 mt-2 font-medium">✨ Mendukung scan dari layar HP</p>
            </div>
            <Button onClick={startCamera} size="lg" className="w-full max-w-xs bg-blue-600 hover:bg-blue-700">
              <Camera className="w-4 h-4 mr-2" />
              Mulai Kamera
            </Button>
            <div className="flex items-center gap-2 w-full max-w-xs">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-xs text-gray-400">ATAU</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full max-w-xs border-2 hover:bg-white"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Gambar QR
            </Button>
          </div>
        )

      case 'requesting':
        return (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-gray-50 min-h-[300px]">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-gray-600 font-medium">Meminta akses kamera...</p>
            <p className="text-xs text-gray-400">Mohon klik "Allow" atau "Izinkan" jika muncul popup</p>
            <Button variant="ghost" size="sm" onClick={() => { cleanup(); setState('idle'); }} className="mt-4 text-red-500 hover:text-red-600 hover:bg-red-50">
              Batal / Reset
            </Button>
          </div>
        )

      case 'scanning':
        return (
          <div className="relative bg-black min-h-[300px] flex flex-col">
            <video
              ref={onVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover flex-1"
              style={{ 
                width: '100%', 
                height: '100%',
                objectFit: 'cover',
                transform: 'none'
              }}
            />
            <div className="absolute top-2 right-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded pointer-events-none backdrop-blur-sm">
              <span className="font-semibold">🔍 Scanning...</span>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay Scanner - Larger scan area */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Dark overlay untuk fokus ke scan area */}
              <div className="absolute inset-0 bg-black/40"></div>
              
              {/* Scan area yang lebih fokus untuk laptop camera */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-white/70 rounded-lg z-10" style={{ maxWidth: '70vw', maxHeight: '70vw' }}>
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-green-400 -ml-1 -mt-1 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-green-400 -mr-1 -mt-1 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-green-400 -ml-1 -mb-1 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-green-400 -mr-1 -mb-1 rounded-br-lg"></div>
                
                {/* Scanning line animation */}
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan-line"></div>
                </div>
                
                {/* Instruction text */}
                <div className="absolute -bottom-20 left-0 right-0 text-center space-y-1">
                  <p className="text-white text-sm font-medium bg-black/70 px-4 py-2 rounded-full inline-block">
                    Posisikan QR di kotak hijau
                  </p>
                  <p className="text-white text-xs bg-black/60 px-3 py-1.5 rounded-full inline-block">
                    Jarak: 15-20cm | Hindari refleksi
                  </p>
                  <p className="text-yellow-300 text-xs bg-black/60 px-3 py-1 rounded-full inline-block font-semibold">
                    💡 Miringkan layar HP sedikit
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
              <Button variant="secondary" size="icon" onClick={() => fileInputRef.current?.click()} className="rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm shadow-lg" title="Upload Gambar">
                <ImageIcon className="w-5 h-5" />
              </Button>
              {torchSupported && (
                <Button 
                  variant="secondary" 
                  size="icon" 
                  onClick={toggleTorch} 
                  className={`rounded-full backdrop-blur-sm shadow-lg ${torchEnabled ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-white/20 hover:bg-white/40'} text-white`}
                  title={torchEnabled ? "Matikan Flash" : "Nyalakan Flash"}
                >
                  {torchEnabled ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
                </Button>
              )}
              <Button variant="secondary" size="icon" onClick={handleSwitchCamera} className="rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm shadow-lg" title="Ganti Kamera (Depan/Belakang)">
                <SwitchCamera className="w-5 h-5" />
              </Button>
              <Button variant="destructive" onClick={stopCamera} className="rounded-full px-6 shadow-lg">
                Stop
              </Button>
            </div>
          </div>
        )

      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-gray-50 min-h-[300px]">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900">Memproses QR Code...</h3>
            <p className="text-sm text-gray-500 font-mono bg-gray-200 px-2 py-1 rounded">{scanResult}</p>
          </div>
        )

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-green-50 min-h-[300px]">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-green-800">Berhasil!</h3>
              <p className="text-green-700 mt-2">{message}</p>
            </div>
            <div className="flex gap-3 w-full">
              <Button onClick={resetScanner} className="flex-1 bg-green-600 hover:bg-green-700">
                Scan Lagi
              </Button>
              <Link href="/dashboard/student" className="flex-1">
                <Button variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-100">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-red-50 min-h-[300px]">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-red-800">Gagal</h3>
              <p className="text-red-700 mt-2">{error || message}</p>
            </div>
            <div className="flex gap-3 w-full">
              <Button onClick={resetScanner} className="flex-1 bg-red-600 hover:bg-red-700">
                Coba Lagi
              </Button>
              <Button onClick={stopCamera} variant="outline" className="flex-1 border-red-600 text-red-700 hover:bg-red-100">
                Kembali
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="w-full rounded-lg overflow-hidden relative">
      {renderContent()}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleFileUpload}
      />
    </div>
  )
}
