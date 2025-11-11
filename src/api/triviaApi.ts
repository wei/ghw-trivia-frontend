import axios from 'axios';

const API_BASE_URL = 'http://ghw-trivia.duckdns.org:8000';

export interface SessionStartRequest {
  question: string;
  correct_answer: string;
}

export interface SessionStartResponse {
  status: string;
  session_id: string;
  message: string;
  question: string;
}

export interface QuestionResponse {
  status: string;
  question: string | null;
  session_id: string | null;
  is_active: boolean | null;
  correct_answer: string | null;
}

export interface AnswerSubmitRequest {
  username: string;
  answer: string;
}

export interface AnswerResponse {
  status: string;
  is_correct: boolean;
  message: string;
  score?: number | null;
}

export interface AttemptRecord {
  username: string;
  is_correct: boolean;
  timestamp: string;
}

export interface AttemptsResponse {
  status: string;
  attempts: AttemptRecord[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

export interface LeaderboardResponse {
  status: string;
  leaderboard: LeaderboardEntry[];
}

export interface SessionEndResponse {
  status: string;
  message: string;
  correct_answer: string;
  successful_attempts: string[];
}

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const triviaApi = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Get current question
  getQuestion: async (): Promise<QuestionResponse> => {
    const response = await client.get('/api/trivia/question');
    return response.data;
  },

  // Submit answer
  submitAnswer: async (username: string, answer: string): Promise<AnswerResponse> => {
    const response = await client.post('/api/trivia/answer', {
      username,
      answer,
    });
    return response.data;
  },

  // Get all attempts
  getAllAttempts: async (): Promise<AttemptsResponse> => {
    const response = await client.get('/api/trivia/attempts');
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (limit: number = 10, offset: number = 0): Promise<LeaderboardResponse> => {
    const response = await client.get('/api/trivia/leaderboard', {
      params: { limit, offset },
    });
    return response.data;
  },

  // Admin: Start session
  startSession: async (question: string, correctAnswer: string, apiKey: string): Promise<SessionStartResponse> => {
    const response = await client.post(
      '/api/trivia/session/start',
      {
        question,
        correct_answer: correctAnswer,
      },
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    );
    return response.data;
  },

  // Admin: End session
  endSession: async (apiKey: string): Promise<SessionEndResponse> => {
    const response = await client.post(
      '/api/trivia/session/end',
      {},
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    );
    return response.data;
  },
};
