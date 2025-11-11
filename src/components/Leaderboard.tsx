import React from 'react';
import { LeaderboardEntry } from '../api/triviaApi';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  currentUsername?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  isLoading,
  currentUsername,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Leaderboard</h2>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-gray-600 py-8">No scores yet. Be the first to answer!</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const isCurrentUser = currentUsername && entry.username === currentUsername;
            const getMedalEmoji = (rank: number) => {
              switch (rank) {
                case 1:
                  return '🥇';
                case 2:
                  return '🥈';
                case 3:
                  return '🥉';
                default:
                  return `${rank}.`;
              }
            };

            return (
              <div
                key={entry.username}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  isCurrentUser
                    ? 'bg-blue-100 border-2 border-blue-400'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-2xl font-bold w-8">
                    {getMedalEmoji(entry.rank)}
                  </span>
                  <div className="flex-1">
                    <p className={`font-semibold ${isCurrentUser ? 'text-blue-700' : 'text-gray-800'}`}>
                      {entry.username}
                      {isCurrentUser && ' (You)'}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-xl font-bold ${
                    isCurrentUser ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {entry.score} pts
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
