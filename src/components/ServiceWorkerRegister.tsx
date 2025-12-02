'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const register = async () => {
      try {
        // Register new service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js?v=13.0', {
          scope: '/',
          updateViaCache: 'none'
        })

        console.log('[PWA] Service Worker registered:', registration)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                console.log('[PWA] New version activated')
              }
            })
          }
        })
      } catch (error) {
        console.error('[PWA] Registration failed:', error)
      }
    }

    register()
  }, [])

  return null
}
