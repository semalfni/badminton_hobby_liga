import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

interface PlayerStatistics {
  id: number;
  name: string;
  team_id: number;
  team_name: string;
  games_played: number;
  games_won: number;
  games_lost: number;
  total_points: number;
  avg_points: string;
}

function Statistics() {
  const { data: statistics, isLoading } = useQuery<PlayerStatistics[]>({
    queryKey: ['player-statistics'],
    queryFn: api.getPlayerStatistics,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Player Statistics</h1>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Games Played
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Games Won
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Games Lost
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Points
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Avg Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {statistics?.map((stat, index) => {
                const winRate = stat.games_played > 0 
                  ? ((stat.games_won / stat.games_played) * 100).toFixed(1) 
                  : '0.0';
                
                return (
                  <tr key={stat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                        {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                        {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          #{index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {stat.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {stat.team_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {stat.games_played}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {stat.games_won}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                        {stat.games_lost}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {winRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {stat.total_points}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900 dark:text-white">
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
              No player statistics available yet
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-blue-50 dark:bg-blue-900/20">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            🏆 Most Points
          </h3>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {statistics?.[0]?.name || 'N/A'}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-500">
            {statistics?.[0]?.total_points || 0} points
          </div>
        </div>

        <div className="card bg-green-50 dark:bg-green-900/20">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-2">
            🎯 Best Win Rate
          </h3>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {statistics && statistics.length > 0 
              ? [...statistics]
                  .filter(s => s.games_played >= 3) // Minimum 3 games
                  .sort((a, b) => (b.games_won / b.games_played) - (a.games_won / a.games_played))[0]?.name || 'N/A'
              : 'N/A'
            }
          </div>
          <div className="text-sm text-green-700 dark:text-green-500">
            {statistics && statistics.length > 0 
              ? (() => {
                  const topPlayer = [...statistics]
                    .filter(s => s.games_played >= 3)
                    .sort((a, b) => (b.games_won / b.games_played) - (a.games_won / a.games_played))[0];
                  return topPlayer 
                    ? `${((topPlayer.games_won / topPlayer.games_played) * 100).toFixed(1)}%`
                    : '0%';
                })()
              : '0%'
            }
          </div>
        </div>

        <div className="card bg-purple-50 dark:bg-purple-900/20">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">
            ⚡ Most Active
          </h3>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {statistics && statistics.length > 0 
              ? [...statistics].sort((a, b) => b.games_played - a.games_played)[0]?.name || 'N/A'
              : 'N/A'
            }
          </div>
          <div className="text-sm text-purple-700 dark:text-purple-500">
            {statistics && statistics.length > 0 
              ? `${[...statistics].sort((a, b) => b.games_played - a.games_played)[0]?.games_played || 0} games`
              : '0 games'
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
