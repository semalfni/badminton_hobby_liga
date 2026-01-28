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
  role: 'admin' | 'league_manager' | 'team_manager' | 'observer';
  team_id: number | null;
  created_at?: string;
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
  home_sets?: number;
  away_sets?: number;
  completed: boolean;
  mvp_player_id?: number | null;
  mvp_player_name?: string | null;
  mvp_team_id?: number | null;
  created_at: string;
  home_team_name?: string;
  home_team_time?: string;
  away_team_name?: string;
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
  home_player1_name?: string;
  home_player2_name?: string;
  away_player1_name?: string;
  away_player2_name?: string;
}

export interface MatchWithPairs extends Match {
  pairs: MatchPair[];
}

export interface Standing {
  team_id: number;
  team_name: string;
  matches_played: number;
  games_played: number;
  games_won: number;
  sets_won: number;
  sets_lost: number;
  points_won: number;
  points_lost: number;
}
