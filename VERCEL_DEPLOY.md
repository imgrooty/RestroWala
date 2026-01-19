# Quick Start: Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/imgrooty/GourmetOS)

## One-Click Deploy

Click the "Deploy with Vercel" button above to deploy this application instantly.

## Manual Deployment Steps

### 1. Prerequisites
- [ ] GitHub account with this repository
- [ ] Vercel account (free tier works)
- [ ] PostgreSQL database (get free at [Neon](https://neon.tech) or [Supabase](https://supabase.com))
- [ ] Redis instance (get free at [Upstash](https://upstash.com))

### 2. Quick Deploy (5 minutes)

1. **Go to Vercel**: https://vercel.com/new
2. **Import Repository**: Select this repository
3. **Configure Environment Variables**:
   ```
   DATABASE_URL=postgresql://user:pass@host/db
   REDIS_URL=redis://default:pass@host:port
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
   NEXT_PUBLIC_MAX_UPLOAD_SIZE=10485760
   ```
4. **Click Deploy**
5. **Wait 2-3 minutes** for build to complete
6. **Update URLs**: After first deploy, update `NEXTAUTH_URL` and `NEXT_PUBLIC_API_URL` with your actual Vercel URL
7. **Initialize Database**: Run `npx prisma db push` with your DATABASE_URL
8. **Done!** 🎉

### 3. Need More Details?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Detailed step-by-step instructions
- Database provider comparisons
- Environment variables reference
- Troubleshooting guide
- Production best practices

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for:
- Pre-deployment checklist
- Post-deployment verification steps
- Production testing checklist

## Environment Variables Quick Reference

| Variable | Required | Example | Where to Get |
|----------|----------|---------|--------------|
| `DATABASE_URL` | ✅ Yes | `postgresql://...` | [Neon](https://neon.tech), [Supabase](https://supabase.com) |
| `REDIS_URL` | ✅ Yes | `redis://...` | [Upstash](https://upstash.com) |
| `NEXTAUTH_SECRET` | ✅ Yes | Generate: `openssl rand -base64 32` | Local command |
| `NEXTAUTH_URL` | ✅ Yes | `https://app.vercel.app` | Your Vercel URL |
| `NEXT_PUBLIC_API_URL` | ✅ Yes | `https://app.vercel.app/api` | Your Vercel URL + /api |
| `STRIPE_SECRET_KEY` | ⚠️ Optional | `sk_...` | [Stripe Dashboard](https://stripe.com) |
| `SENDGRID_API_KEY` | ⚠️ Optional | `SG...` | [SendGrid](https://sendgrid.com) |

## Common Issues & Quick Fixes

### Build Fails
- ✅ Check all environment variables are set
- ✅ Ensure `DATABASE_URL` is accessible from Vercel
- ✅ Verify Prisma schema is valid

### App Crashes on Start
- ✅ Update `NEXTAUTH_URL` with actual deployment URL
- ✅ Run database migrations: `npx prisma db push`
- ✅ Check Redis is accessible from Vercel

### Authentication Not Working
- ✅ Verify `NEXTAUTH_SECRET` is set
- ✅ Ensure `NEXTAUTH_URL` matches your domain exactly
- ✅ Clear cookies and try again

## Support & Documentation

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- ✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- 📝 [Main README](./README.md)
- 🐛 [Report Issues](https://github.com/imgrooty/GourmetOS/issues)

---

**Deployment Time:** ~5 minutes  
**Build Time:** ~2-3 minutes  
**First-Time Setup:** ~10 minutes total

Made with ❤️ by the Antigravity Team.
