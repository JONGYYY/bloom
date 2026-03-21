# Deployment Guide

This guide covers deploying the Campaign Generator MVP to Railway.

## Prerequisites

- Railway account
- GitHub repository with the code
- Clerk account configured
- OpenAI API key
- AWS S3 bucket configured

## Railway Setup

### 1. Create a New Project

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 2. Add Required Services

#### PostgreSQL Database

1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway will automatically provision a PostgreSQL database
3. Note the connection string from the "Connect" tab

#### Redis

1. Click "New" → "Database" → "Add Redis"
2. Railway will automatically provision a Redis instance
3. Note the connection string from the "Connect" tab

### 3. Configure Web Service

1. In your project, select the web service (Next.js app)
2. Go to "Settings" → "Environment Variables"
3. Add the following variables:

```env
# Database (from Railway PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (from Railway Redis service)
REDIS_URL=${{Redis.REDIS_URL}}

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app

# OpenAI
OPENAI_API_KEY=sk-...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET_NAME=brand-assets

# App
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
NODE_ENV=production
```

4. Go to "Settings" → "Build Command"
   - Build Command: `npm run build && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`

### 4. Configure Worker Service

1. Click "New" → "Empty Service"
2. Connect it to the same GitHub repository
3. Go to "Settings" → "Environment Variables"
4. Add the same environment variables as the web service
5. Go to "Settings" → "Build & Deploy"
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm run workers`
6. Set "Root Directory" if needed

### 5. Deploy

1. Both services should automatically deploy
2. Monitor the deployment logs for any errors
3. Once deployed, visit your app URL

## Post-Deployment

### 1. Run Database Migrations

If migrations didn't run automatically:

```bash
# Using Railway CLI
railway run npx prisma migrate deploy
```

### 2. Configure Clerk

1. Go to your Clerk dashboard
2. Add your Railway domain to allowed origins
3. Update redirect URLs to match your production domain

### 3. Test the Application

1. Visit your deployed URL
2. Sign up for an account
3. Test brand URL submission
4. Verify workers are processing jobs
5. Check that brand extraction completes

## Monitoring

### Logs

- View logs in Railway dashboard
- Web service logs: Check Next.js server logs
- Worker logs: Check worker process logs
- Database logs: Check PostgreSQL logs

### Health Checks

Monitor these endpoints:
- `/` - Landing page should load
- `/api/health` - Add a health check endpoint (optional)

### Worker Status

Check worker health:
- Verify jobs are being processed in Redis
- Check worker logs for errors
- Monitor job completion times

## Scaling

### Horizontal Scaling

Railway supports horizontal scaling:
1. Go to service settings
2. Adjust "Instances" slider
3. Workers can be scaled independently from web service

### Database Scaling

1. Monitor database performance in Railway dashboard
2. Upgrade plan if needed for more resources

### Redis Scaling

1. Monitor Redis memory usage
2. Upgrade plan if needed for more memory

## Troubleshooting

### Workers Not Processing Jobs

1. Check worker service logs
2. Verify REDIS_URL is correct
3. Ensure worker service is running
4. Check for errors in worker logs

### Database Connection Issues

1. Verify DATABASE_URL is correct
2. Check if migrations ran successfully
3. Ensure PostgreSQL service is running

### Authentication Issues

1. Verify Clerk environment variables
2. Check Clerk dashboard for allowed domains
3. Ensure redirect URLs are correct

### S3 Upload Failures

1. Verify AWS credentials
2. Check S3 bucket permissions
3. Ensure bucket exists and is accessible

## Rollback

If deployment fails:

1. Go to "Deployments" tab
2. Find the last working deployment
3. Click "Redeploy"

## Environment-Specific Configuration

### Staging Environment

Create a separate Railway project for staging:
1. Use separate Clerk application
2. Use separate S3 bucket
3. Use separate database

### Production Environment

- Use production Clerk keys
- Use production S3 bucket
- Enable monitoring and alerts
- Set up backup strategy for database

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] Clerk is configured with correct domains
- [ ] S3 bucket has appropriate permissions
- [ ] Database has strong password
- [ ] Redis is not publicly accessible
- [ ] HTTPS is enabled (Railway does this automatically)
- [ ] Rate limiting is configured (add if needed)

## Backup Strategy

### Database Backups

Railway automatically backs up PostgreSQL:
- Daily backups are retained for 7 days
- Manual backups can be created in dashboard

### S3 Backups

Configure S3 versioning and lifecycle policies:
1. Enable versioning on S3 bucket
2. Set up lifecycle rules for old versions
3. Consider cross-region replication

## Cost Optimization

- Monitor Railway usage dashboard
- Optimize worker concurrency
- Implement job retry limits
- Cache frequently accessed data
- Use appropriate instance sizes

## Support

For deployment issues:
- Check Railway documentation
- Review application logs
- Contact Railway support if needed
