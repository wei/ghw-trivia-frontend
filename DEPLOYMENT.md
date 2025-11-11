# Deployment Guide

## Local Development

### Prerequisites
- Node.js 16+ and npm/yarn
- Access to the Trivia API at `http://ghw-trivia.duckdns.org:8000/`

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

## Production Build

### Build for Deployment

```bash
# Build the project
npm run build

# This generates an optimized build in the 'dist' directory
```

### Deploy to Static Hosting

The built `dist/` directory can be deployed to any static hosting service:

#### Option 1: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Option 2: Vercel

```bash
npm install -g vercel
vercel --prod
```

#### Option 3: GitHub Pages

1. Add to `package.json`:
```json
"homepage": "https://yourusername.github.io/trivia-frontend/"
```

2. Deploy:
```bash
npm run build
npm run deploy
```

#### Option 4: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t trivia-frontend .
docker run -p 80:80 trivia-frontend
```

#### Option 5: Simple HTTP Server

```bash
npm run build

# Install http-server globally
npm install -g http-server

# Serve the dist folder
http-server dist -p 8080
```

## Configuration

### API Endpoint

To use a different API endpoint, edit `src/api/triviaApi.ts`:

```typescript
const API_BASE_URL = 'http://ghw-trivia.duckdns.org:8000';
```

## Environment Variables (Optional)

Create a `.env` file:

```
VITE_API_BASE_URL=http://ghw-trivia.duckdns.org:8000
```

Update `src/api/triviaApi.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ghw-trivia.duckdns.org:8000';
```

## Performance Optimization

### Build Analysis

```bash
npm install --save-dev vite-plugin-visualizer

# In vite.config.ts, add:
import { visualizer } from 'vite-plugin-visualizer';

plugins: [react(), visualizer()],
```

### Bundle Size

- **Current**: ~64 KB gzipped (very performant!)
- Main dependencies: React (38KB), React-DOM (42KB), Axios (15KB)

## Troubleshooting

### API Connection Issues

1. Check if API is accessible: `curl http://ghw-trivia.duckdns.org:8000/health`
2. Check browser console for CORS errors
3. Ensure API_BASE_URL is correct

### Build Failures

```bash
# Clear dependencies and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Development Server Not Starting

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill the process if needed
kill -9 <PID>

# Try a different port
npm run dev -- --port 3001
```

## Monitoring

### Health Check

The app automatically checks API health on load. If the health check fails, users will still be able to use the app, but they may not see questions.

### Error Logging

Enable error logging by uncommenting console.error statements in `src/api/triviaApi.ts` and `src/App.tsx`

## Security

- User credentials are stored in localStorage only for username (no sensitive data)
- Admin API key is never stored (must be entered each time)
- All API calls use HTTPS (duckdns.org)
- No sensitive data in browser

## Performance Tips

1. **Caching**: Built-in service workers for offline support (optional)
2. **Code Splitting**: Vite automatically optimizes chunks
3. **Image Optimization**: No images used (lightweight)
4. **Polling Intervals**: 
   - Questions: 2 seconds
   - Leaderboard: 3 seconds
   - Adjust in `src/App.tsx` if needed

## Contact & Support

For issues or questions, check the main README.md or GitHub issues.
