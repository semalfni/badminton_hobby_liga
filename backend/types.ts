export interface Team {
  id: number;
  name: string;
  home_day: string;
  home_time: string;
  address: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'team_manager' | 'observer';
  team_id: number | null;
  created_at: string;
}

export interface Player {
  id: number;
  team_id: number;
  name: string;
  created_at: string;
}

export interface Match {
  id: number;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  location: string;
  home_score: number;
  away_score: number;
  completed: boolean;
  created_at: string;
}

export interface MatchPair {
  id: number;
  match_id: number;
  pair_number: number;
  home_player1_id: number | null;
  home_player2_id: number | null;
  away_player1_id: number | null;
  away_player2_id: number | null;
  game1_home_score: number;
  game1_away_score: number;
  game2_home_score: number;
  game2_away_score: number;
  game3_home_score: number;
  game3_away_score: number;
}

export interface Standing {
  team_id: number;
  team_name: string;
  played: number;
  won: number;
  lost: number;
  games_won: number;
  games_lost: number;
  points: number;
}
