import { Queue, QueueEvents } from 'bullmq'
import type { ConnectionOptions } from 'bullmq'

// Parse Redis URL
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
const url = new URL(redisUrl)

// Create connection options compatible with BullMQ
export const connection: ConnectionOptions = {
  host: url.hostname,
  port: parseInt(url.port) || 6379,
  password: url.password || undefined,
  maxRetriesPerRequest: null,
}

// Create queues
export const preflightQueue = new Queue('preflight', { connection })
export const browserRenderQueue = new Queue('browser-render', { connection })
export const extractionQueue = new Queue('extraction', { connection })

// Queue events for monitoring
export const preflightEvents = new QueueEvents('preflight', { connection })
export const browserRenderEvents = new QueueEvents('browser-render', { connection })
export const extractionEvents = new QueueEvents('extraction', { connection })
