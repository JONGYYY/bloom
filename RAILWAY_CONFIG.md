# Railway Configuration Fix

The build is failing because migrations are trying to run during build time when the database isn't accessible.

## Solution: Update Railway Settings

### For Web Service:

1. Go to Railway → Your web service → Settings
2. Update these commands:

**Build Command:**
```
npm run build
```

**Start Command:**
```
sh scripts/start.sh
```

OR if you prefer inline:

**Start Command:**
```
npx prisma migrate deploy && npm start
```

### Why This Works

- **Build time**: Only builds the Next.js app (no database needed)
- **Start time**: Runs migrations first, then starts the server (database is available)

### Alternative: Use Railway's Deploy Lifecycle

If the above doesn't work, you can also set:

**Build Command:**
```
npm run build
```

**Start Command:**
```
npm start
```

Then manually run migrations once via Railway CLI:
```bash
railway run npx prisma migrate deploy
```

## Current Issue

Your current build command is:
```
npm run build && npx prisma migrate deploy
```

This fails because the database isn't available during build time. The migration must run at start time instead.
