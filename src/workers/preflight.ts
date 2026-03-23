import { Worker, Job } from 'bullmq'
import { connection, browserRenderQueue } from './queue'
import { prisma } from '@/lib/db'

interface PreflightJobData {
  studioId: string
  url: string
  jobId: string
}

async function processPreflightJob(job: Job<PreflightJobData>) {
  const { studioId, url, jobId } = job.data

  try {
    console.log(`[Preflight] Starting for studio ${studioId}`)

    // Update job stage
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: 'processing',
        stage: 'preflight',
        progress: 10,
      },
    })

    // Validate URL accessibility
    const urlObj = new URL(url)
    
    // Check if URL is reachable with a HEAD request
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CampaignGenerator/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`URL returned status ${response.status}`)
    }

    console.log(`[Preflight] URL is accessible: ${url}`)

    // Check robots.txt (simplified - just check if it exists)
    try {
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`
      await fetch(robotsUrl, { method: 'HEAD' })
    } catch (error) {
      console.log(`[Preflight] No robots.txt found (this is okay)`)
    }

    // Update job stage
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        stage: 'preflight_complete',
        progress: 20,
      },
    })

    // Enqueue browser render job
    await browserRenderQueue.add('render', {
      studioId,
      url,
      jobId,
    })

    console.log(`[Preflight] Complete for studio ${studioId}, enqueued browser render`)

    return { success: true }
  } catch (error) {
    console.error(`[Preflight] Error for studio ${studioId}:`, error)

    // Update job as failed
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Preflight failed',
      },
    })

    throw error
  }
}

// Create worker
export const preflightWorker = new Worker<PreflightJobData>(
  'preflight',
  processPreflightJob,
  {
    connection,
    concurrency: 5,
  }
)

preflightWorker.on('completed', (job) => {
  console.log(`[Preflight Worker] Job ${job.id} completed`)
})

preflightWorker.on('failed', (job, err) => {
  console.error(`[Preflight Worker] Job ${job?.id} failed:`, err)
})

console.log('[Preflight Worker] Started')
