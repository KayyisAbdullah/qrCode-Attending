#!/bin/bash
# Production Startup Script for AbsensiQR

# Set environment variables
export NODE_ENV=production
export DATABASE_URL="file:./prod.db"
export NODE_OPTIONS="--max-old-space-size=512"

# Ensure database exists
if [ ! -f "prod.db" ]; then
  echo "Creating production database..."
  npx prisma db push --skip-generate
  npx ts-node prisma/seed.ts
fi

# Start the server
echo "Starting AbsensiQR production server..."
node .next/standalone/server.js
