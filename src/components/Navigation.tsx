'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { QrCode, Menu, X, Settings, HelpCircle } from 'lucide-react'

export function Navigation() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AbsensiQR</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <a href="#features" className="text-white hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Fitur
            </a>
            <a href="#" className="text-white hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Bantuan
            </a>
            <a href="/login" className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold transition-colors ml-4">
              Login
            </a>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-white hover:bg-blue-500"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMounted && showMobileMenu && (
        <div className="md:hidden bg-blue-500 border-t border-blue-400">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a href="#features" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-lg">Fitur</a>
            <a href="#" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-lg">Bantuan</a>
            <a href="/login" className="block px-3 py-2 bg-white text-blue-600 rounded-lg font-medium mt-2">
              Login
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
