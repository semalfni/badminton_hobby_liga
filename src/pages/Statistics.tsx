import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../api';

interface PlayerStatistics {
  id: number;
  name: string;
  team_id: number;
  team_name: string;
  games_played: number;
  games_won: number;
  sets_won: number;
  sets_lost: number;
  total_points: number;
  avg_points: string;
}

function Statistics() {
  const { t } = useTranslation();
  const { data: statistics, isLoading } = useQuery<PlayerStatistics[]>({
    queryKey: ['player-statistics'],
    queryFn: api.getPlayerStatistics,
  });

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">{t('statistics.title')}</h1>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs md:text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('statistics.rank')}
                </th>
                <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('statistics.player')}
                </th>
                <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                  {t('statistics.team')}
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  <span className="hidden lg:inline">{t('statistics.gamesPlayed')}</span>
                  <span className="lg:hidden">GP</span>
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  <span className="hidden lg:inline">{t('statistics.gamesWon')}</span>
                  <span className="lg:hidden">GW</span>
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('statistics.sets')}
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <span className="hidden sm:inline">{t('statistics.winRate')}</span>
                  <span className="sm:hidden">WR%</span>
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <span className="hidden sm:inline">{t('statistics.totalPoints')}</span>
                  <span className="sm:hidden">Pts</span>
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                  {t('statistics.avgPoints')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {statistics?.map((stat, index) => {
                const setsPlayed = stat.sets_won + stat.sets_lost;
                const winRate = setsPlayed > 0 
                  ? ((stat.sets_won / setsPlayed) * 100).toFixed(1) 
                  : '0.0';
                
                return (
                  <tr key={stat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && <span className="text-lg md:text-2xl mr-1 md:mr-2">🥇</span>}
                        {index === 1 && <span className="text-lg md:text-2xl mr-1 md:mr-2">🥈</span>}
                        {index === 2 && <span className="text-lg md:text-2xl mr-1 md:mr-2">🥉</span>}
                        <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                          #{index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4">
                      <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                        {stat.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                        {stat.team_name}
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        {stat.team_name}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-4 whitespace-nowrap text-center hidden md:table-cell">
                      <div className="text-xs md:text-sm text-gray-900 dark:text-white">
                        {stat.games_played}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-4 whitespace-nowrap text-center hidden md:table-cell">
                      <div className="text-xs md:text-sm text-green-600 dark:text-green-400 font-medium">
                        {stat.games_won}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-4 whitespace-nowrap text-center">
                      <div className="text-xs md:text-sm text-gray-900 dark:text-white">
                        {stat.sets_won} - {stat.sets_lost}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-4 whitespace-nowrap text-center">
                      <div className="text-xs md:text-sm text-gray-900 dark:text-white">
                        {winRate}%
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-4 whitespace-nowrap text-center">
                      <div className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400">
                        {stat.total_points}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-4 whitespace-nowrap text-center hidden lg:table-cell">
                      <div className="text-xs md:text-sm text-gray-900 dark:text-white">
                        {stat.avg_points}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {statistics && statistics.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('statistics.noData')}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="card bg-blue-50 dark:bg-blue-900/20">
          <h3 className="text-base md:text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            {t('statistics.mostPoints')}
          </h3>
          <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
            {statistics?.[0]?.name || 'N/A'}
          </div>
          <div className="text-xs md:text-sm text-blue-700 dark:text-blue-500">
            {statistics?.[0]?.total_points || 0} {t('statistics.points')}
          </div>
        </div>

        <div className="card bg-green-50 dark:bg-green-900/20">
          <h3 className="text-base md:text-lg font-semibold text-green-900 dark:text-green-300 mb-2">
            {t('statistics.bestWinRate')}
          </h3>
          <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 truncate">
            {statistics && statistics.length > 0 
              ? [...statistics]
                  .filter(s => (s.sets_won + s.sets_lost) >= 6) // Minimum 6 sets played
                  .sort((a, b) => {
                    const aTotal = a.sets_won + a.sets_lost;
                    const bTotal = b.sets_won + b.sets_lost;
                    return (b.sets_won / bTotal) - (a.sets_won / aTotal);
                  })[0]?.name || 'N/A'
              : 'N/A'
            }
          </div>
          <div className="text-xs md:text-sm text-green-700 dark:text-green-500">
            {statistics && statistics.length > 0 
              ? (() => {
                  const topPlayer = [...statistics]
                    .filter(s => (s.sets_won + s.sets_lost) >= 6)
                    .sort((a, b) => {
                      const aTotal = a.sets_won + a.sets_lost;
                      const bTotal = b.sets_won + b.sets_lost;
                      return (b.sets_won / bTotal) - (a.sets_won / aTotal);
                    })[0];
                  if (!topPlayer) return '0%';
                  const total = topPlayer.sets_won + topPlayer.sets_lost;
                  return `${((topPlayer.sets_won / total) * 100).toFixed(1)}%`;
                })()
              : '0%'
            }
          </div>
        </div>

        <div className="card bg-purple-50 dark:bg-purple-900/20">
          <h3 className="text-base md:text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">
            {t('statistics.mostActive')}
          </h3>
          <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">
            {statistics && statistics.length > 0 
              ? [...statistics].sort((a, b) => b.games_played - a.games_played)[0]?.name || 'N/A'
              : 'N/A'
            }
          </div>
          <div className="text-xs md:text-sm text-purple-700 dark:text-purple-500">
            {statistics && statistics.length > 0 
              ? `${[...statistics].sort((a, b) => b.games_played - a.games_played)[0]?.games_played || 0} ${t('statistics.games')}`
              : `0 ${t('statistics.games')}`
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
