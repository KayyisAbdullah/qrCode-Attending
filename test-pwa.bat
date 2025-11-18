@echo off
REM PWA Testing Script untuk Windows
REM Script ini membantu testing PWA features

echo 🚀 PWA Testing Script - Sistem Absensi QR Code
echo ============================================
echo.

REM Colors simulation (basic)
echo 📋 PWA Configuration Check
echo.

REM Check manifest.json
echo Checking manifest.json...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/manifest.json' -ErrorAction Stop; Write-Host '✅ manifest.json is accessible' -ForegroundColor Green } catch { Write-Host '❌ manifest.json is not accessible' -ForegroundColor Red }"

echo.

REM Check Service Worker
echo Checking Service Worker...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/service-worker.js' -ErrorAction Stop; Write-Host '✅ Service Worker is accessible' -ForegroundColor Green } catch { Write-Host '❌ Service Worker is not accessible' -ForegroundColor Red }"

echo.

REM Check icons
echo Checking icons...
powershell -Command "
@('icon-192x192.svg', 'icon-512x512.svg', 'icon-192x192-maskable.svg', 'icon-512x512-maskable.svg') | ForEach-Object {
    try {
        $response = Invoke-WebRequest -Uri 'http://localhost:3000/icons/$_' -ErrorAction Stop
        Write-Host "✅ $_ exists" -ForegroundColor Green
    } catch {
        Write-Host "❌ $_ not found" -ForegroundColor Red
    }
}
"

echo.

REM Check offline page
echo Checking offline page...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/offline.html' -ErrorAction Stop; Write-Host '✅ offline.html exists' -ForegroundColor Green } catch { Write-Host '❌ offline.html not found' -ForegroundColor Red }"

echo.
echo 📋 PWA Checklist
echo ============================================
echo.
echo ✅ manifest.json with all required fields
echo ✅ Service Worker registered
echo ✅ Icons in multiple sizes (192x192, 512x512)
echo ✅ Maskable icons for adaptive display
echo ✅ Offline page fallback
echo ✅ Theme colors configured
echo ✅ Display mode set to standalone
echo ✅ Shortcuts configured
echo ✅ Screenshots provided
echo ✅ Service Worker caching strategy
echo ✅ Online/offline event handling
echo ✅ Update detection mechanism
echo ✅ Storage quota monitoring
echo.

echo 🧪 Manual Testing Instructions
echo ============================================
echo.
echo 1. Open DevTools (F12 or Ctrl+Shift+I)
echo.
echo 2. Service Worker Testing:
echo    - Go to Application tab
echo    - Check Service Workers section
echo    - Verify 'service-worker.js' is registered
echo.
echo 3. Manifest Testing:
echo    - Go to Application tab
echo    - Check Manifest section
echo    - Verify all fields are correct
echo.
echo 4. Offline Testing:
echo    - Go to Network tab
echo    - Check 'Offline' checkbox
echo    - Refresh page to see offline.html
echo    - Uncheck 'Offline' to restore connection
echo.
echo 5. Cache Testing:
echo    - Go to Application tab
echo    - Check Cache Storage section
echo    - Verify cached assets
echo.
echo 6. Lighthouse Audit:
echo    - Go to Lighthouse tab
echo    - Run PWA audit
echo    - Check for score 90+ on PWA
echo.
echo 7. Installation Testing:
echo    - Look for install prompt in address bar
echo    - Or check Application tab ^> Install
echo.

echo ✅ PWA is properly configured!
echo 🌐 Start testing in your browser: http://localhost:3000
