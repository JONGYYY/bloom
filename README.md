# Campaign Generator MVP

A product-aware campaign generator that turns brand URLs into campaign-ready assets with AI-powered brand extraction and review.

## Overview

Campaign Generator differentiates from competitors by focusing on:
- **Brand review as a first-class step** (not hidden)
- **Product context and campaign goals** (not just style matching)
- **Campaign-set generation** (not one-off assets)
- **Structured-lite editing** with premium SaaS UX

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router, TypeScript, React 19
- **Styling**: Tailwind CSS v4 with custom chromic glass design system
- **Components**: shadcn/ui (customized)
- **Animation**: Framer Motion
- **State**: TanStack Query for server state
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Auth**: Clerk

### Backend
- **Runtime**: Node.js with Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: BullMQ with Redis for async job processing
- **Browser Automation**: Puppeteer for brand extraction
- **AI**: OpenAI GPT-4 Vision for brand analysis
- **Storage**: AWS S3 for screenshots and assets
- **Deployment**: Railway (with Docker containers)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis instance
- AWS S3 bucket (or compatible storage)
- Clerk account for authentication
- OpenAI API key

### Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Fill in your environment variables in `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bloom"

# Redis
REDIS_URL="redis://localhost:6379"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# OpenAI
OPENAI_API_KEY="sk-..."

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
S3_BUCKET_NAME="brand-assets"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Installation

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run prisma:generate
```

3. Run database migrations:

```bash
npm run prisma:migrate
```

### Running the Application

You need to run two processes:

1. **Next.js development server** (in one terminal):

```bash
npm run dev
```

2. **Background workers** (in another terminal):

```bash
npm run workers
```

The app will be available at `http://localhost:3000`

### Database Management

- **Prisma Studio** (database GUI):

```bash
npm run prisma:studio
```

- **Create migration**:

```bash
npx prisma migrate dev --name your_migration_name
```

## Project Structure

```
/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (marketing)/          # Public marketing pages
│   │   ├── (auth)/                # Authentication pages
│   │   ├── (app)/                 # Authenticated app pages
│   │   └── api/                   # API routes
│   ├── components/                # React components
│   │   ├── ui/                    # Base UI components
│   │   ├── app-shell/             # Shell components
│   │   ├── brand-review/          # Review wizard components
│   │   └── shared/                # Shared components
│   ├── lib/                       # Utilities
│   ├── hooks/                     # Custom React hooks
│   ├── styles/                    # Global styles
│   ├── types/                     # TypeScript types
│   └── workers/                   # Background workers
│       ├── queue.ts               # BullMQ setup
│       ├── preflight.ts           # URL validation worker
│       ├── browser-render.ts      # Screenshot capture worker
│       ├── extraction.ts          # AI extraction worker
│       └── index.ts               # Main worker process
├── prisma/
│   └── schema.prisma              # Database schema
└── docker/                        # Docker configurations
```

## Features

### Phase 1-2 (Current MVP)

✅ **Authentication & Onboarding**
- Clerk-powered authentication
- Landing page with clear value proposition
- Premium chromic glass design system

✅ **Brand Ingestion**
- URL submission with validation
- Async extraction pipeline with BullMQ
- Real-time job status polling
- Preflight URL validation
- Browser rendering (desktop & mobile screenshots)
- AI-powered brand extraction with GPT-4 Vision

✅ **Brand Review Wizard**
- Multi-step wizard with stepper
- Color palette review
- Typography selection
- Logo candidate selection
- Style trait definition
- Live preview panel
- Form state management with React Hook Form
- Profile confirmation

### Future Phases

**Phase 3 (V1.5)**: Campaign Builder
- Product/offer context input
- Campaign goal selection
- Format selection
- Campaign set generation
- Results page with concept grouping

**Phase 4 (V1.5)**: Editing & Export
- Structured-lite editing
- Asset detail/edit page
- Export flow
- Campaign history

**Phase 5 (V2)**: Integrations & Analytics
- Shopify sync
- Ad platform publishing
- Analytics feedback loop
- Multi-brand workspaces

## Design System: Chromic Glass

The app uses a custom "chromic glass for serious operators" design language featuring:

- **Layered translucent surfaces** with backdrop blur
- **Cool metallic undertones** with controlled spectral accents
- **Deep neutral foundation** (Obsidian, Graphite, Slate)
- **Chromic accents** (Violet, Cyan, Teal)
- **Premium feel** without gimmicks

### Color Palette

- **Neutrals**: Obsidian 950, Graphite 900, Slate Glass 800, Pearl 100, Mist 300
- **Chromic Accents**: Spectrum Violet 500, Aurora Cyan 500, Signal Teal 500
- **Warm Accent**: Ion Amber 400
- **Semantic**: Success 500, Warning 500, Danger 500

## API Routes

### Brands
- `POST /api/brands` - Create brand + start extraction
- `GET /api/brands` - List user's brands
- `GET /api/brands/[brandId]` - Get brand details
- `PATCH /api/brands/[brandId]` - Update brand metadata
- `DELETE /api/brands/[brandId]` - Delete brand

### Brand Profiles
- `GET /api/brands/[brandId]/profile` - Get current profile
- `PATCH /api/brands/[brandId]/profile` - Update profile
- `POST /api/brands/[brandId]/profile/confirm` - Confirm profile

### Jobs
- `GET /api/brands/[brandId]/job` - Get job status

## Worker Architecture

The app uses BullMQ for async job processing with three main workers:

1. **Preflight Worker**: Validates URL accessibility and checks robots.txt
2. **Browser Render Worker**: Captures screenshots using Puppeteer and uploads to S3
3. **Extraction Worker**: Analyzes screenshots with GPT-4 Vision and creates brand profile

### Job Flow

```
User submits URL
  → Create Brand + GenerationJob
  → Enqueue preflight job
  → Preflight validates URL
  → Enqueue browser-render job
  → Browser captures screenshots
  → Enqueue ai-extraction job
  → AI analyzes and creates BrandProfile
  → Job marked completed
  → User proceeds to review
```

## Deployment

### Railway Deployment

1. Create a new Railway project
2. Add PostgreSQL and Redis services
3. Set environment variables
4. Deploy the web service (Next.js app)
5. Deploy the worker service separately

### Docker

Dockerfiles are provided in the `docker/` directory:
- `Dockerfile.web` - Next.js application
- `Dockerfile.worker` - Background workers

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling (no inline styles)
- Use shadcn/ui components as base (customize as needed)
- Keep components small and focused
- Use server components by default, client components when needed

### Git Workflow

- Main branch is protected
- Create feature branches for new work
- Write descriptive commit messages
- Test locally before pushing

## Troubleshooting

### Workers not processing jobs

1. Check Redis connection: `redis-cli ping`
2. Check worker logs for errors
3. Verify environment variables are set
4. Restart workers: `npm run workers`

### Database connection issues

1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Run migrations: `npm run prisma:migrate`

### Clerk authentication issues

1. Verify Clerk keys in .env
2. Check middleware configuration
3. Ensure redirect URLs match Clerk dashboard

## Contributing

This is an MVP project. Future contributions welcome after initial launch.

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.
