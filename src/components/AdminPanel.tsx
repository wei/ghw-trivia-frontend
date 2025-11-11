import React from 'react';

interface AdminPanelProps {
  onStartSession: (question: string, answer: string, apiKey: string) => Promise<void>;
  onEndSession: (apiKey: string) => Promise<void>;
  isLoading: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onStartSession,
  onEndSession,
  isLoading,
}) => {
  const [showPanel, setShowPanel] = React.useState(false);
  const [apiKey, setApiKey] = React.useState('');
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim() || !question.trim() || !answer.trim()) {
      setError('All fields are required');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await onStartSession(question, answer, apiKey);
      setSuccess('Session started successfully!');
      setQuestion('');
      setAnswer('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to start session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndSession = async () => {
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await onEndSession(apiKey);
      setSuccess('Session ended successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to end session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors duration-200"
      >
        ⚙️ Admin
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-6 w-96 max-h-96 overflow-y-auto border-2 border-purple-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Admin Panel</h3>
        <button
          onClick={() => setShowPanel(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-3 py-2 rounded mb-4 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleStartSession} className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Admin API key"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter trivia question"
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Answer
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Correct answer"
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded text-sm transition-colors duration-200"
        >
          {isSubmitting ? 'Starting...' : 'Start Session'}
        </button>
      </form>

      <button
        onClick={handleEndSession}
        disabled={isSubmitting || isLoading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded text-sm transition-colors duration-200"
      >
        {isSubmitting ? 'Ending...' : 'End Session'}
      </button>
    </div>
  );
};
