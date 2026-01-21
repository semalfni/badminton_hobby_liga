const API_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Users
  getUsers: async () => {
    const res = await fetch(`${API_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createUser: async (data: { username: string; password: string; role: string; team_id: number | null }) => {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateUser: async (id: number, data: any) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteUser: async (id: number) => {
    await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // Teams
  getTeams: async () => {
    const res = await fetch(`${API_URL}/teams`);
    return res.json();
  },
  
  createTeam: async (data: { name: string; home_day: string; home_time: string; address: string }) => {
    const res = await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  updateTeam: async (id: number, data: { name: string; home_day: string; home_time: string; address: string }) => {
    const res = await fetch(`${API_URL}/teams/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  deleteTeam: async (id: number) => {
    await fetch(`${API_URL}/teams/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // Players
  getPlayers: async (teamId?: number) => {
    const url = teamId ? `${API_URL}/players?team_id=${teamId}` : `${API_URL}/players`;
    const res = await fetch(url);
    return res.json();
  },
  
  createPlayer: async (data: { team_id: number; name: string }) => {
    const res = await fetch(`${API_URL}/players`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  updatePlayer: async (id: number, data: { name: string }) => {
    const res = await fetch(`${API_URL}/players/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  deletePlayer: async (id: number) => {
    await fetch(`${API_URL}/players/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // Matches
  getMatches: async () => {
    const res = await fetch(`${API_URL}/matches`);
    return res.json();
  },
  
  getMatch: async (id: number) => {
    const res = await fetch(`${API_URL}/matches/${id}`);
    return res.json();
  },
  
  createMatch: async (data: { home_team_id: number; away_team_id: number; match_date: string; location: string }) => {
    const res = await fetch(`${API_URL}/matches`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  updateMatch: async (id: number, data: { match_date: string; location: string; home_score: number; away_score: number; completed: boolean }) => {
    const res = await fetch(`${API_URL}/matches/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  deleteMatch: async (id: number) => {
    await fetch(`${API_URL}/matches/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // Match Pairs
  updateMatchPair: async (id: number, data: any) => {
    const res = await fetch(`${API_URL}/match-pairs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Standings
  getStandings: async () => {
    const res = await fetch(`${API_URL}/standings`);
    return res.json();
  },

  // Match Nominations
  getNominations: async (matchId: number) => {
    const res = await fetch(`${API_URL}/matches/${matchId}/nominations`);
    return res.json();
  },

  getNominatedPlayers: async (matchId: number, teamId: number) => {
    const res = await fetch(`${API_URL}/matches/${matchId}/nominated-players/${teamId}`);
    return res.json();
  },

  nominatePlayer: async (matchId: number, playerId: number) => {
    const res = await fetch(`${API_URL}/matches/${matchId}/nominate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ player_id: playerId }),
    });
    return res.json();
  },

  unnominatePlayer: async (matchId: number, playerId: number) => {
    await fetch(`${API_URL}/matches/${matchId}/nominate/${playerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  getPlayerStatistics: async () => {
    const res = await fetch(`${API_URL}/player-statistics`);
    return res.json();
  },
};
