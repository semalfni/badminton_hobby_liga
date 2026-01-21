# Vercel Deployment Guide

This guide will help you deploy the Badminton Liga application to Vercel's free tier.

## ⚠️ Important: Data Persistence

**Issue**: The current application uses a JSON file (`data.json`) for data storage, which won't persist on Vercel's serverless environment between deployments.

**Solutions** (Choose one):

### Option 1: Vercel Postgres (Recommended - Free Tier Available)
Vercel offers a free Postgres database that integrates seamlessly:
- Free tier: 256MB storage, 60 hours compute time/month
- Persistent data across deployments
- Easy setup through Vercel dashboard

### Option 2: MongoDB Atlas (Free Tier)
- Free tier: 512MB storage
- Requires code modifications to use MongoDB instead of JSON
- Easy to set up

### Option 3: In-Memory Only (For Testing Only)
- Data resets on every deployment
- Only suitable for demo/testing purposes
- No additional setup required

## 🚀 Quick Deploy (In-Memory Mode - For Testing)

### Prerequisites
- A Vercel account (free): https://vercel.com/signup
- Vercel CLI installed: `npm i -g vercel`
- Git repository (optional but recommended)

### Step 1: Prepare Your Project

1. Ensure all files are in your project directory
2. The following files have been created for you:
   - `vercel.json` - Vercel configuration
   - `api/index.ts` - Serverless API handler
   - `.vercelignore` - Files to exclude
   - `.env.example` - Environment variables template

### Step 2: Set Environment Variables

Create a `.env` file (or set in Vercel dashboard):

```bash
# Generate a secure random string for production
JWT_SECRET=your-super-secret-jwt-key-change-this

# Initial admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Step 3: Deploy to Vercel

#### Method A: Using Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: badminton-hobby-liga (or your choice)
# - In which directory is your code located: ./
# - Override settings: No

# The app will build and deploy
# You'll receive a URL like: https://badminton-hobby-liga.vercel.app
```

#### Method B: Using Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to https://vercel.com/new
3. Import your repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   - `JWT_SECRET` = (your secret key)
   - `ADMIN_USERNAME` = admin
   - `ADMIN_PASSWORD` = admin123
6. Click "Deploy"

### Step 4: Access Your Application

Once deployed:
1. Visit your Vercel URL
2. Login with:
   - Username: `admin` (or what you set in env)
   - Password: `admin123` (or what you set in env)
3. Start managing your badminton league!

## 🔒 Production Checklist

Before going live with real data:

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Change admin password immediately after first login
- [ ] Set up a proper database (Vercel Postgres or MongoDB Atlas)
- [ ] Enable HTTPS (Vercel provides this automatically)
- [ ] Review and adjust CORS settings if needed

## 🗄️ Setting Up Vercel Postgres (Recommended for Production)

### Step 1: Create Database

1. Go to your project in Vercel dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose a region close to your users
6. Click "Create"

### Step 2: Get Connection String

Vercel will automatically set these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### Step 3: Update Code (Future Enhancement)

You would need to:
1. Install a Postgres client: `npm install @vercel/postgres`
2. Modify `backend/database.ts` to use Postgres instead of JSON
3. Create database schema and tables
4. Update all CRUD operations

*Note: This requires code refactoring which can be done if you want persistent data.*

## 🔄 Updating Your Deployment

### CLI Method
```bash
# Deploy to production
vercel --prod
```

### Dashboard Method
- Push to your main branch (GitHub/GitLab/Bitbucket)
- Vercel auto-deploys on every push

## 📝 Environment Variables in Vercel

To add/update environment variables:

1. Go to your project in Vercel dashboard
2. Click "Settings"
3. Click "Environment Variables"
4. Add your variables:
   - Variable name: `JWT_SECRET`
   - Value: Your secret key
   - Environments: Check all (Production, Preview, Development)
5. Click "Save"
6. Redeploy for changes to take effect

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Try building locally: `npm run build`

### API Routes Not Working
- Check that `api/index.ts` exists
- Verify `vercel.json` configuration
- Check function logs in Vercel dashboard

### Data Not Persisting
- This is expected with JSON file storage
- Set up Vercel Postgres or MongoDB Atlas
- Or accept that data resets between deployments (testing only)

### Authentication Issues
- Verify `JWT_SECRET` is set in environment variables
- Check that admin user exists
- Try resetting environment variables and redeploying

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel function logs
2. Review build logs
3. Verify environment variables
4. Check the [Vercel Community](https://github.com/vercel/vercel/discussions)

## ⚡ Performance Tips

- Vercel's free tier has limits:
  - 100GB bandwidth/month
  - 100 serverless function executions/day
  - 6000 build minutes/month
- Optimize images and assets
- Use caching where appropriate
- Consider upgrading if you exceed limits

## 🎉 You're All Set!

Your Badminton Liga app is now deployed on Vercel. Remember:
- Data is in-memory by default (resets on deploy)
- Set up a database for persistent storage
- Change default admin credentials
- Enjoy managing your badminton league! 🏸
