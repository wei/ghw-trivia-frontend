import React, { useEffect, useState, useCallback, useRef } from 'react';
import { triviaApi, QuestionResponse, AnswerResponse, LeaderboardEntry } from './api/triviaApi';
import { UsernameInput } from './components/UsernameInput';
import { QuestionCard } from './components/QuestionCard';
import { Leaderboard } from './components/Leaderboard';
import { AdminPanel } from './components/AdminPanel';
import { triggerConfetti } from './utils/confetti';
import './index.css';

function App() {
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem('triviaUsername')
  );
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<AnswerResponse | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const leaderboardIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch current question
  const fetchQuestion = useCallback(async () => {
    try {
      const data = await triviaApi.getQuestion();
      
      // Check if question has changed (new session)
      if (
        data.question &&
        currentQuestion &&
        data.question !== currentQuestion.question &&
        data.session_id !== currentQuestion.session_id
      ) {
        setHasAnswered(false);
        setLastResult(null);
      }
      
      setCurrentQuestion(data);
    } catch (error) {
      console.error('Failed to fetch question:', error);
    }
  }, [currentQuestion]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await triviaApi.getLeaderboard(10, 0);
      
      // Check if current user got a new score
      if (username) {
        const userEntry = data.leaderboard.find((entry) => entry.username === username);
        if (userEntry && lastScore !== null && userEntry.score > lastScore) {
          triggerConfetti();
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        if (userEntry) {
          setLastScore(userEntry.score);
        }
      }
      
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  }, [username, lastScore]);

  // Submit answer
  const handleSubmitAnswer = useCallback(
    async (answer: string): Promise<AnswerResponse> => {
      if (!username) throw new Error('Username not set');
      
      setLoading(true);
      try {
        const result = await triviaApi.submitAnswer(username, answer);
        setLastResult(result);
        setHasAnswered(true);

        if (result.is_correct && result.score !== undefined && result.score !== null) {
          setLastScore(result.score);
          triggerConfetti();
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }

        // Refresh leaderboard after answer
        await fetchLeaderboard();

        return result;
      } finally {
        setLoading(false);
      }
    },
    [username, fetchLeaderboard]
  );

  // Admin functions
  const handleStartSession = useCallback(
    async (question: string, answer: string, apiKey: string) => {
      try {
        await triviaApi.startSession(question, answer, apiKey);
        await fetchQuestion();
        setHasAnswered(false);
        setLastResult(null);
      } catch (error) {
        console.error('Failed to start session:', error);
        throw error;
      }
    },
    [fetchQuestion]
  );

  const handleEndSession = useCallback(async (apiKey: string) => {
    try {
      const result = await triviaApi.endSession(apiKey);
      console.log('Session ended:', result);
      await fetchQuestion();
    } catch (error) {
      console.error('Failed to end session:', error);
      throw error;
    }
  }, [fetchQuestion]);

  // Set up polling
  useEffect(() => {
    if (!username) return;

    // Initial fetch
    fetchQuestion();
    fetchLeaderboard();

    // Poll question every 2 seconds
    pollIntervalRef.current = setInterval(fetchQuestion, 2000);

    // Poll leaderboard every 3 seconds
    leaderboardIntervalRef.current = setInterval(fetchLeaderboard, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (leaderboardIntervalRef.current) clearInterval(leaderboardIntervalRef.current);
    };
  }, [username, fetchQuestion, fetchLeaderboard]);

  // Handle username set
  const handleUsernameSet = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem('triviaUsername', newUsername);
    setLastScore(null);
    setLastResult(null);
    setHasAnswered(false);
  };

  // Clear username
  const handleLogout = () => {
    setUsername(null);
    localStorage.removeItem('triviaUsername');
    setLastScore(null);
    setLastResult(null);
    setHasAnswered(false);
  };

  if (!username) {
    return <UsernameInput onUsernameSet={handleUsernameSet} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🧠 Trivia Challenge</h1>
            <p className="text-gray-600">Playing as: <span className="font-semibold">{username}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Card */}
        <div className="lg:col-span-2">
          <QuestionCard
            question={currentQuestion?.question || ''}
            isLoading={loading || !currentQuestion}
            onSubmit={handleSubmitAnswer}
            lastResult={lastResult}
            isAnswered={hasAnswered}
          />
        </div>

        {/* Leaderboard */}
        <div>
          <Leaderboard
            entries={leaderboard}
            isLoading={false}
            currentUsername={username}
          />
        </div>
      </div>

      {/* Admin Panel */}
      <AdminPanel
        onStartSession={handleStartSession}
        onEndSession={handleEndSession}
        isLoading={loading}
      />

      {/* Confetti trigger */}
      {showConfetti && <div className="confetti-trigger" />}
    </div>
  );
}

export default App;
