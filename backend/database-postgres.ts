import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const database = {
  // Initialize database with default admin user
  async initialize() {
    try {
      // Check if admin user exists
      const adminCheck = await sql`
        SELECT id FROM users WHERE username = 'admin' LIMIT 1
      `;
      
      if (adminCheck.rows.length === 0) {
        // Create default admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await sql`
          INSERT INTO users (username, password, role)
          VALUES ('admin', ${hashedPassword}, 'admin')
        `;
        console.log('Default admin user created');
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  },

  // Authentication
  async login(username: string, password: string) {
    const result = await sql`
      SELECT * FROM users WHERE username = ${username} LIMIT 1
    `;
    
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, team_id: user.team_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        team_id: user.team_id,
      },
      token,
    };
  },

  // Teams
  async getTeams() {
    const result = await sql`SELECT * FROM teams ORDER BY name`;
    return result.rows;
  },

  async getTeamById(id: number) {
    const result = await sql`SELECT * FROM teams WHERE id = ${id} LIMIT 1`;
    return result.rows[0];
  },

  async createTeam(name: string, home_day?: string, home_time?: string, address?: string) {
    const result = await sql`
      INSERT INTO teams (name, home_day, home_time, address)
      VALUES (${name}, ${home_day || null}, ${home_time || null}, ${address || null})
      RETURNING *
    `;
    return result.rows[0];
  },

  async updateTeam(id: number, data: any) {
    const { name, home_day, home_time, address } = data;
    const result = await sql`
      UPDATE teams
      SET name = COALESCE(${name}, name),
          home_day = COALESCE(${home_day}, home_day),
          home_time = COALESCE(${home_time}, home_time),
          address = COALESCE(${address}, address)
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  },

  async deleteTeam(id: number) {
    await sql`DELETE FROM teams WHERE id = ${id}`;
  },

  // Players
  async getPlayers(teamId?: number) {
    if (teamId) {
      const result = await sql`
        SELECT * FROM players WHERE team_id = ${teamId} ORDER BY name
      `;
      return result.rows;
    }
    const result = await sql`SELECT * FROM players ORDER BY name`;
    return result.rows;
  },

  async getPlayerById(id: number) {
    const result = await sql`SELECT * FROM players WHERE id = ${id} LIMIT 1`;
    return result.rows[0];
  },

  async createPlayer(team_id: number, name: string) {
    const result = await sql`
      INSERT INTO players (team_id, name)
      VALUES (${team_id}, ${name})
      RETURNING *
    `;
    return result.rows[0];
  },

  async updatePlayer(id: number, name: string) {
    const result = await sql`
      UPDATE players SET name = ${name} WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  },

  async deletePlayer(id: number) {
    await sql`DELETE FROM players WHERE id = ${id}`;
  },

  // Matches
  async getMatches() {
    const result = await sql`
      SELECT 
        m.*,
        ht.name as home_team_name,
        at.name as away_team_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      ORDER BY m.match_date DESC
    `;
    return result.rows;
  },

  async getMatchById(id: number) {
    const matchResult = await sql`
      SELECT 
        m.*,
        ht.name as home_team_name,
        at.name as away_team_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      WHERE m.id = ${id}
      LIMIT 1
    `;
    
    if (matchResult.rows.length === 0) {
      return null;
    }
    
    const match = matchResult.rows[0];
    
    // Get pairs for this match
    const pairsResult = await sql`
      SELECT 
        mp.*,
        hp1.name as home_player1_name,
        hp2.name as home_player2_name,
        ap1.name as away_player1_name,
        ap2.name as away_player2_name
      FROM match_pairs mp
      LEFT JOIN players hp1 ON mp.home_player1_id = hp1.id
      LEFT JOIN players hp2 ON mp.home_player2_id = hp2.id
      LEFT JOIN players ap1 ON mp.away_player1_id = ap1.id
      LEFT JOIN players ap2 ON mp.away_player2_id = ap2.id
      WHERE mp.match_id = ${id}
      ORDER BY mp.pair_number
    `;
    
    return {
      ...match,
      pairs: pairsResult.rows,
    };
  },

  async getMatchSimple(id: number) {
    const result = await sql`
      SELECT * FROM matches WHERE id = ${id} LIMIT 1
    `;
    return result.rows[0];
  },

  async createMatch(home_team_id: number, away_team_id: number, match_date: string, location?: string) {
    const result = await sql`
      INSERT INTO matches (home_team_id, away_team_id, match_date, location)
      VALUES (${home_team_id}, ${away_team_id}, ${match_date}, ${location || null})
      RETURNING *
    `;
    
    const matchId = result.rows[0].id;
    
    // Create 9 empty pairs
    for (let i = 1; i <= 9; i++) {
      await sql`
        INSERT INTO match_pairs (match_id, pair_number)
        VALUES (${matchId}, ${i})
      `;
    }
    
    return await this.getMatchById(matchId);
  },

  async updateMatch(id: number, data: any) {
    const { match_date, location, completed } = data;
    const result = await sql`
      UPDATE matches
      SET match_date = COALESCE(${match_date}, match_date),
          location = COALESCE(${location}, location),
          completed = COALESCE(${completed}, completed)
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  },

  async deleteMatch(id: number) {
    await sql`DELETE FROM matches WHERE id = ${id}`;
  },

  // Match Pairs
  async createMatchPair(data: any) {
    const { match_id, pair_number, home_player1_id, home_player2_id, away_player1_id, away_player2_id } = data;
    const result = await sql`
      INSERT INTO match_pairs (
        match_id, pair_number, 
        home_player1_id, home_player2_id, 
        away_player1_id, away_player2_id
      )
      VALUES (
        ${match_id}, ${pair_number},
        ${home_player1_id || null}, ${home_player2_id || null},
        ${away_player1_id || null}, ${away_player2_id || null}
      )
      RETURNING *
    `;
    return result.rows[0];
  },

  async updateMatchPair(id: number, data: any) {
    const {
      home_player1_id, home_player2_id, away_player1_id, away_player2_id,
      game1_home_score, game1_away_score,
      game2_home_score, game2_away_score,
      game3_home_score, game3_away_score
    } = data;
    
    // Update the pair
    await sql`
      UPDATE match_pairs
      SET home_player1_id = COALESCE(${home_player1_id}, home_player1_id),
          home_player2_id = COALESCE(${home_player2_id}, home_player2_id),
          away_player1_id = COALESCE(${away_player1_id}, away_player1_id),
          away_player2_id = COALESCE(${away_player2_id}, away_player2_id),
          game1_home_score = COALESCE(${game1_home_score}, game1_home_score),
          game1_away_score = COALESCE(${game1_away_score}, game1_away_score),
          game2_home_score = COALESCE(${game2_home_score}, game2_home_score),
          game2_away_score = COALESCE(${game2_away_score}, game2_away_score),
          game3_home_score = COALESCE(${game3_home_score}, game3_home_score),
          game3_away_score = COALESCE(${game3_away_score}, game3_away_score)
      WHERE id = ${id}
    `;
    
    // Get the updated pair to calculate match score
    const pairResult = await sql`SELECT * FROM match_pairs WHERE id = ${id}`;
    const pair = pairResult.rows[0];
    
    // Recalculate match score
    const allPairsResult = await sql`
      SELECT * FROM match_pairs WHERE match_id = ${pair.match_id}
    `;
    
    let homeScore = 0;
    let awayScore = 0;
    
    for (const p of allPairsResult.rows) {
      let homeGames = 0;
      let awayGames = 0;
      
      if (p.game1_home_score > p.game1_away_score) homeGames++;
      else if (p.game1_away_score > p.game1_home_score) awayGames++;
      
      if (p.game2_home_score > p.game2_away_score) homeGames++;
      else if (p.game2_away_score > p.game2_home_score) awayGames++;
      
      if (p.game3_home_score > p.game3_away_score) homeGames++;
      else if (p.game3_away_score > p.game3_home_score) awayGames++;
      
      if (homeGames > awayGames) homeScore++;
      else if (awayGames > homeGames) awayScore++;
    }
    
    // Update match score
    await sql`
      UPDATE matches
      SET home_score = ${homeScore}, away_score = ${awayScore}
      WHERE id = ${pair.match_id}
    `;
    
    // Return pair with player names
    const updatedPairResult = await sql`
      SELECT 
        mp.*,
        hp1.name as home_player1_name,
        hp2.name as home_player2_name,
        ap1.name as away_player1_name,
        ap2.name as away_player2_name
      FROM match_pairs mp
      LEFT JOIN players hp1 ON mp.home_player1_id = hp1.id
      LEFT JOIN players hp2 ON mp.home_player2_id = hp2.id
      LEFT JOIN players ap1 ON mp.away_player1_id = ap1.id
      LEFT JOIN players ap2 ON mp.away_player2_id = ap2.id
      WHERE mp.id = ${id}
    `;
    
    return updatedPairResult.rows[0];
  },

  // Standings
  async getStandings() {
    const teams = await this.getTeams();
    const matches = await sql`SELECT * FROM matches WHERE completed = true`;
    
    return teams.map((team: any) => {
      const homeMatches = matches.rows.filter((m: any) => m.home_team_id === team.id);
      const awayMatches = matches.rows.filter((m: any) => m.away_team_id === team.id);
      
      let wins = 0;
      let losses = 0;
      let draws = 0;
      let pairsWon = 0;
      let pairsLost = 0;
      
      homeMatches.forEach((m: any) => {
        pairsWon += m.home_score;
        pairsLost += m.away_score;
        if (m.home_score > m.away_score) wins++;
        else if (m.home_score < m.away_score) losses++;
        else draws++;
      });
      
      awayMatches.forEach((m: any) => {
        pairsWon += m.away_score;
        pairsLost += m.home_score;
        if (m.away_score > m.home_score) wins++;
        else if (m.away_score < m.home_score) losses++;
        else draws++;
      });
      
      const played = wins + losses + draws;
      const points = wins * 3 + draws;
      const pairsDiff = pairsWon - pairsLost;
      
      return {
        team_id: team.id,
        team_name: team.name,
        played,
        wins,
        draws,
        losses,
        pairs_won: pairsWon,
        pairs_lost: pairsLost,
        pairs_diff: pairsDiff,
        points,
      };
    }).sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.pairs_diff - a.pairs_diff;
    });
  },

  // Player Statistics
  async getPlayerStatistics() {
    const players = await sql`
      SELECT p.*, t.name as team_name
      FROM players p
      JOIN teams t ON p.team_id = t.id
      ORDER BY p.name
    `;
    
    const statistics = await Promise.all(
      players.rows.map(async (player: any) => {
        // Get all pairs where this player participated
        const pairsResult = await sql`
          SELECT * FROM match_pairs
          WHERE home_player1_id = ${player.id}
             OR home_player2_id = ${player.id}
             OR away_player1_id = ${player.id}
             OR away_player2_id = ${player.id}
        `;
        
        let gamesPlayed = 0;
        let gamesWon = 0;
        let gamesLost = 0;
        let totalPoints = 0;
        
        for (const pair of pairsResult.rows) {
          const isHome = pair.home_player1_id === player.id || pair.home_player2_id === player.id;
          const isAway = pair.away_player1_id === player.id || pair.away_player2_id === player.id;
          
          if (isHome || isAway) {
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
        }
        
        return {
          id: player.id,
          name: player.name,
          team_id: player.team_id,
          team_name: player.team_name,
          games_played: gamesPlayed,
          games_won: gamesWon,
          games_lost: gamesLost,
          total_points: totalPoints,
          avg_points: gamesPlayed > 0 ? (totalPoints / gamesPlayed).toFixed(1) : '0.0',
        };
      })
    );
    
    return statistics.sort((a, b) => b.total_points - a.total_points);
  },

  // Users
  async getUsers() {
    const result = await sql`
      SELECT id, username, role, team_id FROM users ORDER BY username
    `;
    return result.rows;
  },

  async getUserByUsername(username: string) {
    const result = await sql`
      SELECT * FROM users WHERE username = ${username} LIMIT 1
    `;
    return result.rows[0];
  },

  async createUser(username: string, password: string, role: string, team_id?: number) {
    const existing = await this.getUserByUsername(username);
    if (existing) {
      throw new Error('Username already exists');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await sql`
      INSERT INTO users (username, password, role, team_id)
      VALUES (${username}, ${hashedPassword}, ${role}, ${team_id || null})
      RETURNING id, username, role, team_id
    `;
    return result.rows[0];
  },

  async updateUser(id: number, data: any) {
    const { username, password, role, team_id } = data;
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await sql`
        UPDATE users
        SET username = COALESCE(${username}, username),
            password = ${hashedPassword},
            role = COALESCE(${role}, role),
            team_id = COALESCE(${team_id}, team_id)
        WHERE id = ${id}
        RETURNING id, username, role, team_id
      `;
      return result.rows[0];
    } else {
      const result = await sql`
        UPDATE users
        SET username = COALESCE(${username}, username),
            role = COALESCE(${role}, role),
            team_id = COALESCE(${team_id}, team_id)
        WHERE id = ${id}
        RETURNING id, username, role, team_id
      `;
      return result.rows[0];
    }
  },

  async deleteUser(id: number) {
    await sql`DELETE FROM users WHERE id = ${id}`;
  },

  // Match Nominations
  async getNominationsForMatch(matchId: number) {
    const result = await sql`
      SELECT * FROM match_nominations WHERE match_id = ${matchId}
    `;
    return result.rows;
  },

  async nominatePlayer(matchId: number, playerId: number) {
    try {
      await sql`
        INSERT INTO match_nominations (match_id, player_id)
        VALUES (${matchId}, ${playerId})
      `;
    } catch (error: any) {
      // Ignore duplicate key errors
      if (!error.message?.includes('unique')) {
        throw error;
      }
    }
  },

  async unnominatePlayer(matchId: number, playerId: number) {
    await sql`
      DELETE FROM match_nominations
      WHERE match_id = ${matchId} AND player_id = ${playerId}
    `;
  },

  async getNominatedPlayers(matchId: number, teamId: number) {
    const result = await sql`
      SELECT p.*
      FROM players p
      INNER JOIN match_nominations mn ON p.id = mn.player_id
      WHERE mn.match_id = ${matchId} AND p.team_id = ${teamId}
      ORDER BY p.name
    `;
    return result.rows;
  },
};

export default database;
