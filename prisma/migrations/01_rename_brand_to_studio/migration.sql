-- Rename Brand table to Studio
ALTER TABLE "Brand" RENAME TO "Studio";

-- Rename BrandProfile table to StudioProfile
ALTER TABLE "BrandProfile" RENAME TO "StudioProfile";

-- Rename brandId column to studioId in StudioProfile
ALTER TABLE "StudioProfile" RENAME COLUMN "brandId" TO "studioId";

-- Rename brandId column to studioId in BrandAsset
ALTER TABLE "BrandAsset" RENAME COLUMN "brandId" TO "studioId";

-- Rename brandId column to studioId in GenerationJob
ALTER TABLE "GenerationJob" RENAME COLUMN "brandId" TO "studioId";

-- Update foreign key constraint names
ALTER TABLE "StudioProfile" RENAME CONSTRAINT "BrandProfile_brandId_fkey" TO "StudioProfile_studioId_fkey";
ALTER TABLE "BrandAsset" RENAME CONSTRAINT "BrandAsset_brandId_fkey" TO "BrandAsset_studioId_fkey";
ALTER TABLE "GenerationJob" RENAME CONSTRAINT "GenerationJob_brandId_fkey" TO "GenerationJob_studioId_fkey";

-- Update unique constraint name
ALTER INDEX "BrandProfile_brandId_key" RENAME TO "StudioProfile_studioId_key";

-- Update relation name in Workspace
ALTER TABLE "Studio" RENAME CONSTRAINT "Brand_workspaceId_fkey" TO "Studio_workspaceId_fkey";

-- Create Generation table
CREATE TABLE "Generation" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- Create Asset table
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "generationId" TEXT,
    "type" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT,
    "prompt" TEXT,
    "parameters" JSONB,
    "metadata" JSONB,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isReference" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- Create Preset table
CREATE TABLE "Preset" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Preset_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys for new tables
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Preset" ADD CONSTRAINT "Preset_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create indexes for better query performance
CREATE INDEX "Generation_studioId_idx" ON "Generation"("studioId");
CREATE INDEX "Asset_studioId_idx" ON "Asset"("studioId");
CREATE INDEX "Asset_generationId_idx" ON "Asset"("generationId");
CREATE INDEX "Asset_isFavorite_idx" ON "Asset"("isFavorite");
CREATE INDEX "Asset_isReference_idx" ON "Asset"("isReference");
CREATE INDEX "Preset_studioId_idx" ON "Preset"("studioId");
