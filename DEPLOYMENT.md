# Deployment Guide

## Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (sign up with GitHub at vercel.com)
- Your Supabase project is set up and running

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit;

# Create main branch
git branch -M main

# Add your GitHub remote (replace with your repo URL)
git remote add origin https://github.com/vinit105/ai_search_tracker.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and log in
2. Click **"New Project"**
3. Click **"Import"** next to your GitHub repository
4. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. **Add Environment Variables** (click "Environment Variables"):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://qsdpsgvzyiszbsdlhmee.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

6. Click **"Deploy"**

### Step 3: Wait for Deployment

Vercel will:
- Install dependencies
- Build your Next.js app
- Deploy to production

Your app will be live at: `https://your-project-name.vercel.app`

### Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Login with demo@example.com / password123
3. View your 5 projects and their dashboards

---

## 🎉 You're Done!

Your AI Search Visibility Tracker is now:
- ✅ Deployed to production
- ✅ Connected to Supabase
- ✅ Fully authenticated
- ✅ Multi-tenant with RLS
- ✅ Showing real-time visibility data

---

## Optional: Custom Domain

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Troubleshooting

**Build fails on Vercel?**
- Check environment variables are set correctly
- Make sure `.env.local` is in `.gitignore` (it should be)
- Check build logs for specific errors

**Can't login after deployment?**
- Add your Vercel domain to Supabase Auth settings
- Go to Supabase → Authentication → URL Configuration
- Add `https://your-project.vercel.app` to Site URL

**Projects not showing?**
- Make sure you ran the seed script locally
- Verify RLS policies are applied in Supabase
- Check browser console for errors
