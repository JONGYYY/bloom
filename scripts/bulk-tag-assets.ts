#!/usr/bin/env tsx
/**
 * Bulk tag all brand assets for studios
 * 
 * Usage:
 *   npm run tag-assets [studioId]
 *   
 * If no studioId is provided, tags assets for all studios
 */

import { prisma } from '../src/lib/db'
import { bulkTagAssets } from '../src/lib/prompt'

async function main() {
  const studioId = process.argv[2]

  if (studioId) {
    // Tag assets for specific studio
    console.log(`\n🏷️  Tagging assets for studio: ${studioId}\n`)
    
    const results = await bulkTagAssets(studioId)
    
    console.log(`\n✅ Complete!`)
    console.log(`   Tagged: ${results.tagged}`)
    console.log(`   Skipped: ${results.skipped}`)
    console.log(`   Errors: ${results.errors}\n`)
  } else {
    // Tag assets for all studios
    console.log(`\n🏷️  Tagging assets for all studios\n`)
    
    const studios = await prisma.studio.findMany({
      select: {
        id: true,
        displayName: true,
        rootDomain: true,
      },
    })

    console.log(`Found ${studios.length} studios\n`)

    let totalTagged = 0
    let totalSkipped = 0
    let totalErrors = 0

    for (const studio of studios) {
      const studioName = studio.displayName || studio.rootDomain
      console.log(`\n📦 Processing: ${studioName} (${studio.id})`)
      
      try {
        const results = await bulkTagAssets(studio.id)
        
        console.log(`   ✓ Tagged: ${results.tagged}, Skipped: ${results.skipped}, Errors: ${results.errors}`)
        
        totalTagged += results.tagged
        totalSkipped += results.skipped
        totalErrors += results.errors
      } catch (error) {
        console.error(`   ✗ Error processing studio:`, error)
        totalErrors++
      }
    }

    console.log(`\n✅ All studios processed!`)
    console.log(`   Total tagged: ${totalTagged}`)
    console.log(`   Total skipped: ${totalSkipped}`)
    console.log(`   Total errors: ${totalErrors}\n`)
  }

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
