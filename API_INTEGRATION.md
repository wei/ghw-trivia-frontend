# API Integration Guide

## Overview

This frontend connects to the Trivia API at `http://ghw-trivia.duckdns.org:8000/` to provide a complete trivia experience.

## API Client

All API interactions go through `src/api/triviaApi.ts` which provides a type-safe interface to the backend.

### Configuration

```typescript
// src/api/triviaApi.ts
const API_BASE_URL = 'http://ghw-trivia.duckdns.org:8000';
```

To use a different endpoint, update this value.

## Endpoints Reference

### 1. Health Check

**Endpoint**: `GET /health`

**Purpose**: Verify API is online

**Usage**:
```typescript
const health = await triviaApi.healthCheck();
```

**Response**:
```json
{
  "status": "ok"
}
```

---

### 2. Get Current Question

**Endpoint**: `GET /api/trivia/question`

**Purpose**: Retrieve the active trivia question

**Usage**:
```typescript
const question = await triviaApi.getQuestion();
```

**Response (Active Session)**:
```json
{
  "status": "success",
  "question": "What is the capital of France?",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "is_active": true,
  "correct_answer": null
}
```

**Response (Ended Session)**:
```json
{
  "status": "success",
  "question": "What is the capital of France?",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "is_active": false,
  "correct_answer": "Paris"
}
```

**Response (No Session)**:
```json
{
  "status": "success",
  "question": null,
  "session_id": null,
  "is_active": null,
  "correct_answer": null
}
```

---

### 3. Submit Answer

**Endpoint**: `POST /api/trivia/answer`

**Purpose**: Submit a player's answer to the current question

**Usage**:
```typescript
const result = await triviaApi.submitAnswer('john_doe', 'Paris');
```

**Request Body**:
```json
{
  "username": "john_doe",
  "answer": "Paris"
}
```

**Response (Correct)**:
```json
{
  "status": "success",
  "is_correct": true,
  "message": "Correct!",
  "score": 5
}
```

**Response (Incorrect)**:
```json
{
  "status": "success",
  "is_correct": false,
  "message": "Incorrect!",
  "score": null
}
```

**Notes**:
- Answer matching is case-insensitive (handled by API)
- Each user can only answer once per session
- Score only provided on correct answers

---

### 4. Get Leaderboard

**Endpoint**: `GET /api/trivia/leaderboard?limit=10&offset=0`

**Purpose**: Retrieve ranked list of top scorers

**Usage**:
```typescript
const leaderboard = await triviaApi.getLeaderboard(10, 0);
```

**Query Parameters**:
- `limit` (1-100, default: 10) - Number of results
- `offset` (default: 0) - Number of results to skip (pagination)

**Response**:
```json
{
  "status": "success",
  "leaderboard": [
    {
      "rank": 1,
      "username": "john_doe",
      "score": 5
    },
    {
      "rank": 2,
      "username": "alice_smith",
      "score": 3
    },
    {
      "rank": 3,
      "username": "bob_jones",
      "score": 0
    }
  ]
}
```

**Ranking Rules**:
- Primary: Score (descending)
- Secondary Tiebreaker: Earliest score acquisition time (ascending)

---

### 5. Get All Attempts

**Endpoint**: `GET /api/trivia/attempts`

**Purpose**: Retrieve complete history of all answer attempts

**Usage**:
```typescript
const attempts = await triviaApi.getAllAttempts();
```

**Response**:
```json
{
  "status": "success",
  "attempts": [
    {
      "username": "jane_smith",
      "is_correct": false,
      "timestamp": "2025-11-11T14:31:20Z"
    },
    {
      "username": "john_doe",
      "is_correct": true,
      "timestamp": "2025-11-11T14:30:45Z"
    }
  ]
}
```

**Notes**:
- Ordered chronologically (most recent first)
- ISO 8601 UTC timestamps
- Full audit trail of all attempts

---

### 6. Start Session (Admin)

**Endpoint**: `POST /api/trivia/session/start`

**Purpose**: Create a new trivia session (requires API key)

**Usage**:
```typescript
const session = await triviaApi.startSession(
  'What is the capital of France?',
  'Paris',
  'your-api-key'
);
```

**Request**:
- **Headers**: `x-api-key: your-api-key`
- **Body**:
```json
{
  "question": "What is the capital of France?",
  "correct_answer": "Paris"
}
```

**Validation**:
- Question: 1-500 characters
- Answer: 1-200 characters
- API key: Required (via header)

**Response**:
```json
{
  "status": "success",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Trivia session started",
  "question": "What is the capital of France?"
}
```

---

### 7. End Session (Admin)

**Endpoint**: `POST /api/trivia/session/end`

**Purpose**: End the current session and reveal the answer (requires API key)

**Usage**:
```typescript
const result = await triviaApi.endSession('your-api-key');
```

**Request**:
- **Headers**: `x-api-key: your-api-key`
- **Body**: `{}` (empty)

**Response**:
```json
{
  "status": "success",
  "message": "Trivia session ended",
  "correct_answer": "Paris",
  "successful_attempts": ["john_doe", "alice_smith"]
}
```

---

## Error Handling

### HTTP Error Codes

| Code | Scenario | Handling |
|------|----------|----------|
| 200 | Success | Process response normally |
| 422 | Validation Error | Display validation error to user |
| 401 | Auth Error | Wrong API key (admin) |
| 500 | Server Error | Retry or notify user |

### Example Error Response

```json
{
  "status": "error",
  "message": "Invalid API key"
}
```

### Frontend Error Handling

The app catches all API errors and:
1. Logs to console for debugging
2. Shows user-friendly messages
3. Continues functioning (graceful degradation)
4. Retries on timeout (with exponential backoff)

---

## Data Types

### TypeScript Interfaces

```typescript
// Question Response
interface QuestionResponse {
  status: string;
  question: string | null;
  session_id: string | null;
  is_active: boolean | null;
  correct_answer: string | null;
}

// Answer Response
interface AnswerResponse {
  status: string;
  is_correct: boolean;
  message: string;
  score?: number | null;
}

// Leaderboard Entry
interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

// Attempt Record
interface AttemptRecord {
  username: string;
  is_correct: boolean;
  timestamp: string; // ISO 8601
}
```

---

## Polling Strategy

The app uses intelligent polling to stay synchronized with the API:

### Question Polling
- **Interval**: Every 2 seconds
- **Purpose**: Get latest question and detect new sessions
- **Logic**: Compares `session_id` to detect changes
- **Benefit**: Players always have the current question

### Leaderboard Polling
- **Interval**: Every 3 seconds
- **Purpose**: Keep scores up-to-date
- **Logic**: Replaces entire leaderboard on each poll
- **Benefit**: Real-time ranking updates

### Configuration

To adjust polling intervals, edit `src/App.tsx`:

```typescript
// Question polling every 2 seconds
pollIntervalRef.current = setInterval(fetchQuestion, 2000);

// Leaderboard polling every 3 seconds
leaderboardIntervalRef.current = setInterval(fetchLeaderboard, 3000);
```

---

## Concurrent Users

The API supports 100+ concurrent users:
- Each user maintains independent session
- Questions are shared across all users
- Scores are individual and ranked
- No rate limiting on public endpoints

---

## Rate Limiting Considerations

- **Public endpoints**: No rate limiting (question, attempts, leaderboard)
- **Admin endpoints**: Protected by API key
- **Answer submission**: 1 answer per user per session

---

## CORS Configuration

The API allows CORS from any origin:
- ✅ Browser requests work without proxy
- ✅ No CORS errors in development
- ✅ No production CORS issues

---

## Authentication

### Public Endpoints
- No authentication required
- Available to all users

### Admin Endpoints
- Require `x-api-key` header
- Get API key from administrator
- Never expose in client-side code

---

## Timeout Configuration

The HTTP client has a 10-second timeout:
```typescript
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
});
```

If requests timeout, an error is thrown and caught by the UI.

---

## Testing the API

### Using cURL

```bash
# Health check
curl http://ghw-trivia.duckdns.org:8000/health

# Get question
curl http://ghw-trivia.duckdns.org:8000/api/trivia/question

# Submit answer
curl -X POST http://ghw-trivia.duckdns.org:8000/api/trivia/answer \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","answer":"Paris"}'

# Get leaderboard
curl http://ghw-trivia.duckdns.org:8000/api/trivia/leaderboard?limit=10

# Start session (requires API key)
curl -X POST http://ghw-trivia.duckdns.org:8000/api/trivia/session/start \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"question":"What is 2+2?","correct_answer":"4"}'
```

### Using the Frontend

The admin panel provides a UI for testing:
1. Click "⚙️ Admin" button
2. Enter API key
3. Enter question and answer
4. Click "Start Session"
5. Try answering on the main screen
6. Click "End Session" to reveal answer

---

## Frontend Usage Examples

### Fetching and Displaying a Question

```typescript
try {
  const questionData = await triviaApi.getQuestion();
  if (questionData.question) {
    console.log('Current question:', questionData.question);
  } else {
    console.log('No active question');
  }
} catch (error) {
  console.error('Failed to fetch question:', error);
}
```

### Submitting an Answer

```typescript
try {
  const result = await triviaApi.submitAnswer('player_name', 'my_answer');
  
  if (result.is_correct) {
    console.log('Correct! Score:', result.score);
    triggerConfetti(); // Celebrate!
  } else {
    console.log('Incorrect:', result.message);
  }
} catch (error) {
  console.error('Failed to submit answer:', error);
}
```

### Fetching the Leaderboard

```typescript
try {
  const boardData = await triviaApi.getLeaderboard(10, 0);
  
  boardData.leaderboard.forEach(entry => {
    console.log(`${entry.rank}. ${entry.username}: ${entry.score} pts`);
  });
} catch (error) {
  console.error('Failed to fetch leaderboard:', error);
}
```

---

## Troubleshooting

### API Connection Issues

**Problem**: Cannot connect to API
**Solutions**:
1. Check API is online: `curl http://ghw-trivia.duckdns.org:8000/health`
2. Check API URL in `src/api/triviaApi.ts`
3. Check browser network tab for CORS errors
4. Check API server logs

### Authentication Issues

**Problem**: Admin endpoints return 401
**Solutions**:
1. Verify API key is correct
2. Check API key is in `x-api-key` header (not `Authorization`)
3. Request new API key from administrator

### Data Not Updating

**Problem**: Questions or leaderboard not refreshing
**Solutions**:
1. Check polling intervals in `src/App.tsx`
2. Check API responses in network tab
3. Restart dev server: `npm run dev`

---

## Support

For API issues, check:
- API documentation at http://ghw-trivia.duckdns.org:8000/docs
- API server logs
- Browser console for errors

For frontend issues, check:
- Browser console
- Network tab
- React DevTools
