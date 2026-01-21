# Vercel Deployment Guide with Postgres

This guide will help you deploy the Badminton Liga application to Vercel's free tier with **Vercel Postgres** for persistent data storage.

## 🎯 Why Vercel Postgres?

- ✅ **Persistent Data**: Data survives deployments
- ✅ **Free Tier**: 256MB storage, 60 hours compute time/month
- ✅ **Auto-configured**: Environment variables set automatically
- ✅ **Fast Setup**: Integrated with Vercel dashboard
- ✅ **No Code Changes**: Application detects Postgres automatically

## 🚀 Quick Deploy Guide

### Step 1: Create Vercel Account

1. Go to https://vercel.com/signup
2. Sign up with GitHub, GitLab, or Bitbucket
3. Verify your email

### Step 2: Push Code to Git (Recommended)

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Push to GitHub/GitLab/Bitbucket
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Option A: Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Import your repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Click **"Deploy"**
5. Wait for initial deployment (data won't persist yet)

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Step 4: Add Vercel Postgres Database

1. Go to your project in Vercel dashboard
2. Click **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Choose **database name** (e.g., `badminton-liga-db`)
6. Select **region** (closest to your users)
7. Click **"Create"**

Vercel will automatically add these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Step 5: Initialize Database Schema

You have two options:

#### Option A: Using Vercel CLI (Recommended)

```bash
# Pull environment variables
vercel env pull .env.local

# Run initialization script
npm run init-db
```

#### Option B: Manual SQL Execution

1. Go to Vercel dashboard → Your Project → Storage → Your Postgres DB
2. Click **"Query"** tab
3. Copy contents from `schema.sql`
4. Paste and execute in the query editor
5. Create admin user manually:
```sql
INSERT INTO users (username, password, role)
VALUES ('admin', '$2a$10$HASH_HERE', 'admin');
```
(You'll need to generate a bcrypt hash for the password)

### Step 6: Set Additional Environment Variables

1. Go to project **Settings** → **Environment Variables**
2. Add:
   - **Name**: `JWT_SECRET`
   - **Value**: Generate a secure random string (use a password generator)
   - **Environments**: Production, Preview, Development
3. Click **"Save"**

### Step 7: Redeploy

```bash
# Redeploy to pick up database and environment variables
vercel --prod
```

Or trigger a redeploy from Vercel dashboard:
- Go to **Deployments**
- Click ⋯ on latest deployment
- Click **"Redeploy"**

### Step 8: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Login with:
   - **Username**: `admin`
   - **Password**: `admin123`
3. **IMPORTANT**: Change admin password immediately!
4. Create teams, players, and start using the app! 🎉

## 🔒 Production Checklist

- [ ] Vercel Postgres database created
- [ ] Database schema initialized
- [ ] JWT_SECRET set to secure random string
- [ ] Admin password changed from default
- [ ] Test all features (teams, players, matches, statistics)
- [ ] Verify data persists after redeployment
- [ ] Set up custom domain (optional)
- [ ] Enable deployment protection (optional, Pro plan)

## 📊 Vercel Postgres Free Tier Limits

- **Storage**: 256MB
- **Compute**: 60 hours/month
- **Connections**: 60
- **Bandwidth**: Included in Vercel limits

For most small leagues (10-20 teams), this is plenty!

## 🔄 Updating Your Deployment

### Automatic Updates (if using Git)

1. Make changes to your code
2. Commit and push to main branch:
```bash
git add .
git commit -m "Your changes"
git push
```
3. Vercel automatically deploys!

### Manual Updates

```bash
vercel --prod
```

## 🗄️ Database Management

### Backup Your Database

```bash
# Using Vercel CLI
vercel env pull .env.local

# Export database (requires postgres client)
pg_dump $POSTGRES_URL > backup.sql
```

### View Data

1. Go to Vercel dashboard → Storage → Your Database
2. Click **"Data"** tab
3. Browse tables and data

### Query Database

1. Go to **"Query"** tab in Vercel dashboard
2. Run SQL queries directly

Example queries:
```sql
-- View all teams
SELECT * FROM teams;

-- View all players
SELECT p.*, t.name as team_name 
FROM players p 
JOIN teams t ON p.team_id = t.id;

-- View match results
SELECT m.*, ht.name as home_team, at.name as away_team
FROM matches m
JOIN teams ht ON m.home_team_id = ht.id
JOIN teams at ON m.away_team_id = at.id
WHERE m.completed = true;
```

## 🐛 Troubleshooting

### "Database connection failed"

- Check that Postgres database is created in Vercel
- Verify environment variables are set
- Redeploy after adding database

### "Admin user doesn't exist"

- Run `npm run init-db` after pulling env variables
- Or manually create admin user in database query tab

### "Data still disappearing"

- Confirm `POSTGRES_URL` environment variable is set
- Check Vercel function logs for database errors
- Verify database schema is initialized

### "Can't connect to database locally"

For local development:
```bash
# Either use JSON storage (default)
npm run dev

# Or set up local Postgres
# 1. Install PostgreSQL
# 2. Create database: badminton_liga
# 3. Set POSTGRES_URL in .env.local
# 4. Run: npm run init-db
# 5. Set USE_POSTGRES=true in .env.local
# 6. Run: npm run dev
```

## 🔐 Security Best Practices

1. **Change Default Password**: Change admin password immediately
2. **Secure JWT_SECRET**: Use a long random string (32+ characters)
3. **Environment Variables**: Never commit .env files
4. **Database Access**: Don't share database credentials
5. **Regular Backups**: Export database regularly

## 📈 Monitoring Usage

Monitor your usage in Vercel dashboard:
1. Go to project → **Settings** → **Usage**
2. Check:
   - Function executions
   - Bandwidth
   - Database compute hours
3. Get alerts when approaching limits

## 🚀 Performance Tips

- **Indexes**: Already included in schema for optimal performance
- **Caching**: Browser caches API responses automatically
- **Images**: Optimize team logos and player photos
- **Queries**: Database queries are optimized with JOINs

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Postgres Docs**: https://vercel.com/docs/storage/vercel-postgres
- **Support**: https://vercel.com/support

## 🎊 You're All Set!

Your Badminton Liga app is now running on Vercel with:
- ✅ Persistent Postgres database
- ✅ Automatic deployments
- ✅ HTTPS by default
- ✅ Global CDN
- ✅ Auto-scaling

Enjoy managing your badminton league! 🏸🎉
