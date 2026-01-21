import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db from './database.js';
import { authenticateToken, requireRole, requireTeamAccess, generateToken, AuthRequest } from './auth.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize default admin user if no users exist
if (db.getAllUsers().length === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.createUser('admin', hashedPassword, 'admin', null);
  console.log('Default admin user created (username: admin, password: admin123)');
}

// ===== AUTH ENDPOINTS =====
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = db.getUserByUsername(username);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
      team_id: user.team_id,
    });
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        team_id: user.team_id,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// ===== USER MANAGEMENT (Admin only) =====
app.get('/api/users', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const users = db.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { username, password, role, team_id } = req.body;
    
    if (db.getUserByUsername(username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = db.createUser(username, hashedPassword, role, team_id || null);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { username, password, role, team_id } = req.body;
    const updateData: any = { username, role, team_id: team_id || null };
    
    if (password) {
      updateData.password = bcrypt.hashSync(password, 10);
    }
    
    const user = db.updateUser(Number(req.params.id), updateData);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    db.deleteUser(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ===== TEAMS (Protected) =====
app.get('/api/teams', (req, res) => {
  try {
    const teams = db.getAllTeams();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.get('/api/teams/:id', (req, res) => {
  try {
    const team = db.getTeamById(Number(req.params.id));
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

app.post('/api/teams', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { name, home_day, home_time, address } = req.body;
    const team = db.createTeam(name, home_day, home_time, address);
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

app.put('/api/teams/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const teamId = Number(req.params.id);
    
    // Check access: admin can edit any team, team_manager can only edit their team
    if (req.user?.role === 'team_manager' && req.user.team_id !== teamId) {
      return res.status(403).json({ error: 'Access denied to this team' });
    }
    
    const { name, home_day, home_time, address } = req.body;
    const team = db.updateTeam(teamId, name, home_day, home_time, address);
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team' });
  }
});

app.delete('/api/teams/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    db.deleteTeam(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// ===== PLAYERS (Protected) =====
app.get('/api/players', (req, res) => {
  try {
    const { team_id } = req.query;
    const players = db.getAllPlayers(team_id ? Number(team_id) : undefined);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

app.post('/api/players', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { team_id, name } = req.body;
    
    // Check access: admin can add to any team, team_manager can only add to their team
    if (req.user?.role === 'team_manager' && req.user.team_id !== team_id) {
      return res.status(403).json({ error: 'Access denied to this team' });
    }
    
    const player = db.createPlayer(team_id, name);
    res.status(201).json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create player' });
  }
});

app.put('/api/players/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const player = db.getPlayerById(Number(req.params.id));
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Check access: admin can edit any player, team_manager can only edit their team's players
    if (req.user?.role === 'team_manager' && req.user.team_id !== player.team_id) {
      return res.status(403).json({ error: 'Access denied to this player' });
    }
    
    const { name } = req.body;
    const updatedPlayer = db.updatePlayer(Number(req.params.id), name);
    res.json(updatedPlayer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player' });
  }
});

app.delete('/api/players/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const player = db.getPlayerById(Number(req.params.id));
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Check access: admin can delete any player, team_manager can only delete their team's players
    if (req.user?.role === 'team_manager' && req.user.team_id !== player.team_id) {
      return res.status(403).json({ error: 'Access denied to this player' });
    }
    
    db.deletePlayer(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

// ===== MATCHES (Protected) =====
app.get('/api/matches', (req, res) => {
  try {
    const matches = db.getAllMatches();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

app.get('/api/matches/:id', (req, res) => {
  try {
    const match = db.getMatchById(Number(req.params.id));
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

app.post('/api/matches', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { home_team_id, away_team_id, match_date, location } = req.body;
    const match = db.createMatch(home_team_id, away_team_id, match_date, location);
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create match' });
  }
});

app.put('/api/matches/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const match = db.updateMatch(Number(req.params.id), req.body);
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update match' });
  }
});

app.delete('/api/matches/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    db.deleteMatch(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete match' });
  }
});

// ===== MATCH PAIRS (Protected - Team managers can update their team's matches) =====
app.put('/api/match-pairs/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const pair = db.updateMatchPair(Number(req.params.id), req.body);
    
    // Get the match to check team access
    const matchId = pair.match_id;
    const match = db.getMatchById(matchId);
    
    // Check access: admin can update any, team_manager can only update matches involving their team
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

// ===== STANDINGS (Public) =====
app.get('/api/standings', (req, res) => {
  try {
    const standings = db.getStandings();
    res.json(standings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
});

// Player Statistics
app.get('/api/player-statistics', (req, res) => {
  try {
    const statistics = db.getPlayerStatistics();
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player statistics' });
  }
});

// ===== MATCH NOMINATIONS =====
app.get('/api/matches/:matchId/nominations', (req, res) => {
  try {
    const nominations = db.getNominationsForMatch(Number(req.params.matchId));
    res.json(nominations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nominations' });
  }
});

app.get('/api/matches/:matchId/nominated-players/:teamId', (req, res) => {
  try {
    const players = db.getNominatedPlayers(
      Number(req.params.matchId),
      Number(req.params.teamId)
    );
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nominated players' });
  }
});

app.post('/api/matches/:matchId/nominate', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { player_id } = req.body;
    const matchId = Number(req.params.matchId);
    
    // Check access
    const match = db.getMatchSimple(matchId);
    const player = db.getPlayerById(player_id);
    
    if (!match || !player) {
      return res.status(404).json({ error: 'Match or player not found' });
    }
    
    // Verify player belongs to one of the teams in the match
    if (player.team_id !== match.home_team_id && player.team_id !== match.away_team_id) {
      return res.status(400).json({ error: 'Player does not belong to either team' });
    }
    
    // Check authorization
    if (req.user?.role === 'team_manager' && req.user.team_id !== player.team_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    db.nominatePlayer(matchId, player_id);
    res.json({ success: true });
  } catch (error) {
    console.error('Nomination error:', error);
    res.status(500).json({ error: 'Failed to nominate player' });
  }
});

app.delete('/api/matches/:matchId/nominate/:playerId', authenticateToken, (req: AuthRequest, res) => {
  try {
    const matchId = Number(req.params.matchId);
    const playerId = Number(req.params.playerId);
    
    // Check access
    const match = db.getMatchSimple(matchId);
    const player = db.getPlayerById(playerId);
    
    if (!match || !player) {
      return res.status(404).json({ error: 'Match or player not found' });
    }
    
    // Check authorization
    if (req.user?.role === 'team_manager' && req.user.team_id !== player.team_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    db.unnominatePlayer(matchId, playerId);
    res.status(204).send();
  } catch (error) {
    console.error('Unnomination error:', error);
    res.status(500).json({ error: 'Failed to unnominate player' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
