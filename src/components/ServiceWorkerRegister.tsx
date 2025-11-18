'use client'

import { useEffect, useState } from 'react'

export function ServiceWorkerRegister() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)
  const [isCacheFull, setIsCacheFull] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Workers not supported')
      return
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
          updateViaCache: 'none'
        })

        console.log('[PWA] Service Worker registered:', registration)
        setIsRegistered(true)

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('[PWA] Service Worker updated')
              setIsUpdate(true)
              
              // Show update prompt to user
              if (confirm('Versi baru aplikasi tersedia! Muat ulang halaman?')) {
                window.location.reload()
              }
            }
          })
        })

        // Check for updates periodically
        setInterval(() => {
          registration.update().catch((error) => {
            console.log('[PWA] Update check failed:', error)
          })
        }, 60000) // Every minute

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error)
        setIsRegistered(false)
      }
    }

    // Register on page load
    registerServiceWorker()

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('[PWA] Application is online')
      // Clear cache to fetch fresh data
      if ('caches' in window) {
        navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' })
      }
    }

    const handleOffline = () => {
      console.log('[PWA] Application is offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }

  }, [])

  // Check if PWA can be installed (for install prompt)
  useEffect(() => {
    let deferredPrompt: any

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e
      console.log('[PWA] Install prompt available')
      
      // You can show an install button here
      // For now, we'll just store it for later use
      sessionStorage.setItem('installPrompt', 'available')
    }

    const handleAppInstalled = () => {
      console.log('[PWA] App installed')
      sessionStorage.removeItem('installPrompt')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Check storage quota
  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate()
        .then((storageData) => {
          if (!storageData || typeof storageData !== 'object') {
            console.log('[PWA] Storage estimate returned invalid data')
            return
          }

          const { usage = 0, quota = 0 } = storageData as { usage: number; quota: number }
          
          if (!quota || quota === 0) {
            console.log('[PWA] Storage quota information unavailable')
            return
          }

          const percentUsed = (usage / quota) * 100
          console.log(`[PWA] Storage: ${percentUsed.toFixed(2)}% used (${usage} of ${quota} bytes)`)
          
          if (percentUsed > 90) {
            console.warn('[PWA] Storage quota is almost full')
            setIsCacheFull(true)
            
            // Clear old caches if storage is too full
            if ('caches' in window) {
              caches.keys().then((names) => {
                names.forEach((name) => {
                  if (name !== 'absensi-qr-v1') {
                    caches.delete(name).catch(() => {
                      // Ignore cache delete errors
                    })
                  }
                })
              })
            }
          }
        })
        .catch((error) => {
          console.log('[PWA] Storage quota check failed:', error)
        })
    }
  }, [])

  return null // This component doesn't render anything
}

export default ServiceWorkerRegister
