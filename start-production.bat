@echo off
REM Production Startup Script for AbsensiQR (Windows)

setlocal enabledelayedexpansion

REM Set environment variables
set NODE_ENV=production
set DATABASE_URL=file:./prod.db
set NODE_OPTIONS=--max-old-space-size=512

REM Check if database exists
if not exist "prod.db" (
  echo Creating production database...
  call npx prisma db push --skip-generate
  call npx ts-node prisma/seed.ts
)

REM Start the server
echo Starting AbsensiQR production server on port 3500...
node .next/standalone/server.js

pause
