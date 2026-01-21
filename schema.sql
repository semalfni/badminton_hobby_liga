-- Badminton Liga Database Schema

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    home_day VARCHAR(50),
    home_time VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    home_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    match_date DATE NOT NULL,
    location TEXT,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Match pairs table
CREATE TABLE IF NOT EXISTS match_pairs (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    pair_number INTEGER NOT NULL,
    home_player1_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    home_player2_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    away_player1_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    away_player2_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    game1_home_score INTEGER DEFAULT 0,
    game1_away_score INTEGER DEFAULT 0,
    game2_home_score INTEGER DEFAULT 0,
    game2_away_score INTEGER DEFAULT 0,
    game3_home_score INTEGER DEFAULT 0,
    game3_away_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'team_manager')),
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Match nominations table
CREATE TABLE IF NOT EXISTS match_nominations (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, player_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_home_team ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team ON matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_match_pairs_match_id ON match_pairs(match_id);
CREATE INDEX IF NOT EXISTS idx_match_nominations_match_id ON match_nominations(match_id);
CREATE INDEX IF NOT EXISTS idx_match_nominations_player_id ON match_nominations(player_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
