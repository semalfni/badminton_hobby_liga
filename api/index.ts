import express from 'express';
import cors from 'cors';
import { authenticateToken, requireRole, requireCanEdit, requireCanDelete } from '../backend/auth.js';
import type { AuthRequest } from '../backend/auth.js';
import database from '../backend/database-postgres.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'postgres' });
});

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const { user, token } = await database.login(username, password);
    res.json({ user, token });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Invalid credentials' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Teams
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await database.getTeams();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.post('/api/teams', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, home_day, home_time, address } = req.body;
    const team = await database.createTeam(name, home_day, home_time, address);
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

app.put('/api/teams/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const teamId = Number(req.params.id);
    
    if (req.user?.role === 'team_manager' && req.user.team_id !== teamId) {
      return res.status(403).json({ error: 'Access denied to this team' });
    }
    
    const { name, home_day, home_time, address } = req.body;
    const team = await database.updateTeam(teamId, { name, home_day, home_time, address });
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team' });
  }
});

app.delete('/api/teams/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await database.deleteTeam(Number(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Players
app.get('/api/players', async (req, res) => {
  try {
    const teamId = req.query.team_id ? Number(req.query.team_id) : undefined;
    const players = await database.getPlayers(teamId);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

app.post('/api/players', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { team_id, name } = req.body;
    
    if (req.user?.role === 'team_manager' && req.user.team_id !== team_id) {
      return res.status(403).json({ error: 'Access denied to this team' });
    }
    
    const player = await database.createPlayer(team_id, name);
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create player' });
  }
});

app.put('/api/players/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const playerId = Number(req.params.id);
    const player = await database.getPlayerById(playerId);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    if (req.user?.role === 'team_manager' && req.user.team_id !== player.team_id) {
      return res.status(403).json({ error: 'Access denied to this player' });
    }
    
    const { name } = req.body;
    const updatedPlayer = await database.updatePlayer(playerId, name);
    res.json(updatedPlayer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player' });
  }
});

app.delete('/api/players/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const playerId = Number(req.params.id);
    const player = await database.getPlayerById(playerId);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    if (req.user?.role === 'team_manager' && req.user.team_id !== player.team_id) {
      return res.status(403).json({ error: 'Access denied to this player' });
    }
    
    await database.deletePlayer(playerId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

// Matches
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await database.getMatches();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

app.get('/api/matches/:id', async (req, res) => {
  try {
    const match = await database.getMatchById(Number(req.params.id));
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

app.post('/api/matches', authenticateToken, requireCanEdit, async (req, res) => {
  try {
    const { home_team_id, away_team_id, match_date, location } = req.body;
    const match = await database.createMatch(home_team_id, away_team_id, match_date, location);
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create match' });
  }
});

app.put('/api/matches/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const matchId = Number(req.params.id);
    const match = await database.getMatchById(matchId);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    if (req.user?.role === 'team_manager') {
      if (req.user.team_id !== match.home_team_id && req.user.team_id !== match.away_team_id) {
        return res.status(403).json({ error: 'Access denied to this match' });
      }
    }
    
    const updatedMatch = await database.updateMatch(matchId, req.body);
    res.json(updatedMatch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update match' });
  }
});

app.delete('/api/matches/:id', authenticateToken, requireCanDelete, async (req, res) => {
  try {
    await database.deleteMatch(Number(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete match' });
  }
});

// Match Pairs
app.post('/api/match-pairs', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const pair = await database.createMatchPair(req.body);
    res.json(pair);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create match pair' });
  }
});

app.put('/api/match-pairs/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const pair = await database.updateMatchPair(Number(req.params.id), req.body);
    
    const matchId = pair.match_id;
    const match = await database.getMatchById(matchId);
    
    if (req.user?.role === 'team_manager') {
      if (req.user.team_id !== match?.home_team_id && req.user.team_id !== match?.away_team_id) {
        return res.status(403).json({ error: 'Access denied to this match' });
      }
    }
    
    res.json(pair);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update match pair' });
  }
});

// Standings
app.get('/api/standings', async (req, res) => {
  try {
    const standings = await database.getStandings();
    res.json(standings);
  } catch (error: any) {
    console.error('Error fetching standings:', error);
    res.status(500).json({ error: 'Failed to fetch standings', details: error.message });
  }
});

app.get('/api/standings/history', async (req, res) => {
  try {
    const history = await database.getStandingsHistory();
    res.json(history);
  } catch (error: any) {
    console.error('Error fetching standings history:', error);
    res.status(500).json({ error: 'Failed to fetch standings history', details: error.message });
  }
});

// Player Statistics
app.get('/api/player-statistics', async (req, res) => {
  try {
    const statistics = await database.getPlayerStatistics();
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player statistics' });
  }
});

// User Management
app.get('/api/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await database.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { username, password, role, team_id } = req.body;
    const user = await database.createUser(username, password, role, team_id);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create user' });
  }
});

app.put('/api/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { username, password, role, team_id } = req.body;
    const user = await database.updateUser(Number(req.params.id), { username, password, role, team_id });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await database.deleteUser(Number(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Match Nominations
app.get('/api/matches/:matchId/nominations', async (req, res) => {
  try {
    const nominations = await database.getNominationsForMatch(Number(req.params.matchId));
    res.json(nominations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nominations' });
  }
});

app.get('/api/matches/:matchId/nominated-players/:teamId', async (req, res) => {
  try {
    const players = await database.getNominatedPlayers(Number(req.params.matchId), Number(req.params.teamId));
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nominated players' });
  }
});

app.post('/api/matches/:matchId/nominate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const matchId = Number(req.params.matchId);
    const { player_id } = req.body;
    
    const match = await database.getMatchSimple(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    const player = await database.getPlayerById(player_id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    if (req.user?.role === 'team_manager') {
      if (req.user.team_id !== player.team_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (req.user.team_id !== match.home_team_id && req.user.team_id !== match.away_team_id) {
        return res.status(403).json({ error: 'Access denied to this match' });
      }
    }
    
    await database.nominatePlayer(matchId, player_id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to nominate player' });
  }
});

app.delete('/api/matches/:matchId/nominate/:playerId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const matchId = Number(req.params.matchId);
    const playerId = Number(req.params.playerId);
    
    const match = await database.getMatchSimple(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    const player = await database.getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    if (req.user?.role === 'team_manager') {
      if (req.user.team_id !== player.team_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (req.user.team_id !== match.home_team_id && req.user.team_id !== match.away_team_id) {
        return res.status(403).json({ error: 'Access denied to this match' });
      }
    }
    
    await database.unnominatePlayer(matchId, playerId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unnominate player' });
  }
});

export default app;
