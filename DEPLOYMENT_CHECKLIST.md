# Vercel Deployment Checklist

Use this checklist when deploying to Vercel to ensure everything is configured correctly.

## Pre-Deployment Checklist

- [ ] Code is pushed to GitHub repository
- [ ] All dependencies are in `package.json`
- [ ] `.env.example` is up to date with all required variables
- [ ] `.gitignore` includes `.env` and `.env.local`
- [ ] Database schema is finalized in `prisma/schema.prisma`

## Database Setup Checklist

- [ ] Production PostgreSQL database created (Neon, Supabase, or Railway)
- [ ] Database connection string obtained
- [ ] Connection string tested locally
- [ ] Connection string includes SSL parameters if required (e.g., `?sslmode=require`)
- [ ] Consider connection pooling for production (PgBouncer or Prisma Data Proxy)

## Redis Setup Checklist

- [ ] Redis instance created (Upstash recommended)
- [ ] Redis connection string obtained
- [ ] Redis instance is in a region close to Vercel deployment region

## Vercel Configuration Checklist

- [ ] Vercel account created
- [ ] Repository imported to Vercel
- [ ] Framework preset set to "Next.js"
- [ ] Build command: `npm run build`
- [ ] Install command: `npm install`
- [ ] Output directory: `.next`

## Environment Variables Checklist

Configure these in Vercel Dashboard > Settings > Environment Variables:

### Required Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `REDIS_URL` - Redis connection string
- [ ] `NEXTAUTH_SECRET` - Generated secret (use `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` - Your app URL (e.g., `https://your-app.vercel.app`)
- [ ] `NEXT_PUBLIC_API_URL` - API base URL (e.g., `https://your-app.vercel.app/api`)
- [ ] `NEXT_PUBLIC_MAX_UPLOAD_SIZE` - Max upload size in bytes (default: `10485760`)

### Optional Variables (if using these features)
- [ ] `STRIPE_SECRET_KEY` - For payment processing
- [ ] `SENDGRID_API_KEY` - For email notifications

## Post-Deployment Checklist

- [ ] First deployment successful
- [ ] Application loads without errors
- [ ] Update `NEXTAUTH_URL` with actual deployment URL
- [ ] Update `NEXT_PUBLIC_API_URL` with actual deployment URL
- [ ] Redeploy after updating URLs
- [ ] Run database migrations: `npx prisma db push`
- [ ] Seed initial data if needed: `npm run db:seed`
- [ ] Test authentication flow (login/logout)
- [ ] Test database connectivity
- [ ] Test Redis connectivity
- [ ] Verify all role-based routes work correctly
- [ ] Test file upload functionality
- [ ] Check for any console errors in browser

## Production Testing Checklist

### Authentication
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Password reset works (if implemented)
- [ ] Role-based redirects work

### Customer Flow
- [ ] QR code scanning works
- [ ] Menu loads correctly
- [ ] Cart functionality works
- [ ] Order placement works
- [ ] 3D/AR models load (if applicable)

### Staff Dashboards
- [ ] Manager dashboard loads
- [ ] Waiter dashboard loads
- [ ] Kitchen dashboard loads
- [ ] Cashier dashboard loads

### Real-time Features
- [ ] Socket.io connections work (or alternative implemented)
- [ ] Order updates appear in real-time
- [ ] Status changes propagate correctly

### Performance
- [ ] Page load times are acceptable (< 3 seconds)
- [ ] Images load properly
- [ ] No console errors or warnings
- [ ] API responses are fast (< 1 second)

## Domain Configuration (Optional)

- [ ] Custom domain purchased
- [ ] Domain added in Vercel dashboard
- [ ] DNS records configured
- [ ] SSL certificate issued (automatic via Vercel)
- [ ] `NEXTAUTH_URL` updated to custom domain
- [ ] `NEXT_PUBLIC_API_URL` updated to custom domain
- [ ] Redeploy after domain configuration

## Monitoring & Maintenance

- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up database backups
- [ ] Document deployment process for team
- [ ] Create rollback plan
- [ ] Set up CI/CD if needed

## Known Limitations to Address

- [ ] Socket.io may need alternative implementation (Pusher, Ably, or polling)
- [ ] File uploads over 4.5 MB need external storage (Vercel Blob, S3, etc.)
- [ ] Serverless function timeout is 10s (Hobby) / 60s (Pro)
- [ ] Consider upgrading Vercel plan if needed

## Troubleshooting Reference

If deployment fails, check:
1. Build logs in Vercel dashboard
2. Function logs for runtime errors
3. Environment variables are set correctly
4. Database is accessible from Vercel
5. Redis is accessible from Vercel
6. All dependencies are installed
7. TypeScript/ESLint errors (if not ignored)

## Support Resources

- Vercel Documentation: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment
- Project README: [README.md](./README.md)
- Deployment Guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Last Updated:** 2026-01-19
