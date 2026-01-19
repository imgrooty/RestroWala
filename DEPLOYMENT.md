# Vercel Deployment Guide

This guide will help you deploy the GourmetOS Restaurant Management System to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Production Database**: PostgreSQL database (Recommended: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
4. **Redis Instance**: Redis for caching and real-time features (Recommended: [Upstash Redis](https://upstash.com))

## Step 1: Prepare Your Database

### Option A: Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and create a new project
2. Create a new database
3. Copy the connection string (it should look like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)
4. Save this for the environment variables setup

### Option B: Using Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Database Settings
3. Copy the connection string from the "Connection string" section
4. Make sure to select "Transaction" pooling mode for Prisma
5. Save this for the environment variables setup

### Option C: Using Railway

1. Go to [railway.app](https://railway.app) and create a new project
2. Add a PostgreSQL database
3. Copy the connection string from the database variables
4. Save this for the environment variables setup

## Step 2: Set Up Redis

### Using Upstash (Recommended for Vercel)

1. Go to [upstash.com](https://upstash.com) and create an account
2. Create a new Redis database
3. Select a region close to your Vercel deployment region (e.g., `us-east-1`)
4. Copy the Redis connection URL
5. Save this for the environment variables setup

## Step 3: Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Your Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

2. **Configure Your Project**
   - Framework Preset: Next.js (should be auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Set Environment Variables**
   
   Click on "Environment Variables" and add the following:

   | Variable Name | Value | Description |
   |---------------|-------|-------------|
   | `DATABASE_URL` | `postgresql://user:pass@host/db` | Your PostgreSQL connection string |
   | `REDIS_URL` | `redis://default:pass@host:port` | Your Redis connection string |
   | `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Secret for NextAuth.js token encryption |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your production URL (update after first deploy) |
   | `NEXT_PUBLIC_API_URL` | `https://your-app.vercel.app/api` | Your API base URL |
   | `NEXT_PUBLIC_MAX_UPLOAD_SIZE` | `10485760` | Max upload size (10MB in bytes) |

   **Optional Variables** (if you use these features):
   - `STRIPE_SECRET_KEY`: For payment processing
   - `SENDGRID_API_KEY`: For transactional emails

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-5 minutes)

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add REDIS_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   vercel env add NEXT_PUBLIC_API_URL
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 4: Initialize Your Database

After your first successful deployment:

1. **Run Prisma Migrations**
   
   You have two options:

   **Option A: Using Vercel CLI**
   ```bash
   # Set DATABASE_URL locally for the migration
   export DATABASE_URL="your-production-database-url"
   
   # Run the migration
   npx prisma db push
   ```

   **Option B: Using Prisma Studio**
   - Install Prisma CLI locally: `npm install -D prisma`
   - Run: `npx prisma studio`
   - This opens a GUI to manage your database

2. **Seed Initial Data (Optional)**
   
   If you want to populate your database with sample data:
   ```bash
   export DATABASE_URL="your-production-database-url"
   npm run db:seed
   ```

## Step 5: Update NEXTAUTH_URL

After your first deployment:

1. Copy your production URL (e.g., `https://your-app-name.vercel.app`)
2. Go to your Vercel project settings
3. Navigate to "Environment Variables"
4. Update `NEXTAUTH_URL` to your production URL
5. Update `NEXT_PUBLIC_API_URL` to `https://your-app-name.vercel.app/api`
6. Redeploy your application for the changes to take effect

## Step 6: Set Up Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_API_URL` to use your custom domain

## Important Notes

### Socket.io Limitations

⚠️ **Important**: Vercel's serverless functions have limitations with Socket.io:
- WebSocket connections may not work as expected in serverless environments
- For real-time features to work properly, consider using:
  1. **Vercel KV** (Vercel's Redis solution) for pub/sub
  2. **Pusher** or **Ably** for real-time features
  3. **Polling** instead of WebSockets for real-time updates
  4. Deploy Socket.io server separately (e.g., on Railway, Render, or Fly.io)

### File Uploads

- Vercel has a **4.5 MB** request body size limit for serverless functions
- For 3D model uploads, consider using:
  1. **Vercel Blob Storage** (recommended)
  2. **AWS S3** or **Cloudflare R2**
  3. **Uploadcare** or **Cloudinary**

Update your upload configuration accordingly in the environment variables.

### Database Connection Pooling

For PostgreSQL on Vercel, it's highly recommended to use connection pooling:

1. **Using Prisma Data Proxy** (Recommended)
   - Sign up for Prisma Data Platform
   - Enable Data Proxy for your database
   - Use the Data Proxy connection string

2. **Using PgBouncer**
   - Most hosted PostgreSQL providers offer PgBouncer
   - Use the pooling connection string instead of direct connection

### Performance Tips

1. **Enable Edge Caching**: Add proper cache headers to your API routes
2. **Optimize Images**: Use Next.js Image component for automatic optimization
3. **Database Indexes**: Ensure your Prisma schema has proper indexes (already configured)
4. **Redis Caching**: Use Redis for frequently accessed data

## Monitoring and Debugging

### View Logs

1. Go to your Vercel project dashboard
2. Click on "Functions"
3. Select any function to view its logs
4. You can also use `vercel logs` CLI command

### Check Build Logs

1. Go to your Vercel project dashboard
2. Click on "Deployments"
3. Select a deployment to view build logs

### Environment Variables

To check or update environment variables:
```bash
vercel env ls
vercel env pull .env.local
```

## Rollback a Deployment

If something goes wrong:

1. Go to your Vercel project dashboard
2. Click on "Deployments"
3. Find the last working deployment
4. Click the three dots menu
5. Select "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Troubleshooting

### Build Failures

1. **"Module not found" errors**
   - Ensure all dependencies are in `package.json`
   - Run `npm install` locally to verify

2. **"Prisma Client not generated"**
   - The `postinstall` script should handle this
   - Check that `"postinstall": "prisma generate"` is in `package.json`

3. **TypeScript errors**
   - The build is configured to ignore TypeScript errors
   - Fix critical errors before deploying

### Runtime Errors

1. **Database connection issues**
   - Verify `DATABASE_URL` is correctly set
   - Check database server is accessible from Vercel
   - Ensure connection string includes `?sslmode=require` for some providers

2. **Redis connection issues**
   - Verify `REDIS_URL` is correctly set
   - Check Redis instance is accessible from Vercel

3. **Authentication issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Ensure `NEXTAUTH_URL` matches your production URL
   - Check that callback URLs are correctly configured

## Support

For more help:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

Made with ❤️ by the Antigravity Team.
