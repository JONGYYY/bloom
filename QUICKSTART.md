# Quick Start Guide

Get the Campaign Generator MVP running locally in minutes.

## Prerequisites

Before you begin, ensure you have:

- [Node.js 18+](https://nodejs.org/) installed
- [PostgreSQL](https://www.postgresql.org/) installed and running
- [Redis](https://redis.io/) installed and running
- [Clerk](https://clerk.com/) account (free tier works)
- [OpenAI](https://openai.com/) API key
- [AWS](https://aws.amazon.com/) account with S3 bucket

## Step 1: Clone and Install

```bash
cd /Users/jonathanshan/Bloom
npm install
```

## Step 2: Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://user:password@localhost:5432/bloom"

# Redis - Default local Redis
REDIS_URL="redis://localhost:6379"

# Clerk - Get these from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# OpenAI - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-..."

# AWS S3 - Create bucket and get credentials
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
S3_BUCKET_NAME="brand-assets"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## Step 3: Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

## Step 4: Start the Application

You need **two terminal windows**:

### Terminal 1: Next.js App

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Terminal 2: Background Workers

```bash
npm run workers
```

Workers will start processing jobs from the queue.

## Step 5: Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Get Started" or "Sign Up"
3. Create an account (Clerk handles this)
4. Once logged in, click "Add Brand"
5. Enter a website URL (e.g., https://stripe.com)
6. Watch the extraction process in real-time
7. Review and confirm your brand profile

## Troubleshooting

### PostgreSQL Connection Error

```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

### Redis Connection Error

```bash
# Check if Redis is running
redis-cli ping

# If not running, start it
brew services start redis  # macOS
sudo service redis-server start  # Linux
```

### Clerk Authentication Issues

1. Go to https://dashboard.clerk.com
2. Check your application settings
3. Ensure "Development" instance is selected
4. Add `http://localhost:3000` to allowed origins

### Workers Not Processing

1. Check Redis is running: `redis-cli ping`
2. Check worker logs in Terminal 2
3. Verify environment variables are set
4. Restart workers: `Ctrl+C` then `npm run workers`

### OpenAI API Errors

1. Verify your API key is correct
2. Check you have credits: https://platform.openai.com/usage
3. Ensure you have access to GPT-4 Vision

### S3 Upload Errors

1. Verify AWS credentials are correct
2. Check bucket exists and is in correct region
3. Verify IAM permissions for S3 uploads

## Optional: Use Docker

If you prefer Docker:

```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down
```

## Optional: View Database

```bash
# Open Prisma Studio
npm run prisma:studio
```

This opens a GUI at http://localhost:5555 to view/edit database records.

## Next Steps

- Explore the app and submit test brand URLs
- Review the brand extraction results
- Check out the documentation in `/docs`
- Read the implementation summary in `IMPLEMENTATION_SUMMARY.md`

## Development Tips

### Hot Reload

- Next.js automatically reloads on file changes
- Workers need manual restart after code changes

### Debugging

- Check browser console for frontend errors
- Check terminal output for backend errors
- Check worker terminal for job processing errors
- Use Prisma Studio to inspect database

### Testing Different Brands

Try these URLs for testing:
- https://stripe.com
- https://airbnb.com
- https://shopify.com
- https://linear.app
- https://vercel.com

## Common Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run workers          # Start background workers

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open database GUI

# Production
npm run build            # Build for production
npm start                # Start production server

# Docker
docker-compose up        # Start all services
docker-compose down      # Stop all services
```

## Getting Help

- Check `README.md` for detailed information
- Review `docs/architecture.md` for system design
- See `docs/deployment.md` for production deployment
- Check `IMPLEMENTATION_SUMMARY.md` for what's implemented

## What's Working

✅ User authentication (Clerk)
✅ Brand URL submission
✅ Async extraction with workers
✅ Real-time progress tracking
✅ AI-powered brand analysis (GPT-4 Vision)
✅ Brand review wizard
✅ Profile confirmation
✅ Premium UI with chromic glass design

## What's Not Yet Implemented

❌ Campaign generation (Phase 3)
❌ Asset editing (Phase 4)
❌ Export functionality (Phase 4)
❌ Shopify integration (Phase 5)
❌ Analytics (Phase 5)

## Support

For issues or questions, check the documentation or review the code comments.

Happy building! 🚀
