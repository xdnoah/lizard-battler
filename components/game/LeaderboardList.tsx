'use client';

interface LeaderboardEntry {
  id: string;
  name: string;
  level: number;
  rating: number;
  wins: number;
  losses: number;
  current_win_streak: number;
  players: {
    username: string;
  };
}

interface LeaderboardListProps {
  leaderboard: LeaderboardEntry[];
  myLizardId: string;
}

export default function LeaderboardList({
  leaderboard,
  myLizardId,
}: LeaderboardListProps) {
  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Rankings Yet</h3>
        <p className="text-gray-600">
          Be the first to battle and claim the top spot!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="divide-y divide-gray-100">
        {leaderboard.map((entry, index) => {
          const rank = index + 1;
          const medal = getMedalEmoji(rank);
          const isMe = entry.id === myLizardId;
          const winRate =
            entry.wins + entry.losses > 0
              ? Math.round((entry.wins / (entry.wins + entry.losses)) * 100)
              : 0;

          return (
            <div
              key={entry.id}
              className={`p-4 ${isMe ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'hover:bg-gray-50'} transition-colors`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  {medal ? (
                    <div className="text-3xl">{medal}</div>
                  ) : (
                    <div className="text-xl font-bold text-gray-600">#{rank}</div>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-lg truncate ${isMe ? 'text-yellow-700' : 'text-gray-800'}`}>
                      {entry.players.username}
                    </span>
                    {isMe && (
                      <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full font-semibold">
                        YOU
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>Lvl {entry.level}</span>
                    <span>•</span>
                    <span>{entry.wins}W / {entry.losses}L</span>
                    <span>•</span>
                    <span>{winRate}% WR</span>
                  </div>

                  {entry.current_win_streak >= 3 && (
                    <div className="text-xs text-orange-600 font-semibold mt-1">
                      🔥 {entry.current_win_streak}-Win Streak
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm text-gray-600">Rating</div>
                  <div className={`text-2xl font-bold ${rank <= 3 ? 'text-yellow-600' : 'text-blue-600'}`}>
                    {entry.rating}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
