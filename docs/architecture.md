# Architecture Documentation

## System Overview

Campaign Generator is a full-stack web application that extracts brand profiles from websites using AI and generates campaign assets. The system is built with a modern, scalable architecture using Next.js, PostgreSQL, Redis, and background workers.

## High-Level Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         Next.js Application             │
│  ┌──────────────┐   ┌────────────────┐ │
│  │  App Router  │   │   API Routes   │ │
│  │   (Pages)    │   │                │ │
│  └──────────────┘   └────────┬───────┘ │
└────────────────────────────┬─┴─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │PostgreSQL│   │  Redis   │   │   S3     │
       │          │   │ (BullMQ) │   │ Storage  │
       └──────────┘   └────┬─────┘   └──────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Workers    │
                    │              │
                    │ • Preflight  │
                    │ • Browser    │
                    │ • Extraction │
                    └──────────────┘
```

## Core Components

### 1. Next.js Application (Web Service)

**Purpose**: Serves the user interface and API endpoints

**Key Features**:
- Server-side rendering with React 19
- App Router for file-based routing
- API routes for backend logic
- Clerk integration for authentication
- TanStack Query for data fetching

**Route Groups**:
- `(marketing)`: Public landing pages
- `(auth)`: Authentication pages
- `(app)`: Authenticated application pages

### 2. PostgreSQL Database

**Purpose**: Persistent data storage

**Key Tables**:
- `User`: User accounts linked to Clerk
- `Workspace`: User workspaces
- `Brand`: Brand records
- `BrandProfile`: Extracted brand profiles
- `BrandAsset`: Screenshots and logos
- `GenerationJob`: Async job tracking

**Relationships**:
```
User ──1:1──> Workspace
Workspace ──1:N──> Brand
Brand ──1:1──> BrandProfile
Brand ──1:N──> BrandAsset
Brand ──1:N──> GenerationJob
```

### 3. Redis + BullMQ

**Purpose**: Job queue and caching

**Queues**:
- `preflight`: URL validation
- `browser-render`: Screenshot capture
- `extraction`: AI analysis

**Features**:
- Job retry logic
- Progress tracking
- Dead letter queue for failures
- Job prioritization

### 4. Background Workers

**Purpose**: Process async jobs

#### Preflight Worker
- Validates URL accessibility
- Checks robots.txt
- Estimates extraction feasibility
- Enqueues browser render job

#### Browser Render Worker
- Launches Puppeteer browser
- Captures desktop (1920x1080) screenshot
- Captures mobile (390x844) screenshot
- Extracts DOM structure
- Uploads screenshots to S3
- Enqueues extraction job

#### Extraction Worker
- Fetches screenshots from S3
- Calls OpenAI GPT-4 Vision API
- Parses structured brand data
- Creates BrandProfile record
- Marks job as completed

### 5. AWS S3 Storage

**Purpose**: Store screenshots and assets

**Structure**:
```
brand-assets/
├── brands/
│   └── {brandId}/
│       └── screenshots/
│           ├── desktop-{timestamp}.png
│           └── mobile-{timestamp}.png
```

## Data Flow

### Brand Extraction Flow

```
1. User submits URL
   ↓
2. API creates Brand + GenerationJob
   ↓
3. Enqueue preflight job
   ↓
4. Preflight validates URL
   ↓
5. Enqueue browser-render job
   ↓
6. Browser captures screenshots
   ↓
7. Upload screenshots to S3
   ↓
8. Enqueue extraction job
   ↓
9. AI analyzes screenshots
   ↓
10. Create BrandProfile
   ↓
11. Mark job completed
   ↓
12. User reviews profile
```

### Real-Time Updates

```
Frontend                    Backend
   │                           │
   ├──── Poll /api/jobs ──────>│
   │                           │
   │<──── Job status ──────────┤
   │                           │
   │     (every 2 seconds)     │
   │                           │
   └──── Redirect when done ───>
```

## Authentication Flow

```
User                    Clerk                   App
 │                       │                      │
 ├─── Sign in ─────────>│                      │
 │                       │                      │
 │<──── JWT token ───────┤                      │
 │                       │                      │
 ├─── Request with token ─────────────────────>│
 │                       │                      │
 │                       │<─── Verify token ────┤
 │                       │                      │
 │                       ├─── Valid ───────────>│
 │                       │                      │
 │<──── Protected resource ─────────────────────┤
```

## API Architecture

### RESTful API Design

**Brands**:
- `POST /api/brands` - Create brand
- `GET /api/brands` - List brands
- `GET /api/brands/[brandId]` - Get brand
- `PATCH /api/brands/[brandId]` - Update brand
- `DELETE /api/brands/[brandId]` - Delete brand

**Brand Profiles**:
- `GET /api/brands/[brandId]/profile` - Get profile
- `PATCH /api/brands/[brandId]/profile` - Update profile
- `POST /api/brands/[brandId]/profile/confirm` - Confirm profile

**Jobs**:
- `GET /api/brands/[brandId]/job` - Get job status

### Error Handling

```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation error", details: error.errors },
      { status: 400 }
    )
  }
  
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  )
}
```

## Security Architecture

### Authentication
- Clerk handles all authentication
- JWT tokens for API requests
- Middleware protects routes
- Session management by Clerk

### Authorization
- User ownership checked in API routes
- Workspace-based access control
- Brand access limited to workspace members

### Data Protection
- Environment variables for secrets
- HTTPS enforced in production
- SQL injection prevention (Prisma)
- XSS protection (React)
- CORS configuration

## Performance Optimizations

### Frontend
- Server components by default
- Client components only when needed
- Image optimization with Next.js Image
- Code splitting by route
- TanStack Query for caching

### Backend
- Database connection pooling (Prisma)
- Redis caching for job status
- Async job processing
- Browser worker pooling
- S3 for static assets

### Database
- Indexes on foreign keys
- Indexes on frequently queried fields
- Efficient query patterns
- Connection pooling

## Scalability Considerations

### Horizontal Scaling

**Web Service**:
- Stateless design
- Can run multiple instances
- Load balancer distributes traffic

**Workers**:
- Independent worker processes
- Can scale workers separately
- Each worker type can scale independently

### Vertical Scaling

**Database**:
- Increase instance size as needed
- Read replicas for read-heavy workloads

**Redis**:
- Increase memory as queue grows
- Redis Cluster for high availability

### Bottlenecks and Solutions

**Browser Rendering**:
- Bottleneck: Puppeteer is resource-intensive
- Solution: Limit concurrency, use worker pools

**AI Extraction**:
- Bottleneck: OpenAI API rate limits
- Solution: Queue management, retry logic

**Storage**:
- Bottleneck: S3 upload speed
- Solution: Parallel uploads, CDN for delivery

## Monitoring and Observability

### Metrics to Track

**Application**:
- Request latency
- Error rates
- Active users
- API endpoint usage

**Workers**:
- Job processing time
- Job success/failure rates
- Queue depth
- Worker health

**Database**:
- Query performance
- Connection pool usage
- Slow queries
- Database size

**Infrastructure**:
- CPU usage
- Memory usage
- Network I/O
- Disk usage

### Logging Strategy

**Structured Logging**:
```typescript
console.log({
  level: 'info',
  message: 'Job completed',
  jobId: job.id,
  brandId: brand.id,
  duration: elapsed,
})
```

**Log Levels**:
- `error`: Errors requiring attention
- `warn`: Warnings and degraded states
- `info`: Important events
- `debug`: Detailed debugging info

## Disaster Recovery

### Backup Strategy

**Database**:
- Daily automated backups
- Point-in-time recovery
- Backup retention: 7 days

**S3**:
- Versioning enabled
- Lifecycle policies
- Cross-region replication (optional)

### Recovery Procedures

**Database Failure**:
1. Restore from latest backup
2. Replay transaction log if available
3. Verify data integrity

**Worker Failure**:
1. Jobs automatically retry
2. Failed jobs move to dead letter queue
3. Manual intervention for persistent failures

**S3 Failure**:
1. Use versioning to recover deleted files
2. Restore from backup if needed

## Future Architecture Improvements

### Phase 2 Enhancements

- Campaign generation workers
- Asset editing pipeline
- Export service

### Phase 3 Enhancements

- Shopify integration service
- Analytics service
- Multi-brand support

### Long-term Considerations

- Microservices architecture
- Event-driven architecture
- GraphQL API
- Real-time updates with WebSockets
- CDN for asset delivery
- Multi-region deployment
