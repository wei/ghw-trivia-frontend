# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (Client)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   React Application                      │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │                    App.tsx                         │  │   │
│  │  │  • State Management                               │  │   │
│  │  │  • Polling Logic (2s & 3s intervals)              │  │   │
│  │  │  • Score Tracking & Confetti Trigger              │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │           ▲                    ▲                         │   │
│  │           │                    │                         │   │
│  │  ┌────────┴──────┐    ┌────────┴──────┐                 │   │
│  │  │  Components   │    │  API Client   │                 │   │
│  │  │  ┌──────────┐ │    │  ┌──────────┐ │                 │   │
│  │  │  │Question  │ │    │  │triviaApi │ │                 │   │
│  │  │  │Card      │ │    │  │  (Axios) │ │                 │   │
│  │  │  └──────────┘ │    │  └──────────┘ │                 │   │
│  │  │ ┌──────────┐  │    └────────────────┘                 │   │
│  │  │ │Leader   │  │           │                           │   │
│  │  │ │board    │  │           │ HTTP Requests             │   │
│  │  │ └──────────┘ │           │                           │   │
│  │  │ ┌──────────┐  │           │                           │   │
│  │  │ │Username  │  │           │                           │   │
│  │  │ │Input     │  │           │                           │   │
│  │  │ └──────────┘ │           │                           │   │
│  │  │ ┌──────────┐  │           │                           │   │
│  │  │ │Admin     │  │           │                           │   │
│  │  │ │Panel     │  │           │                           │   │
│  │  │ └──────────┘ │           │                           │   │
│  │  └───────────────┘           │                           │   │
│  │                              │                           │   │
│  │  Styling & Utils:            │                           │   │
│  │  • Tailwind CSS              │                           │   │
│  │  • Confetti Animation        │                           │   │
│  │  • LocalStorage              │                           │   │
│  └──────────────────────────────┼──────────────────────────┘   │
└─────────────────────────────────┼────────────────────────────────┘
                                  │
                                  │ HTTPS
                                  │
                   ┌──────────────▼────────────┐
                   │   Trivia API Server       │
                   │ (FastAPI Backend)         │
                   ├───────────────────────────┤
                   │ GET  /health              │
                   │ GET  /api/trivia/question │
                   │ POST /api/trivia/answer   │
                   │ GET  /api/trivia/attempts │
                   │ GET  /api/trivia/board    │
                   │ POST /api/trivia/session* │
                   │ POST /api/trivia/session* │
                   │ (* admin only)            │
                   └───────────────────────────┘
                                  │
                                  │
                   ┌──────────────▼────────────┐
                   │     Backend Database      │
                   │  (User Scores & Audit)    │
                   └───────────────────────────┘
```

---

## Component Hierarchy

```
App.tsx (Main Component)
│
├── UsernameInput
│   └── Modal for entering username
│
├── Layout Container
│   ├── Header
│   │   ├── App Title
│   │   ├── Current Username
│   │   └── Logout Button
│   │
│   └── Main Grid (2 columns on desktop, 1 on mobile)
│       ├── Column 1 (Left - 2/3 width on desktop)
│       │   └── QuestionCard
│       │       ├── Question Display
│       │       ├── Previous Result (if exists)
│       │       ├── Answer Input
│       │       └── Submit Button
│       │
│       └── Column 2 (Right - 1/3 width on desktop)
│           └── Leaderboard
│               ├── Title
│               ├── Loading State
│               └── List of Players
│                   └── LeaderboardEntry (repeated)
│                       ├── Rank/Medal
│                       ├── Username
│                       └── Score
│
└── FloatingComponents
    └── AdminPanel (Fixed bottom-right)
        ├── Toggle Button
        └── When Open:
            ├── API Key Input
            ├── Question Input
            ├── Answer Input
            ├── Start Session Button
            └── End Session Button
```

---

## Data Flow

### 1. Question Retrieval Flow

```
User Opens App
      │
      ▼
UsernameInput (Modal)
      │
      ▼ Username Stored
App Component Mounted
      │
      ▼ useEffect
Polling Starts (2s interval)
      │
      ▼ fetchQuestion()
triviaApi.getQuestion() (HTTP GET)
      │
      ▼
Backend API
      │
      ▼ Response
setCurrentQuestion() (State Update)
      │
      ▼
QuestionCard Re-renders
      │
      ▼
User Sees Question
```

### 2. Answer Submission Flow

```
User Types Answer
      │
      ▼
Clicks "Submit Answer"
      │
      ▼ handleSubmitAnswer()
triviaApi.submitAnswer(username, answer) (HTTP POST)
      │
      ▼
Backend API Validates & Scores
      │
      ▼
Response: { is_correct, message, score }
      │
      ├─ If Correct
      │  ├─ setLastScore()
      │  ├─ triggerConfetti()
      │  └─ setHasAnswered(true)
      │
      └─ If Incorrect
         └─ setHasAnswered(true)
      
      ▼
setLastResult() (State Update)
      │
      ▼ fetchLeaderboard()
triviaApi.getLeaderboard() (HTTP GET)
      │
      ▼
setLeaderboard() (State Update)
      │
      ▼
Components Re-render
      │
      ├─ QuestionCard Shows Result
      │  └─ Answer Input Disabled
      │
      └─ Leaderboard Updates
         └─ Shows Updated Score
```

### 3. Leaderboard Update Flow

```
Every 3 Seconds (useEffect Interval)
      │
      ▼
fetchLeaderboard()
      │
      ▼
triviaApi.getLeaderboard(10, 0) (HTTP GET)
      │
      ▼
Backend Returns Top 10 Scorers
      │
      ▼
Check If User Score Changed
      │
      ├─ If Score > lastScore
      │  └─ triggerConfetti()
      │
      └─ Update lastScore
      
      ▼
setLeaderboard() (State Update)
      │
      ▼
Leaderboard Component Re-renders
```

### 4. Admin Session Flow

```
Admin Clicks "⚙️ Admin"
      │
      ▼
AdminPanel Opens
      │
      ▼
Admin Enters:
├─ API Key
├─ Question
└─ Answer
      │
      ▼
Admin Clicks "Start Session"
      │
      ▼
triviaApi.startSession(q, a, apiKey) (HTTP POST)
      │
      ▼
Backend Creates Session
      │
      ▼
Response: { session_id, question }
      │
      ▼
Frontend Detects New Session
      │
      ▼
Reset Answer State
      │
      ├─ setHasAnswered(false)
      ├─ setLastResult(null)
      └─ setCurrentQuestion(newData)
      
      ▼
All Players See New Question
      │
      ├─ Can Type Answers
      ├─ Can Submit Answers
      └─ Leaderboard Updates
      
      ▼ [Later] Admin Clicks "End Session"
      │
      ▼
triviaApi.endSession(apiKey) (HTTP POST)
      │
      ▼
Backend Ends Session
      │
      ▼
Response: { correct_answer, successful_attempts }
      │
      ▼
Frontend Updates
      │
      ├─ currentQuestion.is_active = false
      ├─ currentQuestion.correct_answer = revealed
      └─ Answer Input Disabled
```

---

## State Management

### App.tsx State

```typescript
State Variables:
├── username: string | null
│   └── Stored in localStorage
│
├── currentQuestion: QuestionResponse | null
│   ├── question: string
│   ├── session_id: string
│   ├── is_active: boolean
│   └── correct_answer: string (only when session ends)
│
├── loading: boolean
│   └── True during fetch operations
│
├── leaderboard: LeaderboardEntry[]
│   └── Array of { rank, username, score }
│
├── lastScore: number | null
│   └── User's previous score (for confetti detection)
│
├── lastResult: AnswerResponse | null
│   ├── is_correct: boolean
│   ├── message: string
│   └── score: number | null
│
└── hasAnswered: boolean
    └── True after user submits answer for current session
```

### Component Local State

```
QuestionCard:
├── answer: string
├── submitting: boolean
└── localResult: AnswerResponse | null

UsernameInput:
├── username: string
└── error: string

AdminPanel:
├── showPanel: boolean
├── apiKey: string
├── question: string
├── answer: string
├── isSubmitting: boolean
├── error: string
└── success: string

Leaderboard:
└── (No local state, uses props only)
```

---

## Polling Strategy

### Question Polling (2 second interval)

```
setInterval(() => {
  fetchQuestion()
}, 2000)

fetchQuestion():
  1. Call API GET /api/trivia/question
  2. Compare session_id with previous
  3. If different:
     - New session detected
     - Reset hasAnswered = false
     - Reset lastResult = null
  4. Update currentQuestion state
```

### Leaderboard Polling (3 second interval)

```
setInterval(() => {
  fetchLeaderboard()
}, 3000)

fetchLeaderboard():
  1. Call API GET /api/trivia/leaderboard
  2. Find current user's entry
  3. Compare score with lastScore
  4. If higher:
     - Trigger confetti
     - Show celebration
  5. Update leaderboard state
```

### Cleanup on Unmount

```typescript
useEffect(() => {
  // ... setup polling ...
  
  return () => {
    // Cleanup on unmount
    clearInterval(pollIntervalRef.current);
    clearInterval(leaderboardIntervalRef.current);
  };
}, [username]);
```

---

## API Call Sequence Diagram

```
┌─────────┐                    ┌──────────┐                  ┌─────┐
│ Browser │                    │ Frontend │                  │ API │
└────┬────┘                    └────┬─────┘                  └──┬──┘
     │                              │                           │
     │ 1. Enter Username            │                           │
     ├──────────────────────────────►                           │
     │                              │                           │
     │                              │ 2. GET /question         │
     │                              ├──────────────────────────►
     │                              │◄──────────────────────────┤
     │                              │ 3. Question Response      │
     │ 4. Display Question          │                           │
     │◄─────────────────────────────┤                           │
     │                              │                           │
     │ 5. Type Answer               │                           │
     ├──────────────────────────────►                           │
     │                              │                           │
     │                              │ 6. POST /answer          │
     │                              ├──────────────────────────►
     │                              │◄──────────────────────────┤
     │                              │ 7. Answer Result         │
     │ 8. Show Feedback             │                           │
     │◄─────────────────────────────┤                           │
     │   (Confetti if correct!)     │                           │
     │                              │                           │
     │                              │ 9. GET /leaderboard     │
     │                              ├──────────────────────────►
     │                              │◄──────────────────────────┤
     │                              │ 10. Leaderboard Data     │
     │ 11. Update Rankings          │                           │
     │◄─────────────────────────────┤                           │
     │                              │                           │
```

---

## File Organization

```
src/
├── api/
│   └── triviaApi.ts
│       ├── Axios configuration
│       ├── API client methods
│       └── TypeScript interfaces
│
├── components/
│   ├── QuestionCard.tsx
│   │   └── Question display & answer form
│   │
│   ├── Leaderboard.tsx
│   │   └── Score rankings display
│   │
│   ├── UsernameInput.tsx
│   │   └── Login modal
│   │
│   └── AdminPanel.tsx
│       └── Session management
│
├── utils/
│   └── confetti.ts
│       ├── Particle animation logic
│       └── Celebration triggers
│
├── App.tsx
│   ├── Main component
│   ├── State management
│   ├── Polling logic
│   └── Event handlers
│
├── main.tsx
│   └── React app bootstrap
│
└── index.css
    └── Tailwind styling
```

---

## Confetti Animation Logic

```
triggerConfetti():
  1. Create 100 div elements
  2. Position at random X coordinates
  3. Set to top of screen
  4. For each particle:
     ├─ Generate random angle
     ├─ Generate random velocity
     ├─ Add gravity effect
     ├─ Animate falling with opacity fade
     ├─ Remove from DOM after 2-4 seconds
     └─ Use requestAnimationFrame for 60fps
  
  5. Multiple bursts:
     ├─ 100 particles immediately
     ├─ 50 particles after 100ms
     └─ 50 particles after 200ms
```

---

## Performance Optimizations

```
1. Code Splitting (Vite)
   └─ Automatic chunk splitting

2. Lazy Loading
   └─ React.lazy for future features

3. Polling Strategy
   ├─ Intervals prevent constant polling
   ├─ Smart state comparison
   └─ Cleanup on unmount

4. CSS Optimization
   └─ Tailwind purges unused CSS

5. Bundle Size
   └─ 64 KB gzipped (minimal)

6. Rendering
   ├─ Component memoization (potential)
   └─ Efficient state updates
```

---

## Error Handling Architecture

```
API Client (triviaApi.ts)
  │
  ├─ Try/Catch blocks
  ├─ Axios error handling
  └─ Console logging

Component Level (App.tsx)
  │
  ├─ State for errors
  ├─ User-friendly messages
  └─ Graceful degradation

UI Feedback (Components)
  │
  ├─ Error messages
  ├─ Loading states
  └─ Fallback UI

Admin Panel
  │
  ├─ Validation before API call
  ├─ Error display to admin
  └─ Success notifications
```

---

## Summary

This architecture provides:
✅ **Scalability** - Handles many concurrent users
✅ **Performance** - Optimized bundle and polling
✅ **Maintainability** - Clear component structure
✅ **Type Safety** - Full TypeScript coverage
✅ **Real-time Updates** - Intelligent polling strategy
✅ **User Experience** - Smooth animations & feedback
✅ **Error Resilience** - Graceful error handling
