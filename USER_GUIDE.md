# Badminton Liga Manager - User Guide

## Overview

This web application helps you manage a badminton league with multiple teams, players, matches, and real-time standings.

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start the application (runs both frontend and backend)
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Features

### 1. Teams Management

**Location**: Click "Teams" in the navigation bar

- **Add Team**: Click the "+ Add Team" button
  - Enter team name (e.g., "Thunder Birds")
  - Select the home day when they play at home
  - Click "Create"

- **Edit Team**: Click "Edit" on any team card
  - Modify team name or home day
  - Click "Update"

- **Delete Team**: Click "Delete" on any team card
  - Confirm deletion (this will also delete all associated players and matches)

### 2. Players Management

**Location**: Click "Players" in the navigation bar

- **View Players**: 
  - See all players grouped by team
  - Or filter by specific team using the dropdown

- **Add Player**: Click the "+ Add Player" button
  - Select the team from dropdown
  - Enter player name
  - Click "Create"

- **Edit Player**: Click "Edit" on any player
  - Modify player name
  - Click "Update"

- **Delete Player**: Click "Delete" on any player
  - Confirm deletion

### 3. Match Scheduling

**Location**: Click "Matches" in the navigation bar

- **Schedule Match**: Click the "+ Schedule Match" button
  - Select home team
  - Select away team (can't be the same as home team)
  - Choose match date
  - Enter location (e.g., "Sports Hall A")
  - Click "Schedule"

- **View Match Details**: Click "Details" on any match
  - See match information
  - Enter pair results (see section below)

- **Complete Match**: Click "Complete" to mark a match as finished
  - This updates the standings table

- **Reopen Match**: Click "Reopen" on a completed match to edit results

- **Delete Match**: Click "Delete" to remove a match

### 4. Recording Match Results

**Location**: Click "Details" on any match in the Matches page

Each match consists of 9 pairs playing against each other:

1. Click "Edit" on any pair
2. **Select Players**:
   - Choose 2 players from the home team
   - Choose 2 players from the away team
3. **Enter Results**:
   - Enter games won by home pair (0-3)
   - Enter games won by away pair (0-3)
4. Click "Save"

**Scoring**:
- Each pair plays up to 3 games
- The pair that wins more games (e.g., 2-1) wins the pair match
- The match score automatically updates (e.g., 5-4 means home team won 5 pairs, away team won 4)

### 5. Standings Table

**Location**: Click "Standings" in the navigation bar (default home page)

The standings table shows:
- **Position**: Current ranking
- **Team Name**: Name of the team
- **Played**: Number of matches played (only completed matches)
- **Won**: Number of matches won
- **Lost**: Number of matches lost
- **Games +**: Total pair matches won
- **Games -**: Total pair matches lost
- **Diff**: Difference between games won and lost
- **Points**: Total points (2 points per match win)

**Ranking**:
- Teams are sorted by points (highest first)
- If points are equal, teams are sorted by games won

## Workflow Example

### Season Setup

1. **Add all teams** (10 teams in your case)
   - Go to Teams page
   - Add each team with their home day

2. **Add players to each team** (at least 6 per team)
   - Go to Players page
   - Add at least 6 players per team

### During the Season

3. **Schedule matches**
   - Go to Matches page
   - Schedule home and away matches for each pair of teams

4. **After each match day**
   - Click "Details" on the completed match
   - Enter the 9 pair results
   - Click "Complete" to mark the match as finished

5. **View standings**
   - Go to Standings page
   - See the current league table

## Tips

- **Minimum Players**: Each team should have at least 6 players as specified in your requirements
- **9 Pairs**: Each match consists of 9 pair matches
- **Home/Away**: Each team plays every other team twice (once home, once away)
- **Data Persistence**: All data is automatically saved to `data.json` file
- **Backup**: Regularly backup your `data.json` file to prevent data loss

## Technical Details

### Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: JSON file storage (`data.json`)
- **State Management**: React Query for API calls and caching

### Project Structure
```
hobby_liga/
├── backend/
│   ├── server.ts       # Express API server
│   ├── database.ts     # Database operations
│   └── types.ts        # TypeScript interfaces
├── src/
│   ├── pages/          # React page components
│   ├── App.tsx         # Main app component
│   ├── api.ts          # API client functions
│   └── types.ts        # TypeScript interfaces
├── data.json           # Database file (auto-created)
└── package.json        # Dependencies and scripts
```

### Available Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build production version

## Troubleshooting

**Port already in use**:
- Frontend (3000) or backend (3001) port is occupied
- Stop other processes using these ports

**Data not saving**:
- Check file permissions in the project directory
- Ensure `data.json` file is writable

**Players not showing in match details**:
- Make sure players are added to the correct team
- Refresh the page

## Support

For issues or feature requests, check the project repository or contact the development team.
