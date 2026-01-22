import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import type { Match, Team } from '../types';

export default function Matches() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin, canEdit } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    home_team_id: 0,
    away_team_id: 0,
    match_date: '',
    location: '',
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: api.getTeams,
  });

  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: api.getMatches,
  });

  const createMutation = useMutation({
    mutationFn: api.createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      setIsAdding(false);
      setFormData({ home_team_id: 0, away_team_id: 0, match_date: '', location: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: ({ id, match }: { id: number; match: Match }) =>
      api.updateMatch(id, {
        match_date: match.match_date,
        location: match.location,
        home_score: match.home_score,
        away_score: match.away_score,
        completed: !match.completed,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setFormData({ home_team_id: 0, away_team_id: 0, match_date: '', location: '' });
  };

  const handleHomeTeamChange = (teamId: number) => {
    const selectedTeam = teams?.find(t => t.id === teamId);
    setFormData({
      ...formData,
      home_team_id: teamId,
      location: selectedTeam?.address || '',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('matches.title')}</h1>
        {!isAdding && canEdit && (
          <button onClick={() => setIsAdding(true)} className="btn btn-primary">
            + {t('matches.addMatch')}
          </button>
        )}
      </div>

      {isAdding && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('matches.addMatch')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('matches.homeTeam')}
                </label>
                <select
                  required
                  value={formData.home_team_id}
                  onChange={(e) => handleHomeTeamChange(Number(e.target.value))}
                  className="input"
                >
                  <option value={0}>{t('players.selectTeam')}</option>
                  {teams?.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('matches.awayTeam')}
                </label>
                <select
                  required
                  value={formData.away_team_id}
                  onChange={(e) =>
                    setFormData({ ...formData, away_team_id: Number(e.target.value) })
                  }
                  className="input"
                >
                  <option value={0}>{t('players.selectTeam')}</option>
                  {teams
                    ?.filter((team) => team.id !== formData.home_team_id)
                    .map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('matches.matchDate')}
              </label>
              <input
                type="date"
                required
                value={formData.match_date}
                onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('matches.location')}
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                placeholder={t('matches.location')}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                {t('common.create')}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {matches?.map((match) => (
          <div key={match.id} className="card">
            {/* Mobile and Desktop Layout */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex-1">
                {/* Status Badge, Date, and Location */}
                <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      match.completed
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}
                  >
                    {match.completed ? t('matches.completed') : t('matches.inProgress')}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(match.match_date)}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 break-all">
                    📍 {match.location}
                  </span>
                </div>
                
                {/* Team Names and Scores */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  {/* Home Team */}
                  <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base flex-1 sm:flex-none sm:w-32 md:w-48 truncate">
                      {match.home_team_name}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {match.home_score}
                    </span>
                  </div>
                  
                  {/* Separator */}
                  <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">-</span>
                  
                  {/* Away Team */}
                  <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white sm:order-first">
                      {match.away_score}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base flex-1 sm:flex-none sm:w-32 md:w-48 truncate">
                      {match.away_team_name}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/matches/${match.id}`)}
                  className="btn btn-primary text-sm flex-1 sm:flex-none"
                >
                  {t('matches.viewDetails')}
                </button>
                {canEdit && (
                  <>
                    <button
                      onClick={() => toggleCompleteMutation.mutate({ id: match.id, match })}
                      className="btn btn-secondary text-sm flex-1 sm:flex-none whitespace-nowrap"
                    >
                      {match.completed ? t('matchDetail.reopenMatch') : t('matchDetail.markCompleted')}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t('matches.confirmDelete'))) {
                          deleteMutation.mutate(match.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 text-sm px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {t('common.delete')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!matches || matches.length === 0) && !isAdding && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {t('matches.addMatch')}
        </div>
      )}
    </div>
  );
}
