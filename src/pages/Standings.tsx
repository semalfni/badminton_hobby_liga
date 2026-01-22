import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import type { Standing } from '../types';

export default function Standings() {
  const { t } = useTranslation();
  const { data: standings, isLoading } = useQuery<Standing[]>({
    queryKey: ['standings'],
    queryFn: api.getStandings,
  });

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {t('standings.title')}
      </h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300">
                <span className="md:hidden">Pos</span>
                <span className="hidden md:inline">Position</span>
              </th>
              <th className="text-left py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300">{t('standings.team')}</th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                <span className="md:hidden">{t('standings.played')}</span>
                <span className="hidden md:inline">{t('standings.playedFull') || 'Played'}</span>
              </th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300">
                <span className="md:hidden">{t('standings.wins')}</span>
                <span className="hidden md:inline">{t('standings.winsFull') || 'Wins'}</span>
              </th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300">
                <span className="md:hidden">{t('standings.losses')}</span>
                <span className="hidden md:inline">{t('standings.lossesFull') || 'Losses'}</span>
              </th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300 hidden md:table-cell">
                <span className="md:hidden">G+</span>
                <span className="hidden md:inline">{t('standings.gamesWonFull') || 'Games Won'}</span>
              </th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300 hidden md:table-cell">
                <span className="md:hidden">G-</span>
                <span className="hidden md:inline">{t('standings.gamesLostFull') || 'Games Lost'}</span>
              </th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                <span className="md:hidden">{t('standings.pairsDiff')}</span>
                <span className="hidden md:inline">{t('standings.pairsDiffFull') || 'Difference'}</span>
              </th>
              <th className="text-center py-2 md:py-3 px-2 md:px-4 text-gray-700 dark:text-gray-300 font-bold">{t('standings.points')}</th>
            </tr>
          </thead>
          <tbody>
            {standings?.map((standing, index) => {
              const gamesWon = standing.games_won || 0;
              const gamesLost = standing.games_lost || 0;
              const diff = gamesWon - gamesLost;
              
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
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                    {standing.played || 0}
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center text-green-600 dark:text-green-400">
                    {standing.won || 0}
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center text-red-600 dark:text-red-400">
                    {standing.lost || 0}
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-700 dark:text-gray-300 hidden md:table-cell">
                    {gamesWon}
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-700 dark:text-gray-300 hidden md:table-cell">
                    {gamesLost}
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                    {diff > 0 ? '+' : ''}{diff}
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-900 dark:text-white font-bold">
                    {standing.points || 0}
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
