#!/usr/bin/env node

/**
 * Main worker process that starts all background workers
 * Run with: npm run workers
 */

import './preflight'
import './browser-render'
import './extraction'

console.log('[Workers] All workers started successfully')

// Keep process alive
process.on('SIGTERM', () => {
  console.log('[Workers] Received SIGTERM, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('[Workers] Received SIGINT, shutting down gracefully')
  process.exit(0)
})
