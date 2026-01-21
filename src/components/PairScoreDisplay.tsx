// Helper component to calculate and display game scores
const PairScoreDisplay = ({ pair }: { pair: any }) => {
  const calculateWinner = () => {
    let homeGames = 0;
    let awayGames = 0;
    
    if (pair.game1_home_score > pair.game1_away_score) homeGames++;
    else if (pair.game1_away_score > pair.game1_home_score) awayGames++;
    
    if (pair.game2_home_score > pair.game2_away_score) homeGames++;
    else if (pair.game2_away_score > pair.game2_home_score) awayGames++;
    
    if (pair.game3_home_score > pair.game3_away_score) homeGames++;
    else if (pair.game3_away_score > pair.game3_home_score) awayGames++;
    
    return { homeGames, awayGames };
  };
  
  const { homeGames, awayGames } = calculateWinner();
  const totalHomePoints = (pair.game1_home_score || 0) + (pair.game2_home_score || 0) + (pair.game3_home_score || 0);
  const totalAwayPoints = (pair.game1_away_score || 0) + (pair.game2_away_score || 0) + (pair.game3_away_score || 0);
  
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <div className="text-right">
        <div className="text-gray-900 dark:text-white font-medium">
          {pair.home_player1_name || 'TBD'}
        </div>
        <div className="text-gray-900 dark:text-white font-medium">
          {pair.home_player2_name || 'TBD'}
        </div>
        <div className="mt-3">
          <div className="text-3xl font-bold text-blue-600">{homeGames}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">({totalHomePoints} pts)</div>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          {pair.game1_home_score}-{pair.game1_away_score}, {pair.game2_home_score}-{pair.game2_away_score}
          {(pair.game3_home_score > 0 || pair.game3_away_score > 0) && `, ${pair.game3_home_score}-${pair.game3_away_score}`}
        </div>
      </div>
      <div className="text-center text-gray-400 font-bold">VS</div>
      <div className="text-left">
        <div className="text-gray-900 dark:text-white font-medium">
          {pair.away_player1_name || 'TBD'}
        </div>
        <div className="text-gray-900 dark:text-white font-medium">
          {pair.away_player2_name || 'TBD'}
        </div>
        <div className="mt-3">
          <div className="text-3xl font-bold text-red-600">{awayGames}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">({totalAwayPoints} pts)</div>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          {pair.game1_away_score}-{pair.game1_home_score}, {pair.game2_away_score}-{pair.game2_home_score}
          {(pair.game3_home_score > 0 || pair.game3_away_score > 0) && `, ${pair.game3_away_score}-${pair.game3_home_score}`}
        </div>
      </div>
    </div>
  );
};

export { PairScoreDisplay };
