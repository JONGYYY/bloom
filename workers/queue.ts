import { Queue, Worker, QueueEvents } from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

// Create queues
export const preflightQueue = new Queue('preflight', { connection })
export const browserRenderQueue = new Queue('browser-render', { connection })
export const extractionQueue = new Queue('extraction', { connection })

// Queue events for monitoring
export const preflightEvents = new QueueEvents('preflight', { connection })
export const browserRenderEvents = new QueueEvents('browser-render', { connection })
export const extractionEvents = new QueueEvents('extraction', { connection })

export { connection }
