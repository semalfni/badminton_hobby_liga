import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../api';
import type { Standing } from '../types';

interface StandingsHistoryPoint {
  matchNumber: number;
  matchDate: string;
  standings: Array<{
    team_id: number;
    team_name: string;
    position: number;
    games_won: number;
    sets_won: number;
    points_won: number;
  }>;
}

const TEAM_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export default function Standings() {
  const { t } = useTranslation();
  const [showChart, setShowChart] = useState(false);
  
  const { data: standings, isLoading } = useQuery<Standing[]>({
    queryKey: ['standings'],
    queryFn: api.getStandings,
  });

  const { data: standingsHistory } = useQuery<StandingsHistoryPoint[]>({
    queryKey: ['standings-history'],
    queryFn: api.getStandingsHistory,
    enabled: showChart,
  });

  // Transform data for the chart
  const chartData = standingsHistory?.map((point) => {
    const dataPoint: any = {
      match: `Round ${point.matchNumber}`,
      matchNumber: point.matchNumber,
    };
    
    point.standings.forEach((standing) => {
      dataPoint[standing.team_name] = standing.position;
    });
    
    return dataPoint;
  }) || [];

  // Get unique team names for the chart
  const teamNames = standings?.map(s => s.team_name) || [];

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {t('standings.title')}
        </h1>
        <button
          onClick={() => setShowChart(!showChart)}
          className="btn btn-secondary text-sm"
        >
          {showChart ? t('standings.hideChart') : t('standings.showChart')}
        </button>
      </div>

      {showChart && chartData.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('standings.progressionChart')}
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="match" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  reversed
                  domain={[1, teamNames.length]}
                  ticks={Array.from({ length: teamNames.length }, (_, i) => i + 1)}
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  label={{ value: 'Position', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#f9fafb'
                  }}
                  labelStyle={{ color: '#f9fafb' }}
                />
                <Legend 
                  wrapperStyle={{ color: '#9ca3af' }}
                />
                {teamNames.map((teamName, index) => (
                  <Line
                    key={teamName}
                    type="monotone"
                    dataKey={teamName}
                    stroke={TEAM_COLORS[index % TEAM_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            {t('standings.chartDescription')}
          </p>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300">
                <span className="md:hidden">Pos</span>
                <span className="hidden md:inline">Position</span>
              </th>
              <th className="text-left py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300">{t('standings.team')}</th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300">
                <span className="md:hidden">{t('standings.matchesPlayed') || 'MP'}</span>
                <span className="hidden md:inline">{t('standings.matchesPlayedFull') || 'Matches Played'}</span>
              </th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300">
                <span className="md:hidden">{t('standings.gamesPlayed') || 'GP'}</span>
                <span className="hidden md:inline">{t('standings.gamesPlayedFull') || 'Games Played'}</span>
              </th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300">
                <span className="md:hidden">{t('standings.gamesWon') || 'GW'}</span>
                <span className="hidden md:inline">{t('standings.gamesWonFull') || 'Games Won'}</span>
              </th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300">
                <span className="md:hidden">{t('standings.sets') || 'Sets'}</span>
                <span className="hidden md:inline">{t('standings.setsFormat') || 'Sets (Won - Lost)'}</span>
              </th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300 font-bold">
                <span className="md:hidden">{t('standings.points') || 'Pts'}</span>
                <span className="hidden md:inline">{t('standings.pointsFormat') || 'Points (Won - Lost)'}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {standings?.map((standing, index) => {
              return (
                <tr
                  key={standing.team_id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-2 md:py-3 px-2 md:px-4 text-gray-900 dark:text-white font-medium">
                    {index + 1}
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-gray-900 dark:text-white font-medium">
                    {standing.team_name}
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-700 dark:text-gray-300">
                    {standing.matches_played || 0}
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-700 dark:text-gray-300">
                    {standing.games_played || 0}
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center text-green-600 dark:text-green-400">
                    {standing.games_won || 0}
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-900 dark:text-white">
                    {standing.sets_won || 0} - {standing.sets_lost || 0}
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-900 dark:text-white font-bold">
                    {standing.points_won || 0} - {standing.points_lost || 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(!standings || standings.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('statistics.noData')}
          </div>
        )}
      </div>
    </div>
  );
}
