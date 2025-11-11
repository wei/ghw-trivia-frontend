# Trivia Frontend

A modern React + TypeScript + Tailwind CSS frontend for the Trivia API.

## Features

✅ **Real-time Question Display** - Live trivia questions from the API
✅ **Answer Submission** - Submit answers with immediate feedback
✅ **Live Leaderboard** - Real-time leaderboard updates
✅ **Confetti Animation** - Celebrate correct answers and new high scores!
✅ **User Management** - Username-based player tracking
✅ **Admin Panel** - Start/end trivia sessions with API key authentication
✅ **Responsive Design** - Works on desktop and mobile
✅ **Auto-polling** - Automatic updates every 2-3 seconds

## Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── api/
│   └── triviaApi.ts        # API client and types
├── components/
│   ├── QuestionCard.tsx    # Main question display
│   ├── Leaderboard.tsx     # Leaderboard component
│   ├── UsernameInput.tsx   # Username entry modal
│   └── AdminPanel.tsx      # Admin session controls
├── utils/
│   └── confetti.ts         # Confetti animation utility
├── App.tsx                 # Main app component
├── main.tsx                # Entry point
└── index.css               # Tailwind styles
```

## Configuration

The API endpoint is configured in `src/api/triviaApi.ts`:
```typescript
const API_BASE_URL = 'http://ghw-trivia.duckdns.org:8000';
```

Update this if your API is hosted elsewhere.

## How to Use

### As a Player

1. Enter your username to get started
2. Wait for an admin to start a trivia session
3. Answer the question in the text input
4. View real-time leaderboard updates
5. Celebrate with confetti when you score!

### As an Admin

1. Click the "⚙️ Admin" button in the bottom right
2. Enter your API key
3. Enter a trivia question and correct answer
4. Click "Start Session" to begin
5. Click "End Session" to reveal the answer and scores

## Features Explained

### Real-time Updates
- Questions refresh every 2 seconds
- Leaderboard refreshes every 3 seconds
- Auto-detects new sessions and resets answer state

### Confetti Animation
- Triggers when you answer correctly
- Triggers when you achieve a new high score
- Multiple particle bursts for maximum celebration

### Answer Matching
- Case-insensitive matching (handled by API)
- Users can only answer once per session
- Answer input is disabled after submission

### Leaderboard Display
- Top 10 scorers by default
- Medal emojis (🥇 🥈 🥉) for top 3
- Highlights current player
- Sorted by score descending

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Confetti** - Celebration animations

## License

MIT
