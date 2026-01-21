import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { Standing } from '../types';

export default function Standings() {
  const { data: standings, isLoading } = useQuery<Standing[]>({
    queryKey: ['standings'],
    queryFn: api.getStandings,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        League Standings
      </h1>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Pos</th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Team</th>
              <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Played</th>
              <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Won</th>
              <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Lost</th>
              <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Games +</th>
              <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Games -</th>
              <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Diff</th>
              <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300 font-bold">Points</th>
            </tr>
          </thead>
          <tbody>
            {standings?.map((standing, index) => (
              <tr
                key={standing.team_id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                  {index + 1}
                </td>
                <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                  {standing.team_name}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                  {standing.played}
                </td>
                <td className="py-3 px-4 text-center text-green-600 dark:text-green-400">
                  {standing.won}
                </td>
                <td className="py-3 px-4 text-center text-red-600 dark:text-red-400">
                  {standing.lost}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                  {standing.games_won}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                  {standing.games_lost}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                  {standing.games_won - standing.games_lost > 0 ? '+' : ''}
                  {standing.games_won - standing.games_lost}
                </td>
                <td className="py-3 px-4 text-center text-gray-900 dark:text-white font-bold text-lg">
                  {standing.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!standings || standings.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No standings yet. Complete some matches to see the standings.
          </div>
        )}
      </div>
    </div>
  );
}
