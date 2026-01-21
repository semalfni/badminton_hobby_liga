# Badminton Liga Manager

A web application for managing badminton league teams, players, matches, and standings with user authentication and role-based access control.

## Features

- **User Authentication**: Login system with JWT tokens
- **Role-Based Access Control**:
  - **Admin**: Full access to create teams, schedule matches, manage users
  - **Team Manager**: Manage their own team, add players, record match results
- **Team Management**: Add teams with home day, time, and address
- **Player Management**: Add players to teams
- **Match Scheduling**: Schedule matches (home and away games)
- **Player Nomination**: Nominate players for specific matches
- **Auto-Generate Pairs**: Automatically create balanced pairs from nominated players
- **Result Recording**: Record detailed pair results with best-of-3 badminton scoring
- **Live Standings Table**: Real-time league standings
- **Player Statistics**: Track individual player performance, points, win rates
- **Internationalization**: English and German language support

## 🚀 Deployment

**Recommended**: Deploy with Vercel Postgres for persistent data storage.

See [DEPLOYMENT_POSTGRES.md](./DEPLOYMENT_POSTGRES.md) for step-by-step instructions with database setup.

Quick deploy with database:
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Add Vercel Postgres in dashboard (Storage tab)
# 4. Initialize database: npm run init-db
# 5. Redeploy: vercel --prod
```

For deployment without database (data resets), see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Setup

```bash
# Install dependencies
npm install

# Run development server (both frontend and backend)
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Default Login

On first run, a default admin account is created:

- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Important**: Change this password immediately after first login!

## User Roles

### Admin
- Create and delete teams
- Create and manage users
- Schedule and delete matches
- Mark matches as complete/reopen
- Full access to all teams and players

### Team Manager
- View all teams and standings
- Edit their assigned team details (name, home day, time, address)
- Add/edit/delete players on their team
- View all matches
- Edit match results for matches involving their team

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Database**: 
  - Vercel Postgres (production/Vercel deployment)
  - JSON file storage (local development)
- **State Management**: React Query
- **Routing**: React Router v6

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 7 days
- API endpoints are protected with authentication middleware
- Role-based authorization for sensitive operations
- Team managers can only access their own team's data

## Development

```bash
# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build for production
npm run build
```

## Data Storage

### Local Development
All data is stored in `data.json` file in the project root. This includes:
- Users (with hashed passwords)
- Teams
- Players
- Matches
- Match pairs

**Backup**: Regularly backup your `data.json` file to prevent data loss.

### Production (Vercel)
When deployed to Vercel with Postgres:
- All data is stored in Vercel Postgres database
- Data persists across deployments
- Automatic backups available through Vercel dashboard
- See [DEPLOYMENT_POSTGRES.md](./DEPLOYMENT_POSTGRES.md) for setup

## Database Management

### Initialize Postgres Database
```bash
# After setting up Vercel Postgres
npm run init-db
```

### Switch Between JSON and Postgres
The application automatically detects the database type:
- **Postgres**: Used when `POSTGRES_URL` environment variable is set
- **JSON**: Used for local development (default)

No code changes needed!
