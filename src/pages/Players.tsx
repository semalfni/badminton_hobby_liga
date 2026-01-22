import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import type { Player, Team } from '../types';

export default function Players() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user, isAdmin, canEdit } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingMultiple, setIsAddingMultiple] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', team_id: 0 });
  const [multiplePlayersData, setMultiplePlayersData] = useState({ names: '', team_id: 0 });
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());

  const { data: teams } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: api.getTeams,
  });

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ['players'],
    queryFn: () => api.getPlayers(),
  });

  const createMutation = useMutation({
    mutationFn: api.createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      setIsAdding(false);
      setFormData({ name: '', team_id: 0 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      api.updatePlayer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      setEditingId(null);
      setFormData({ name: '', team_id: 0 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { name: formData.name } });
    } else {
      createMutation.mutate({ team_id: formData.team_id, name: formData.name });
    }
  };

  const handleEdit = (player: Player) => {
    setEditingId(player.id);
    setFormData({ name: player.name, team_id: player.team_id });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsAddingMultiple(false);
    setEditingId(null);
    setFormData({ name: '', team_id: 0 });
    setMultiplePlayersData({ names: '', team_id: 0 });
  };

  const handleMultipleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const names = multiplePlayersData.names
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (names.length === 0) {
      alert(t('players.enterAtLeastOneName') || 'Please enter at least one player name');
      return;
    }

    try {
      // Create all players sequentially
      for (const name of names) {
        await createMutation.mutateAsync({ team_id: multiplePlayersData.team_id, name });
      }
      queryClient.invalidateQueries({ queryKey: ['players'] });
      setIsAddingMultiple(false);
      setMultiplePlayersData({ names: '', team_id: 0 });
    } catch (error) {
      console.error('Error creating players:', error);
    }
  };

  const toggleTeam = (teamId: number) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const expandAll = () => {
    setExpandedTeams(new Set(teams?.map(t => t.id) || []));
  };

  const collapseAll = () => {
    setExpandedTeams(new Set());
  };

  const canManagePlayer = (player: Player) => {
    return (isAdmin || user?.team_id === player.team_id) && canEdit;
  };

  const groupedPlayers = players?.reduce((acc, player) => {
    if (!acc[player.team_id]) {
      acc[player.team_id] = [];
    }
    acc[player.team_id].push(player);
    return acc;
  }, {} as Record<number, Player[]>);

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('players.title')}</h1>
        <div className="flex gap-2">
          {!isAdding && !isAddingMultiple && canEdit && (
            <>
              <button onClick={() => setIsAdding(true)} className="btn btn-primary">
                + {t('players.addPlayer')}
              </button>
              <button onClick={() => setIsAddingMultiple(true)} className="btn btn-secondary">
                + {t('players.addMultiple') || 'Add Multiple'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button 
          onClick={expandAll}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {t('players.expandAll') || 'Expand All'}
        </button>
        <span className="text-gray-400">|</span>
        <button 
          onClick={collapseAll}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {t('players.collapseAll') || 'Collapse All'}
        </button>
      </div>

      {isAdding && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {editingId ? t('players.editPlayer') : t('players.addPlayer')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('players.team')}
              </label>
              <select
                required
                disabled={!!editingId}
                value={formData.team_id}
                onChange={(e) => setFormData({ ...formData, team_id: Number(e.target.value) })}
                className="input"
              >
                <option value={0}>{t('players.selectTeam')}</option>
                {teams
                  ?.filter(team => isAdmin || user?.team_id === team.id)
                  .map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('players.playerName')}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="e.g., John Doe"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editingId ? t('common.update') : t('common.create')}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {isAddingMultiple && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('players.addMultiple') || 'Add Multiple Players'}
          </h2>
          <form onSubmit={handleMultipleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('players.team')}
              </label>
              <select
                required
                value={multiplePlayersData.team_id}
                onChange={(e) => setMultiplePlayersData({ ...multiplePlayersData, team_id: Number(e.target.value) })}
                className="input"
              >
                <option value={0}>{t('players.selectTeam')}</option>
                {teams
                  ?.filter(team => isAdmin || user?.team_id === team.id)
                  .map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('players.playerNames') || 'Player Names (one per line)'}
              </label>
              <textarea
                required
                value={multiplePlayersData.names}
                onChange={(e) => setMultiplePlayersData({ ...multiplePlayersData, names: e.target.value })}
                className="input min-h-[150px]"
                placeholder={t('players.multipleNamesPlaceholder') || 'John Doe\nJane Smith\nBob Johnson\n...'}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('players.multipleNamesHint') || 'Enter one player name per line'}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                {t('players.createAll') || 'Create All'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {teams?.map((team) => {
          const isExpanded = expandedTeams.has(team.id);
          const teamPlayers = groupedPlayers?.[team.id] || [];
          const playerCount = teamPlayers.length;

          return (
            <div key={team.id} className="card">
              <button
                onClick={() => toggleTeam(team.id)}
                className="w-full flex justify-between items-center text-left"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-5 h-5 transition-transform text-gray-600 dark:text-gray-400 ${
                      isExpanded ? 'transform rotate-90' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {team.name}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({playerCount} {playerCount === 1 ? 'player' : 'players'})
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 space-y-2">
                  {teamPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-gray-900 dark:text-white">{player.name}</span>
                      {canManagePlayer(player) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(player)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            {t('common.edit')}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(t('players.confirmDelete'))) {
                                deleteMutation.mutate(player.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            {t('common.delete')}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {teamPlayers.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      {t('players.noPlayers') || 'No players in this team yet.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(!teams || teams.length === 0) && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {t('teams.addTeam') || 'No teams yet.'}
        </div>
      )}
    </div>
  );
}
