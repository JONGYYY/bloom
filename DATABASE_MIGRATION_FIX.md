# Database Migration Fix

## Problem

The application was crashing with the error:
```
The column `brandName` does not exist in the current database.
```

## Root Cause

When we added new fields to the `StudioProfile` model in the Prisma schema:
- `brandName`
- `tagline`
- `description`
- `aestheticDesc`
- `toneKeywords`

We updated the schema file and regenerated the Prisma client (`npx prisma generate`), but we **never created or ran the database migration**. 

This meant:
- ✅ The TypeScript types were updated (no TS errors)
- ✅ The Prisma client expected these columns
- ❌ The actual database didn't have these columns

When the extraction worker tried to create a `StudioProfile` record with these new fields, PostgreSQL rejected it because the columns didn't exist.

## Solution

### 1. Created Migration (✅ Done)

Created migration file: `prisma/migrations/02_add_brand_identity_fields/migration.sql`

```sql
ALTER TABLE "StudioProfile" ADD COLUMN "brandName" TEXT,
ADD COLUMN "tagline" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "aestheticDesc" TEXT,
ADD COLUMN "toneKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
```

### 2. Pushed to GitHub (✅ Done)

Committed and pushed the migration file.

### 3. Railway Will Auto-Apply (⏳ Pending)

Railway should automatically detect the new migration and run it during the next deployment. The `npm run start` command includes a postinstall hook that runs `prisma generate`, and Railway should run migrations.

## Verification

After Railway redeploys, verify the migration was applied:

1. Check Railway logs for migration output
2. Try creating a new studio from a website
3. The extraction should complete successfully without column errors

## Prevention

To prevent this in the future:

1. **Always create migrations when changing schema:**
   ```bash
   npx prisma migrate dev --name descriptive_name
   ```

2. **Test locally before pushing:**
   - Run migrations locally
   - Test the full flow
   - Then push to production

3. **Check Railway logs after deployment:**
   - Verify migrations ran successfully
   - Look for any Prisma errors

## What Railway Should Do Automatically

Railway's build process should:
1. Install dependencies (`npm install`)
2. Run postinstall hook (`prisma generate`)
3. **Run pending migrations** (`prisma migrate deploy` or similar)
4. Start the application

If migrations aren't running automatically, you may need to add a migration command to Railway's start command or build command.

## Manual Migration (If Needed)

If Railway doesn't auto-apply migrations, you can manually run:

```bash
# In Railway's shell or via Railway CLI
npx prisma migrate deploy
```

This will apply all pending migrations to the production database.

## Current Status

- ✅ Migration file created
- ✅ Pushed to GitHub (commit: 90ba62e)
- ⏳ Waiting for Railway to redeploy and apply migration
- ⏳ Need to verify extraction works after migration

## Files Changed

- `prisma/migrations/02_add_brand_identity_fields/migration.sql` (NEW)

## Related Issues

This was discovered when trying to analyze a brand (gumroad.com) and the extraction worker failed at the `prisma.studioProfile.create()` step.
