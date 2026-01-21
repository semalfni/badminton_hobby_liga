# Alternative: Using Neon Postgres with Vercel

Since Vercel Postgres isn't available, you can use Neon - a modern, serverless Postgres provider with a generous free tier.

## Step 1: Create Neon Account

1. Go to https://neon.tech
2. Sign up (free, no credit card required)
3. Click **Create a project**
4. Name it: `badminton-liga`
5. Select your region (choose closest to your users)
6. Click **Create project**

## Step 2: Get Connection String

After creating the project:

1. You'll see a connection string that looks like:
   ```
   postgres://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

2. Copy this connection string

## Step 3: Add to Vercel

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

   | Name | Value |
   |------|-------|
   | `POSTGRES_URL` | Your Neon connection string |
   | `POSTGRES_PRISMA_URL` | Your Neon connection string |
   | `POSTGRES_URL_NON_POOLING` | Your Neon connection string |

4. Click **Save**

## Step 4: Redeploy

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy**
4. Or just push any change to trigger deployment

## Step 5: Initialize Database

After deployment, you need to initialize the database schema.

### Method 1: Using Neon SQL Editor (Easiest)

1. Go to your Neon dashboard
2. Click **SQL Editor** tab
3. Copy the entire contents of your `schema.sql` file
4. Paste into the SQL editor
5. Click **Run**
6. Then run this to create admin user:

```sql
INSERT INTO users (username, password, role)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');
```

(This is the bcrypt hash for 'admin123')

### Method 2: Using Local Script

```bash
# Set environment variable locally (use your Neon connection string)
export POSTGRES_URL="postgres://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Run initialization
npm run init-db
```

## Step 6: Verify

1. Check deployment logs - should show:
   ```
   USE_POSTGRES: true
   POSTGRES_URL exists: true
   ```

2. Try logging in with admin/admin123

## Neon Free Tier Limits

- ✅ 512 MB storage (plenty for this app)
- ✅ 1 project with unlimited databases
- ✅ Always-on compute
- ✅ No credit card required

Perfect for this application!

## Connection String Format

Your Neon connection string should look like:
```
postgres://[user]:[password]@[host]/[database]?sslmode=require
```

Make sure to copy the complete string including the `?sslmode=require` part.
