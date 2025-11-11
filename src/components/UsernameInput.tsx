import React, { useState } from 'react';

interface UsernameInputProps {
  onUsernameSet: (username: string) => void;
}

export const UsernameInput: React.FC<UsernameInputProps> = ({ onUsernameSet }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length > 100) {
      setError('Username must be 100 characters or less');
      return;
    }

    onUsernameSet(username.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Trivia Challenge</h1>
        <p className="text-gray-600 mb-6">Enter your username to get started</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Your username..."
              maxLength={100}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            Start Playing
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Your username will be used for scoring and leaderboard rankings
        </p>
      </div>
    </div>
  );
};
