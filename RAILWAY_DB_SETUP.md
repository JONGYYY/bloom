# Railway Database Setup

Your database tables don't exist yet. You need to run the Prisma migrations.

## Option 1: Run via Railway CLI (Recommended)

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```

4. Run migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```

## Option 2: Run Manually in Railway Dashboard

1. Go to your Railway project
2. Click on your PostgreSQL database
3. Click "Query" tab
4. Copy and paste the entire contents of `prisma/migrations/00_init/migration.sql`
5. Click "Run Query"

## Option 3: Update Build Command in Railway

Change your web service build command to include migration:

```
npm run build && npx prisma migrate deploy
```

This will run migrations automatically on every deploy.

## Verify Tables Were Created

After running migrations, you can verify by running this query in Railway's Query tab:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see: User, Workspace, Brand, BrandProfile, BrandAsset, GenerationJob
