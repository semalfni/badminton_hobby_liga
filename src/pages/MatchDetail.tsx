import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import { PairScoreDisplay } from '../components/PairScoreDisplay';
import type { MatchWithPairs, Player } from '../types';

export default function MatchDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const [editingPairId, setEditingPairId] = useState<number | null>(null);
  const [showNominations, setShowNominations] = useState(false);

  const { data: match, isLoading } = useQuery<MatchWithPairs>({
    queryKey: ['match', id],
    queryFn: () => api.getMatch(Number(id)),
  });

  const { data: allHomePlayers } = useQuery<Player[]>({
    queryKey: ['players', match?.home_team_id],
    queryFn: () => api.getPlayers(match?.home_team_id),
    enabled: !!match?.home_team_id,
  });

  const { data: allAwayPlayers } = useQuery<Player[]>({
    queryKey: ['players', match?.away_team_id],
    queryFn: () => api.getPlayers(match?.away_team_id),
    enabled: !!match?.away_team_id,
  });

  const { data: nominations } = useQuery<any[]>({
    queryKey: ['nominations', id],
    queryFn: () => api.getNominations(Number(id)),
  });

  const { data: homePlayers } = useQuery<Player[]>({
    queryKey: ['nominated-players', id, match?.home_team_id],
    queryFn: () => api.getNominatedPlayers(Number(id), match!.home_team_id),
    enabled: !!match?.home_team_id,
  });

  const { data: awayPlayers } = useQuery<Player[]>({
    queryKey: ['nominated-players', id, match?.away_team_id],
    queryFn: () => api.getNominatedPlayers(Number(id), match!.away_team_id),
    enabled: !!match?.away_team_id,
  });

  const updatePairMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateMatchPair(id, data),
    onSuccess: (updatedPair) => {
      // Update the match query cache with the updated pair data
      queryClient.setQueryData(['match', id], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pairs: oldData.pairs.map((p: any) => 
            p.id === updatedPair.id ? updatedPair : p
          )
        };
      });
      
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
      setEditingPairId(null);
    },
  });

  const nominateMutation = useMutation({
    mutationFn: ({ matchId, playerId }: { matchId: number; playerId: number }) =>
      api.nominatePlayer(matchId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominations', id] });
      queryClient.invalidateQueries({ queryKey: ['nominated-players', id] });
    },
  });

  const unnominateMutation = useMutation({
    mutationFn: ({ matchId, playerId }: { matchId: number; playerId: number }) =>
      api.unnominatePlayer(matchId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominations', id] });
      queryClient.invalidateQueries({ queryKey: ['nominated-players', id] });
    },
  });

  const [pairFormData, setPairFormData] = useState<any>({});

  const handleEditPair = (pair: any) => {
    setEditingPairId(pair.id);
    setPairFormData({
      home_player1_id: pair.home_player1_id || '',
      home_player2_id: pair.home_player2_id || '',
      away_player1_id: pair.away_player1_id || '',
      away_player2_id: pair.away_player2_id || '',
      game1_home_score: pair.game1_home_score || 0,
      game1_away_score: pair.game1_away_score || 0,
      game2_home_score: pair.game2_home_score || 0,
      game2_away_score: pair.game2_away_score || 0,
      game3_home_score: pair.game3_home_score || 0,
      game3_away_score: pair.game3_away_score || 0,
    });
  };

  const handleSavePair = (pairId: number) => {
    updatePairMutation.mutate({
      id: pairId,
      data: {
        home_player1_id: pairFormData.home_player1_id ? Number(pairFormData.home_player1_id) : null,
        home_player2_id: pairFormData.home_player2_id ? Number(pairFormData.home_player2_id) : null,
        away_player1_id: pairFormData.away_player1_id ? Number(pairFormData.away_player1_id) : null,
        away_player2_id: pairFormData.away_player2_id ? Number(pairFormData.away_player2_id) : null,
        game1_home_score: Number(pairFormData.game1_home_score) || 0,
        game1_away_score: Number(pairFormData.game1_away_score) || 0,
        game2_home_score: Number(pairFormData.game2_home_score) || 0,
        game2_away_score: Number(pairFormData.game2_away_score) || 0,
        game3_home_score: Number(pairFormData.game3_home_score) || 0,
        game3_away_score: Number(pairFormData.game3_away_score) || 0,
      },
    });
  };

  const handleAutoGeneratePairs = async () => {
    if (!homePlayers || !awayPlayers || !match) {
      alert('Players data not loaded yet');
      return;
    }

    if (homePlayers.length < 6 || awayPlayers.length < 6) {
      alert(`Not enough nominated players! Each team needs at least 6 nominated players.\nHome team has ${homePlayers.length}, Away team has ${awayPlayers.length}.\n\nPlease nominate more players first.`);
      return;
    }

    if (!confirm('This will randomly assign nominated players to all 9 pairs. Each player will play up to 3 times with different partners. Continue?')) {
      return;
    }

    // Function to generate pairs ensuring no duplicate pairs and each player plays max 3 times
    const generateSmartPairs = (players: Player[], numPairs: number) => {
      const pairs: Array<[number, number]> = [];
      const playerCount: Record<number, number> = {};
      const partnerships = new Set<string>();
      
      // Initialize tracking
      players.forEach(p => {
        playerCount[p.id] = 0;
      });
      
      // Helper to create partnership key (always smaller ID first for consistency)
      const getPairKey = (id1: number, id2: number) => {
        return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
      };
      
      // Shuffle players for randomness
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      
      // Create all possible pairs sorted by how many times players have played
      const findBestPair = () => {
        let bestPair: [Player, Player] | null = null;
        let minTotalPlays = Infinity;
        
        for (let i = 0; i < shuffled.length; i++) {
          const p1 = shuffled[i];
          if (playerCount[p1.id] >= 3) continue;
          
          for (let j = i + 1; j < shuffled.length; j++) {
            const p2 = shuffled[j];
            if (playerCount[p2.id] >= 3) continue;
            
            const pairKey = getPairKey(p1.id, p2.id);
            if (partnerships.has(pairKey)) continue;
            
            // Prefer pairs where players have played less
            const totalPlays = playerCount[p1.id] + playerCount[p2.id];
            if (totalPlays < minTotalPlays) {
              minTotalPlays = totalPlays;
              bestPair = [p1, p2];
            }
          }
        }
        
        return bestPair;
      };
      
      // Generate pairs
      for (let i = 0; i < numPairs; i++) {
        const pair = findBestPair();
        
        if (pair) {
          const [p1, p2] = pair;
          pairs.push([p1.id, p2.id]);
          playerCount[p1.id]++;
          playerCount[p2.id]++;
          partnerships.add(getPairKey(p1.id, p2.id));
        } else {
          // If we can't find any valid pair, fill with nulls
          pairs.push([null as any, null as any]);
        }
      }
      
      return pairs;
    };

    try {
      const homePairs = generateSmartPairs(homePlayers, 9);
      const awayPairs = generateSmartPairs(awayPlayers, 9);

      // Update all pairs
      const updatePromises = match.pairs.map((pair, index) => {
        const homePair = homePairs[index] || [null, null];
        const awayPair = awayPairs[index] || [null, null];

        return api.updateMatchPair(pair.id, {
          home_player1_id: homePair[0] || null,
          home_player2_id: homePair[1] || null,
          away_player1_id: awayPair[0] || null,
          away_player2_id: awayPair[1] || null,
          game1_home_score: 0,
          game1_away_score: 0,
          game2_home_score: 0,
          game2_away_score: 0,
          game3_home_score: 0,
          game3_away_score: 0,
        });
      });

      await Promise.all(updatePromises);
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      alert('Pairs generated successfully! Each player plays up to 3 times with different partners.');
    } catch (error) {
      alert('Failed to generate pairs');
    }
  };

  const handleToggleNomination = (playerId: number) => {
    if (isPlayerNominated(playerId)) {
      unnominateMutation.mutate({ matchId: Number(id), playerId });
    } else {
      nominateMutation.mutate({ matchId: Number(id), playerId });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isPlayerNominated = (playerId: number) => {
    if (!nominations || !Array.isArray(nominations)) return false;
    return nominations.some(n => n.player_id === playerId);
  };

  const canNominateForTeam = (teamId: number) => {
    return isAdmin || user?.team_id === teamId;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!match) {
    return <div className="text-center py-8">Match not found</div>;
  }

  const canEditMatch = isAdmin || user?.team_id === match.home_team_id || user?.team_id === match.away_team_id;

  // Calculate total points from all pairs
  const calculateTotalPoints = () => {
    let homeTotalPoints = 0;
    let awayTotalPoints = 0;
    
    match.pairs?.forEach((pair) => {
      homeTotalPoints += (pair.game1_home_score || 0) + (pair.game2_home_score || 0) + (pair.game3_home_score || 0);
      awayTotalPoints += (pair.game1_away_score || 0) + (pair.game2_away_score || 0) + (pair.game3_away_score || 0);
    });
    
    return { homeTotalPoints, awayTotalPoints };
  };
  
  const { homeTotalPoints, awayTotalPoints } = calculateTotalPoints();

  return (
    <div>
      <button
        onClick={() => navigate('/matches')}
        className="mb-4 text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        {t('matchDetail.backToMatches')}
      </button>

      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('matchDetail.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{formatDate(match.match_date)}</p>
            <p className="text-gray-600 dark:text-gray-400">📍 {match.location}</p>
          </div>
          <span
            className={`px-3 py-1 text-sm font-medium rounded ${
              match.completed
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            }`}
          >
            {match.completed ? t('matches.completed') : t('matches.inProgress')}
          </span>
        </div>

        <div className="flex items-center justify-center gap-8 py-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {match.home_team_name}
            </div>
            <div className="text-5xl font-bold text-blue-600">{match.home_score}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">({t('matchDetail.totalPoints', { count: homeTotalPoints })})</div>
          </div>
          <div className="text-3xl font-bold text-gray-400">{t('matches.vs').toUpperCase()}</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {match.away_team_name}
            </div>
            <div className="text-5xl font-bold text-red-600">{match.away_score}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">({t('matchDetail.totalPoints', { count: awayTotalPoints })})</div>
          </div>
        </div>
      </div>

      {canEditMatch && (
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('matchDetail.playerNominations')}
            </h2>
            <button
              onClick={() => setShowNominations(!showNominations)}
              className="btn btn-secondary text-sm"
            >
              {showNominations ? t('matchDetail.hideNominations') : t('matchDetail.showNominations')}
            </button>
          </div>

          {showNominations && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                  {match.home_team_name} ({homePlayers?.length || 0} {t('matchDetail.nominated')})
                </h3>
                {canNominateForTeam(match.home_team_id) ? (
                  <div className="space-y-2">
                    {allHomePlayers && allHomePlayers.length > 0 ? (
                      allHomePlayers.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span className="text-gray-900 dark:text-white">{player.name}</span>
                          <button
                            onClick={() => handleToggleNomination(player.id)}
                            className={`px-3 py-1 text-sm rounded ${
                              isPlayerNominated(player.id)
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                          >
                            {isPlayerNominated(player.id) ? `✓ ${t('matchDetail.nominated')}` : t('matchDetail.nominate')}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        No players in this team yet.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    Only {match.home_team_name} manager can nominate players
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                  {match.away_team_name} ({awayPlayers?.length || 0} nominated)
                </h3>
                {canNominateForTeam(match.away_team_id) ? (
                  <div className="space-y-2">
                    {allAwayPlayers && allAwayPlayers.length > 0 ? (
                      allAwayPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span className="text-gray-900 dark:text-white">{player.name}</span>
                          <button
                            onClick={() => handleToggleNomination(player.id)}
                            className={`px-3 py-1 text-sm rounded ${
                              isPlayerNominated(player.id)
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                          >
                            {isPlayerNominated(player.id) ? `✓ ${t('matchDetail.nominated')}` : t('matchDetail.nominate')}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        No players in this team yet.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    Only {match.away_team_name} manager can nominate players
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pair Results</h2>
          {canEditMatch && (
            <button
              onClick={handleAutoGeneratePairs}
              className="btn btn-secondary text-sm"
              disabled={!homePlayers || !awayPlayers}
            >
              {t('matchDetail.autoGeneratePairs')}
            </button>
          )}
        </div>
        <div className="space-y-4">
          {match.pairs?.map((pair) => (
            <div
              key={pair.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('matchDetail.pairNumber', { number: pair.pair_number })}
                </h3>
                {canEditMatch && (
                  <>
                    {editingPairId === pair.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSavePair(pair.id)}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingPairId(null)}
                          className="text-gray-600 hover:text-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditPair(pair)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                    )}
                  </>
                )}
              </div>

              {editingPairId === pair.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {match.home_team_name} - Player 1
                      </label>
                      <select
                        value={pairFormData.home_player1_id}
                        onChange={(e) =>
                          setPairFormData({ ...pairFormData, home_player1_id: e.target.value })
                        }
                        className="input"
                      >
                        <option value="">Select player</option>
                        {homePlayers?.map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.name}
                          </option>
                        ))}
                      </select>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
                        {match.home_team_name} - Player 2
                      </label>
                      <select
                        value={pairFormData.home_player2_id}
                        onChange={(e) =>
                          setPairFormData({ ...pairFormData, home_player2_id: e.target.value })
                        }
                        className="input"
                      >
                        <option value="">Select player</option>
                        {homePlayers?.map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {match.away_team_name} - Player 1
                      </label>
                      <select
                        value={pairFormData.away_player1_id}
                        onChange={(e) =>
                          setPairFormData({ ...pairFormData, away_player1_id: e.target.value })
                        }
                        className="input"
                      >
                        <option value="">Select player</option>
                        {awayPlayers?.map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.name}
                          </option>
                        ))}
                      </select>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
                        {match.away_team_name} - Player 2
                      </label>
                      <select
                        value={pairFormData.away_player2_id}
                        onChange={(e) =>
                          setPairFormData({ ...pairFormData, away_player2_id: e.target.value })
                        }
                        className="input"
                      >
                        <option value="">Select player</option>
                        {awayPlayers?.map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Game Scores (Best of 3)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Game 1
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={pairFormData.game1_home_score}
                            onChange={(e) =>
                              setPairFormData({ ...pairFormData, game1_home_score: e.target.value })
                            }
                            className="input"
                            placeholder="Home"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={pairFormData.game1_away_score}
                            onChange={(e) =>
                              setPairFormData({ ...pairFormData, game1_away_score: e.target.value })
                            }
                            className="input"
                            placeholder="Away"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Game 2
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={pairFormData.game2_home_score}
                            onChange={(e) =>
                              setPairFormData({ ...pairFormData, game2_home_score: e.target.value })
                            }
                            className="input"
                            placeholder="Home"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={pairFormData.game2_away_score}
                            onChange={(e) =>
                              setPairFormData({ ...pairFormData, game2_away_score: e.target.value })
                            }
                            className="input"
                            placeholder="Away"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Game 3 (if needed)
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={pairFormData.game3_home_score}
                            onChange={(e) =>
                              setPairFormData({ ...pairFormData, game3_home_score: e.target.value })
                            }
                            className="input"
                            placeholder="Home"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={pairFormData.game3_away_score}
                            onChange={(e) =>
                              setPairFormData({ ...pairFormData, game3_away_score: e.target.value })
                            }
                            className="input"
                            placeholder="Away"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <PairScoreDisplay pair={pair} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
