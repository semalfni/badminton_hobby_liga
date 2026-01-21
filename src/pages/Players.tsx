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
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', team_id: 0 });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: api.getTeams,
  });

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ['players', selectedTeamId],
    queryFn: () => api.getPlayers(selectedTeamId || undefined),
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
    setEditingId(null);
    setFormData({ name: '', team_id: 0 });
  };

  const getTeamName = (teamId: number) => {
    return teams?.find((t) => t.id === teamId)?.name || 'Unknown';
  };

  const canManagePlayer = (player: Player) => {
    return (isAdmin || user?.team_id === player.team_id) && canEdit;
  };

  const canAddPlayer = (teamId: number) => {
    return (isAdmin || user?.team_id === teamId) && canEdit;
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
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn btn-primary">
            + {t('players.addPlayer')}
          </button>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('players.selectTeam')}
        </label>
        <select
          value={selectedTeamId || ''}
          onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : null)}
          className="input max-w-xs"
        >
          <option value="">{t('players.allTeams')}</option>
          {teams?.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
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

      <div className="space-y-6">
        {selectedTeamId ? (
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {getTeamName(selectedTeamId)}
            </h3>
            <div className="space-y-2">
              {players
                ?.filter((p) => p.team_id === selectedTeamId)
                .map((player) => (
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
              {players?.filter((p) => p.team_id === selectedTeamId).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  {t('players.addPlayer')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {teams?.map((team) => (
              <div key={team.id} className="card">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {team.name}
                </h3>
                <div className="space-y-2">
                  {groupedPlayers?.[team.id]?.map((player) => (
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
                  {(!groupedPlayers?.[team.id] || groupedPlayers[team.id].length === 0) && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      {t('players.addPlayer')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {(!players || players.length === 0) && !isAdding && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {t('players.addPlayer')}
        </div>
      )}
    </div>
  );
}
