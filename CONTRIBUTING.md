# Contributing Guide

Guidelines for developing and extending the Campaign Generator MVP.

## Development Setup

Follow the [QUICKSTART.md](QUICKSTART.md) guide to get your local environment running.

## Code Style

### TypeScript

- Use TypeScript for all new files
- Enable strict mode
- Avoid `any` types - use proper typing
- Use interfaces for object shapes
- Use type aliases for unions/primitives

### React Components

```tsx
// ✅ Good: Typed props, clear component
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  children: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', onClick, children }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }))} onClick={onClick}>
      {children}
    </button>
  )
}

// ❌ Bad: No types, unclear props
export function Button(props) {
  return <button {...props} />
}
```

### Styling

- Use Tailwind CSS classes
- Use `cn()` utility for conditional classes
- Follow the design system tokens
- No inline styles
- Use glass-panel class for elevated surfaces

```tsx
// ✅ Good
<div className={cn(
  "glass-panel rounded-lg p-6",
  isActive && "border-violet-500"
)}>
  {children}
</div>

// ❌ Bad
<div style={{ background: 'rgba(28, 35, 49, 0.72)' }}>
  {children}
</div>
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `Button.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Pages: `page.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)

### Component Organization

```
components/
├── ui/              # Base components (Button, Input, etc.)
├── app-shell/       # Shell components (Sidebar, Topbar)
├── brand-review/    # Feature-specific components
└── shared/          # Shared across features
```

## Git Workflow

### Branch Naming

- Feature: `feature/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`

Examples:
- `feature/campaign-builder`
- `fix/extraction-timeout`
- `docs/api-documentation`

### Commit Messages

Use conventional commits:

```
type(scope): description

[optional body]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(wizard): add color palette picker
fix(api): handle missing brand profile
docs(readme): update deployment instructions
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes and commit
3. Push to remote
4. Create pull request
5. Request review
6. Address feedback
7. Merge when approved

## Adding New Features

### 1. Plan First

- Review the PRD in the plan file
- Check if it fits the current phase
- Consider impact on existing features
- Document your approach

### 2. Create Components

```tsx
// components/feature/NewComponent.tsx
"use client" // If client-side only

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface NewComponentProps {
  // Define props
}

export function NewComponent({ }: NewComponentProps) {
  // Implementation
  return <div>...</div>
}
```

### 3. Add API Routes

```typescript
// app/api/feature/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Implementation
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

### 4. Add Database Changes

```bash
# Create migration
npx prisma migrate dev --name add_feature

# Generate client
npm run prisma:generate
```

### 5. Add Worker Logic (if needed)

```typescript
// workers/new-worker.ts
import { Worker, Job } from 'bullmq'
import { connection } from './queue'
import { prisma } from '../src/lib/db'

async function processJob(job: Job) {
  // Implementation
}

export const newWorker = new Worker('queue-name', processJob, { connection })
```

## Testing

### Manual Testing Checklist

Before submitting PR:

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading states work
- [ ] Error states work
- [ ] Empty states work
- [ ] Accessibility (keyboard navigation)
- [ ] Dark mode looks good

### Test Different Scenarios

- Happy path (everything works)
- Error path (API fails, network error)
- Edge cases (empty data, very long text)
- Different user roles (if applicable)

## Database Migrations

### Creating Migrations

```bash
# Make changes to schema.prisma
# Then create migration
npx prisma migrate dev --name descriptive_name

# Example
npx prisma migrate dev --name add_campaign_table
```

### Migration Best Practices

- One logical change per migration
- Use descriptive names
- Test migrations locally first
- Never edit existing migrations
- Always generate Prisma client after

## API Design

### RESTful Conventions

- `GET` - Retrieve data
- `POST` - Create new resource
- `PATCH` - Update existing resource
- `DELETE` - Delete resource

### Response Format

```typescript
// Success
return NextResponse.json({
  data: result,
  message: "Optional success message"
})

// Error
return NextResponse.json({
  error: "Error message",
  details: optionalDetails
}, { status: 400 })
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

## Worker Development

### Adding New Worker

1. Create worker file in `workers/`
2. Define job data interface
3. Implement process function
4. Create worker instance
5. Add to `workers/index.ts`

### Worker Best Practices

- Keep jobs idempotent
- Handle errors gracefully
- Update job progress
- Log important events
- Set appropriate concurrency

## Performance Considerations

### Frontend

- Use Server Components by default
- Use Client Components only when needed
- Lazy load heavy components
- Optimize images with Next.js Image
- Use TanStack Query for caching

### Backend

- Index frequently queried fields
- Use connection pooling
- Avoid N+1 queries
- Cache expensive operations
- Use async processing for slow tasks

### Workers

- Limit concurrency for resource-intensive jobs
- Use browser pooling for Puppeteer
- Implement retry logic
- Monitor queue depth

## Security Checklist

- [ ] Authenticate all API routes
- [ ] Validate all user input
- [ ] Use Zod for runtime validation
- [ ] Sanitize data before database
- [ ] Check user permissions
- [ ] Never expose secrets in frontend
- [ ] Use environment variables
- [ ] Validate file uploads (if applicable)

## Debugging Tips

### Frontend Issues

```tsx
// Add console logs
console.log('Component rendered:', { props })

// Use React DevTools
// Check Network tab for API calls
// Check Console for errors
```

### Backend Issues

```typescript
// Add detailed logging
console.log('[API] Request:', { userId, body })
console.log('[API] Result:', result)
console.error('[API] Error:', error)

// Use Prisma Studio to check database
npm run prisma:studio
```

### Worker Issues

```typescript
// Add logging at each stage
console.log('[Worker] Job started:', job.id)
console.log('[Worker] Processing:', data)
console.log('[Worker] Job completed:', job.id)

// Check Redis queue
redis-cli
> LLEN bull:queue-name:wait
```

## Documentation

### Code Comments

```typescript
// ✅ Good: Explain why, not what
// Use exponential backoff to avoid rate limiting
await delay(Math.pow(2, retryCount) * 1000)

// ❌ Bad: Obvious comment
// Increment counter
counter++
```

### Component Documentation

```tsx
/**
 * Button component with multiple variants and sizes.
 * 
 * @example
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 */
export function Button({ variant, size, onClick, children }: ButtonProps) {
  // ...
}
```

## Common Patterns

### Loading States

```tsx
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async () => {
  setIsLoading(true)
  try {
    await api.call()
  } finally {
    setIsLoading(false)
  }
}
```

### Error Handling

```tsx
const [error, setError] = useState<string | null>(null)

try {
  const result = await api.call()
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred')
}
```

### Form Validation

```tsx
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [BullMQ Docs](https://docs.bullmq.io/)

## Questions?

- Review existing code for examples
- Check documentation in `/docs`
- Ask team members for guidance
- Create an issue for discussion

## License

Proprietary - All rights reserved
