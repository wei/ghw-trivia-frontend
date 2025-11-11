import React, { useState } from 'react';
import { AnswerResponse } from '../api/triviaApi';

interface QuestionCardProps {
  question: string;
  isLoading: boolean;
  onSubmit: (answer: string) => Promise<AnswerResponse>;
  lastResult?: AnswerResponse | null;
  isAnswered: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isLoading,
  onSubmit,
  lastResult,
  isAnswered,
}) => {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localResult, setLocalResult] = useState<AnswerResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    try {
      const result = await onSubmit(answer);
      setLocalResult(result);
      setAnswer('');
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const result = localResult || lastResult;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 text-lg">No active trivia session. Wait for the admin to start one!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{question}</h2>
        
        {result && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              result.is_correct
                ? 'bg-green-50 border-2 border-green-300'
                : 'bg-red-50 border-2 border-red-300'
            }`}
          >
            <p
              className={`font-semibold text-lg ${
                result.is_correct ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {result.message}
            </p>
            {result.is_correct && result.score !== undefined && result.score !== null && (
              <p className="text-green-600 mt-2">🎉 Score: {result.score}</p>
            )}
          </div>
        )}

        {isAnswered && !result && (
          <div className="p-4 rounded-lg bg-yellow-50 border-2 border-yellow-300 mb-6">
            <p className="text-yellow-700 font-semibold">Waiting for next question...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            disabled={submitting || isAnswered}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          disabled={!answer.trim() || submitting || isAnswered}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
        >
          {submitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
};
