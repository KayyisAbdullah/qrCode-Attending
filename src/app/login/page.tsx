'use client'

// Updated design v2 - force browser refresh
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store user data and token
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userRole', data.role)
        localStorage.setItem('userData', JSON.stringify(data.user))
        
        // Redirect based on role
        setTimeout(() => {
          if (data.role === 'admin') {
            window.location.href = '/dashboard/admin'
          } else {
            window.location.href = '/dashboard/student'
          }
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

  if (!isMounted) {
    return null
  }

  return (
    <div key="login-v2" className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>

        <Card className="shadow-lg border border-gray-200 rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-8 bg-white">
            {/* Header Icon and Title */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang</h1>
              <p className="text-gray-600 text-base">Masuk ke sistem absensi digital</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium text-sm">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 text-base border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-12 transition-all duration-200 bg-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium text-base transition-all duration-200 rounded-lg mt-4"
                disabled={isLoading || !username || !password}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    <span>Memuat...</span>
                  </div>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                Belum ada akun?{' '}
                <Link href="/register" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
                  Register disini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
