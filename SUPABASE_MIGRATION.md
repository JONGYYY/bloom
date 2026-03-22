# Supabase Migration Guide

This document explains the migration from Clerk to Supabase authentication.

## What Changed

### 1. Dependencies
- **Removed**: `@clerk/nextjs`
- **Added**: `@supabase/supabase-js`, `@supabase/ssr`, `@radix-ui/react-dropdown-menu`

### 2. Database Schema
The `User` model in Prisma schema was updated:
- **Changed**: `clerkId` → `authId` (references Supabase `auth.users.id`)
- **Note**: This requires a database migration

### 3. Authentication Files
- **New**: `src/lib/supabase/client.ts` - Browser client
- **New**: `src/lib/supabase/server.ts` - Server client
- **New**: `src/lib/supabase/middleware.ts` - Middleware helper
- **Replaced**: `src/app/(auth)/sign-in/page.tsx` - Custom sign-in form
- **Replaced**: `src/app/(auth)/sign-up/page.tsx` - Custom sign-up form
- **New**: `src/app/(auth)/layout.tsx` - Auth pages layout
- **New**: `src/components/app-shell/user-menu.tsx` - User dropdown menu
- **Updated**: `src/components/app-shell/topbar.tsx` - Uses UserMenu instead of Clerk's UserButton
- **Updated**: `src/middleware.ts` - Uses Supabase session check

### 4. API Routes
All API routes updated to use Supabase auth:
- `src/app/api/brands/route.ts`
- `src/app/api/brands/[brandId]/profile/route.ts`
- `src/app/api/brands/[brandId]/profile/confirm/route.ts`
- `src/app/api/brands/[brandId]/job/route.ts`

### 5. Layouts
- **Updated**: `src/app/layout.tsx` - Removed ClerkProvider
- **Updated**: `src/app/(app)/layout.tsx` - Fetches user from Supabase, passes to Topbar

### 6. Environment Variables
**Old (Clerk)**:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**New (Supabase)**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be provisioned

### 2. Get Supabase Credentials

1. In your Supabase project dashboard
2. Go to Settings → API
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Authentication

1. In Supabase dashboard, go to Authentication → URL Configuration
2. Add your site URLs:
   - **Site URL**: `http://localhost:3000` (development) or your production URL
   - **Redirect URLs**: Add `http://localhost:3000/**` and your production URL pattern

### 4. Update Environment Variables

Update your `.env` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run Database Migration

**IMPORTANT**: You need to migrate your database schema to rename `clerkId` to `authId`.

If you have existing data, create a migration:

```sql
-- Migration: Replace clerkId with authId
ALTER TABLE "User" RENAME COLUMN "clerkId" TO "authId";
```

If starting fresh, just run:
```bash
npx prisma migrate dev --name replace_clerk_with_supabase
```

Or for production:
```bash
npx prisma migrate deploy
```

### 6. Regenerate Prisma Client

```bash
npx prisma generate
```

### 7. Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and test:
1. Sign up with a new account
2. Sign in
3. Navigate to dashboard
4. Sign out
5. Try accessing protected routes when logged out

## Railway Deployment

### Update Environment Variables

In Railway, update your environment variables:

1. **Remove** all Clerk variables
2. **Add** Supabase variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Update Supabase Redirect URLs

In Supabase dashboard → Authentication → URL Configuration:
- Add your Railway production URL to redirect URLs
- Example: `https://your-app.railway.app/**`

### Deploy

Push your changes to GitHub, Railway will automatically redeploy.

## Data Migration (If You Have Existing Users)

If you have existing users in your database with Clerk IDs:

1. **Export user data** from Clerk
2. **Create Supabase accounts** for each user (can use Supabase Management API)
3. **Update database** to map old `clerkId` to new Supabase `authId`

Example migration script concept:
```typescript
// For each existing user in database:
// 1. Create Supabase user with same email
// 2. Get new Supabase user ID
// 3. Update database record: authId = supabaseUserId
```

## Benefits of Supabase

1. **Cost**: Free tier includes 50,000 monthly active users (vs Clerk's 10,000)
2. **Database**: Direct PostgreSQL access, no separate database needed
3. **Simplicity**: One service for auth + database
4. **Control**: More control over auth flows and UI
5. **Open Source**: Self-hostable if needed

## Troubleshooting

### Build Errors
- Run `npx prisma generate` after schema changes
- Clear `.next` folder: `rm -rf .next`

### Auth Not Working
- Check Supabase project is active
- Verify environment variables are set correctly
- Check redirect URLs in Supabase dashboard
- Ensure cookies are enabled in browser

### Database Errors
- Verify `DATABASE_URL` is correct
- Run migrations: `npx prisma migrate deploy`
- Check database schema matches Prisma schema

## Rollback Plan

If you need to rollback to Clerk:

1. Revert code changes (use git)
2. Restore Clerk environment variables
3. Revert database schema migration
4. Redeploy

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Next.js + Supabase: https://supabase.com/docs/guides/auth/server-side/nextjs
