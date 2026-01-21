import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_FILE = join(__dirname, '../data.json');

interface Database {
  teams: any[];
  players: any[];
  matches: any[];
  match_pairs: any[];
  users: any[];
  match_nominations: any[];
  nextIds: {
    teams: number;
    players: number;
    matches: number;
    match_pairs: number;
    users: number;
    match_nominations: number;
  };
}

let db: Database = {
  teams: [],
  players: [],
  matches: [],
  match_pairs: [],
  users: [],
  match_nominations: [],
  nextIds: {
    teams: 1,
    players: 1,
    matches: 1,
    match_pairs: 1,
    users: 1,
    match_nominations: 1,
  },
};

function loadDatabase() {
  if (existsSync(DB_FILE)) {
    const data = readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(data);
    
    // Initialize missing fields for backward compatibility
    if (!db.match_nominations) {
      db.match_nominations = [];
    }
    if (!db.nextIds.match_nominations) {
      db.nextIds.match_nominations = 1;
    }
  }
}

function saveDatabase() {
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Initialize database on load
loadDatabase();

export const database = {
  // Helper to get next ID
  getNextId(table: keyof Database['nextIds']): number {
    const id = db.nextIds[table];
    db.nextIds[table]++;
    saveDatabase();
    return id;
  },

  // Teams
  getAllTeams() {
    return db.teams;
  },

  getTeamById(id: number) {
    return db.teams.find(t => t.id === id);
  },

  createTeam(name: string, home_day: string, home_time: string, address: string) {
    const team = {
      id: this.getNextId('teams'),
      name,
      home_day,
      home_time,
      address,
      created_at: new Date().toISOString(),
    };
    db.teams.push(team);
    saveDatabase();
    return team;
  },

  updateTeam(id: number, name: string, home_day: string, home_time: string, address: string) {
    const team = db.teams.find(t => t.id === id);
    if (team) {
      team.name = name;
      team.home_day = home_day;
      team.home_time = home_time;
      team.address = address;
      saveDatabase();
    }
    return team;
  },

  deleteTeam(id: number) {
    db.teams = db.teams.filter(t => t.id !== id);
    db.players = db.players.filter(p => p.team_id !== id);
    db.matches = db.matches.filter(m => m.home_team_id !== id && m.away_team_id !== id);
    saveDatabase();
  },

  // Players
  getAllPlayers(teamId?: number) {
    if (teamId) {
      return db.players.filter(p => p.team_id === teamId);
    }
    return db.players;
  },

  getPlayerById(id: number) {
    return db.players.find(p => p.id === id);
  },

  createPlayer(team_id: number, name: string) {
    const player = {
      id: this.getNextId('players'),
      team_id,
      name,
      created_at: new Date().toISOString(),
    };
    db.players.push(player);
    saveDatabase();
    return player;
  },

  updatePlayer(id: number, name: string) {
    const player = db.players.find(p => p.id === id);
    if (player) {
      player.name = name;
      saveDatabase();
    }
    return player;
  },

  deletePlayer(id: number) {
    db.players = db.players.filter(p => p.id !== id);
    // Clean up match pairs references
    db.match_pairs.forEach(pair => {
      if (pair.home_player1_id === id) pair.home_player1_id = null;
      if (pair.home_player2_id === id) pair.home_player2_id = null;
      if (pair.away_player1_id === id) pair.away_player1_id = null;
      if (pair.away_player2_id === id) pair.away_player2_id = null;
    });
    saveDatabase();
  },

  // Matches
  getAllMatches() {
    return db.matches.map(match => {
      const homeTeam = this.getTeamById(match.home_team_id);
      const awayTeam = this.getTeamById(match.away_team_id);
      return {
        ...match,
        home_team_name: homeTeam?.name,
        away_team_name: awayTeam?.name,
      };
    });
  },

  getMatchSimple(id: number) {
    return db.matches.find(m => m.id === id);
  },

  getMatchById(id: number) {
    const match = db.matches.find(m => m.id === id);
    if (!match) return null;
    
    const homeTeam = this.getTeamById(match.home_team_id);
    const awayTeam = this.getTeamById(match.away_team_id);
    const pairs = db.match_pairs
      .filter(p => p.match_id === id)
      .map(pair => {
        const hp1 = pair.home_player1_id ? this.getPlayerById(pair.home_player1_id) : null;
        const hp2 = pair.home_player2_id ? this.getPlayerById(pair.home_player2_id) : null;
        const ap1 = pair.away_player1_id ? this.getPlayerById(pair.away_player1_id) : null;
        const ap2 = pair.away_player2_id ? this.getPlayerById(pair.away_player2_id) : null;
        
        return {
          ...pair,
          home_player1_name: hp1?.name,
          home_player2_name: hp2?.name,
          away_player1_name: ap1?.name,
          away_player2_name: ap2?.name,
        };
      });
    
    return {
      ...match,
      home_team_name: homeTeam?.name,
      away_team_name: awayTeam?.name,
      pairs,
    };
  },

  createMatch(home_team_id: number, away_team_id: number, match_date: string, location: string) {
    const match = {
      id: this.getNextId('matches'),
      home_team_id,
      away_team_id,
      match_date,
      location,
      home_score: 0,
      away_score: 0,
      completed: false,
      created_at: new Date().toISOString(),
    };
    db.matches.push(match);
    
    // Create 9 empty pairs
    for (let i = 1; i <= 9; i++) {
      db.match_pairs.push({
        id: this.getNextId('match_pairs'),
        match_id: match.id,
        pair_number: i,
        home_player1_id: null,
        home_player2_id: null,
        away_player1_id: null,
        away_player2_id: null,
        home_games: 0,
        away_games: 0,
      });
    }
    
    saveDatabase();
    return match;
  },

  updateMatch(id: number, data: any) {
    const match = db.matches.find(m => m.id === id);
    if (match) {
      Object.assign(match, data);
      saveDatabase();
    }
    return match;
  },

  deleteMatch(id: number) {
    db.matches = db.matches.filter(m => m.id !== id);
    db.match_pairs = db.match_pairs.filter(p => p.match_id !== id);
    saveDatabase();
  },

  // Match Pairs
  updateMatchPair(id: number, data: any) {
    const pair = db.match_pairs.find(p => p.id === id);
    if (pair) {
      Object.assign(pair, data);
      
      // Calculate who won this pair based on games won
      const calculateGamesWon = (g1h: number, g1a: number, g2h: number, g2a: number, g3h: number, g3a: number) => {
        let homeGames = 0;
        let awayGames = 0;
        
        if (g1h > g1a) homeGames++; else if (g1a > g1h) awayGames++;
        if (g2h > g2a) homeGames++; else if (g2a > g2h) awayGames++;
        if (g3h > g3a) homeGames++; else if (g3a > g3h) awayGames++;
        
        return { homeGames, awayGames };
      };
      
      // Update match score
      const matchId = pair.match_id;
      const allPairs = db.match_pairs.filter(p => p.match_id === matchId);
      
      let homeScore = 0;
      let awayScore = 0;
      allPairs.forEach((p: any) => {
        const { homeGames, awayGames } = calculateGamesWon(
          p.game1_home_score || 0, p.game1_away_score || 0,
          p.game2_home_score || 0, p.game2_away_score || 0,
          p.game3_home_score || 0, p.game3_away_score || 0
        );
        if (homeGames > awayGames) homeScore++;
        else if (awayGames > homeGames) awayScore++;
      });
      
      const match = db.matches.find(m => m.id === matchId);
      if (match) {
        match.home_score = homeScore;
        match.away_score = awayScore;
      }
      
      saveDatabase();
      
      // Return pair with player names
      const hp1 = pair.home_player1_id ? this.getPlayerById(pair.home_player1_id) : null;
      const hp2 = pair.home_player2_id ? this.getPlayerById(pair.home_player2_id) : null;
      const ap1 = pair.away_player1_id ? this.getPlayerById(pair.away_player1_id) : null;
      const ap2 = pair.away_player2_id ? this.getPlayerById(pair.away_player2_id) : null;
      
      return {
        ...pair,
        home_player1_name: hp1?.name,
        home_player2_name: hp2?.name,
        away_player1_name: ap1?.name,
        away_player2_name: ap2?.name,
      };
    }
    return pair;
  },

  // Standings
  getStandings() {
    return db.teams.map(team => {
      const homeMatches = db.matches.filter(m => m.home_team_id === team.id && m.completed);
      const awayMatches = db.matches.filter(m => m.away_team_id === team.id && m.completed);
      
      let won = 0;
      let lost = 0;
      let gamesWon = 0;
      let gamesLost = 0;
      
      homeMatches.forEach(match => {
        if (match.home_score > match.away_score) won++;
        else if (match.home_score < match.away_score) lost++;
        gamesWon += match.home_score;
        gamesLost += match.away_score;
      });
      
      awayMatches.forEach(match => {
        if (match.away_score > match.home_score) won++;
        else if (match.away_score < match.home_score) lost++;
        gamesWon += match.away_score;
        gamesLost += match.home_score;
      });
      
      return {
        team_id: team.id,
        team_name: team.name,
        played: homeMatches.length + awayMatches.length,
        won,
        lost,
        games_won: gamesWon,
        games_lost: gamesLost,
        points: won * 2,
      };
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.games_won - a.games_won;
    });
  },

  // Users
  getAllUsers() {
    return db.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  },

  getUserById(id: number) {
    return db.users.find(u => u.id === id);
  },

  getUserByUsername(username: string) {
    return db.users.find(u => u.username === username);
  },

  createUser(username: string, password: string, role: 'admin' | 'team_manager', team_id: number | null = null) {
    const user = {
      id: this.getNextId('users'),
      username,
      password,
      role,
      team_id,
      created_at: new Date().toISOString(),
    };
    db.users.push(user);
    saveDatabase();
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  updateUser(id: number, data: any) {
    const user = db.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, data);
      saveDatabase();
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  deleteUser(id: number) {
    db.users = db.users.filter(u => u.id !== id);
    saveDatabase();
  },

  // Match Nominations
  getNominationsForMatch(matchId: number) {
    if (!db.match_nominations) db.match_nominations = [];
    return db.match_nominations.filter(n => n.match_id === matchId);
  },

  nominatePlayer(matchId: number, playerId: number) {
    if (!db.match_nominations) db.match_nominations = [];
    
    const existing = db.match_nominations.find(
      n => n.match_id === matchId && n.player_id === playerId
    );
    
    if (!existing) {
      db.match_nominations.push({
        id: this.getNextId('match_nominations'),
        match_id: matchId,
        player_id: playerId,
        created_at: new Date().toISOString(),
      });
      saveDatabase();
    }
  },

  unnominatePlayer(matchId: number, playerId: number) {
    if (!db.match_nominations) db.match_nominations = [];
    
    db.match_nominations = db.match_nominations.filter(
      n => !(n.match_id === matchId && n.player_id === playerId)
    );
    saveDatabase();
  },

  getNominatedPlayers(matchId: number, teamId: number) {
    if (!db.match_nominations) db.match_nominations = [];
    
    const nominations = db.match_nominations.filter(n => n.match_id === matchId);
    const nominatedPlayerIds = nominations.map(n => n.player_id);
    return db.players.filter(p => p.team_id === teamId && nominatedPlayerIds.includes(p.id));
  },

  // Player Statistics
  getPlayerStatistics() {
    const stats = db.players.map(player => {
      let gamesPlayed = 0;
      let gamesWon = 0;
      let gamesLost = 0;
      let totalPoints = 0;
      
      // Check all match pairs for this player
      db.match_pairs.forEach(pair => {
        const isHome = pair.home_player1_id === player.id || pair.home_player2_id === player.id;
        const isAway = pair.away_player1_id === player.id || pair.away_player2_id === player.id;
        
        if (isHome || isAway) {
          // Count games won/lost
          let homeGames = 0;
          let awayGames = 0;
          
          if (pair.game1_home_score > pair.game1_away_score) homeGames++;
          else if (pair.game1_away_score > pair.game1_home_score) awayGames++;
          
          if (pair.game2_home_score > pair.game2_away_score) homeGames++;
          else if (pair.game2_away_score > pair.game2_home_score) awayGames++;
          
          if (pair.game3_home_score > pair.game3_away_score) homeGames++;
          else if (pair.game3_away_score > pair.game3_home_score) awayGames++;
          
          gamesPlayed++;
          
          if (isHome) {
            if (homeGames > awayGames) gamesWon++;
            else if (awayGames > homeGames) gamesLost++;
            
            totalPoints += (pair.game1_home_score || 0) + (pair.game2_home_score || 0) + (pair.game3_home_score || 0);
          } else {
            if (awayGames > homeGames) gamesWon++;
            else if (homeGames > awayGames) gamesLost++;
            
            totalPoints += (pair.game1_away_score || 0) + (pair.game2_away_score || 0) + (pair.game3_away_score || 0);
          }
        }
      });
      
      const team = db.teams.find(t => t.id === player.team_id);
      
      return {
        id: player.id,
        name: player.name,
        team_id: player.team_id,
        team_name: team?.name || 'Unknown',
        games_played: gamesPlayed,
        games_won: gamesWon,
        games_lost: gamesLost,
        total_points: totalPoints,
        avg_points: gamesPlayed > 0 ? (totalPoints / gamesPlayed).toFixed(1) : '0.0',
      };
    });
    
    // Sort by total points descending
    return stats.sort((a, b) => b.total_points - a.total_points);
  },
};

console.log('Database initialized successfully');

export default database;
