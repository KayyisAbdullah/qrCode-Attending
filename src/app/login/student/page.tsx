'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserCheck, QrCode, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function StudentLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  
  // Form states for username/password login
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store token and user data
        localStorage.setItem('studentToken', data.token)
        localStorage.setItem('studentData', JSON.stringify(data.student))
        
        // Redirect to student dashboard
        setTimeout(() => {
          window.location.href = '/dashboard/student'
        }, 500)
      } else {
        setError(data.message || 'Login gagal. Silakan coba lagi.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQRCodeLogin = () => {
    // Redirect to QR Code scanner page
    window.location.href = '/scan-qr'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Login Siswa</CardTitle>
            <CardDescription>
              Pilih metode login untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="username" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="username">Username</TabsTrigger>
                <TabsTrigger value="qrcode">QR Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="username" className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleUsernameLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Masukkan username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Memuat...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="qrcode" className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Scan QR Code</h3>
                    <p className="text-sm text-gray-600">
                      Gunakan kamera untuk memindai QR Code yang telah disediakan
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleQRCodeLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Memuat...' : 'Buka Scanner QR Code'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}