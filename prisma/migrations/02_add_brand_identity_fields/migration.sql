-- AlterTable
ALTER TABLE "StudioProfile" ADD COLUMN "brandName" TEXT,
ADD COLUMN "tagline" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "aestheticDesc" TEXT,
ADD COLUMN "toneKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
