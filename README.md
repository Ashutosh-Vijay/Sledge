# Agentic Cricket Panel — "Call the Ball"

> A second-screen cricket companion where you predict each ball against **three AI agent personalities** (Stats Nerd, Roast Agent, Predictor), all powered by Gemini. Built for Google Cloud's **Agentic Premier League** hackathon.

## The 30-second pitch

Most "cricket apps" are passive. You stare at a score ticker. This flips it: a Cricsheet match replays ball-by-ball, and **you** call each ball before it plays — Dot / Boundary / Wicket / Other. The Predictor Agent calls it too. You're competing head-to-head.

Around that core loop, three agents react in parallel through Gemini:

| Agent | Personality | Tools |
|---|---|---|
| 📊 Stats Nerd | Cold, precise numbers. Cricinfo Statsguru energy. | `get_player_career_stats`, `get_batsman_vs_bowler`, `get_recent_form` |
| 🔥 Roast Agent | Indian cricket Twitter venom. Slanders the user when wrong. | — |
| 🎯 Predictor | Self-aware probabilistic agent. Smug when right. Self-deprecating when wrong. | — |

There's also an **Ask the Panel** input at the bottom: type any question ("Should Kohli have played that shot?") and all three agents respond in character, in parallel.

## How it answers the brief

> *"Enhance how users experience live sporting events beyond passive viewing... create meaningful second-screen interactions... participate in real-time activities... feel more connected to the game."*

| Requirement | How we hit it |
|---|---|
| **Beyond passive viewing** | User predicts every ball; not just spectating commentary. |
| **Second-screen interactions** | Phone-shaped layout designed to run alongside TV/Hotstar. |
| **Engage with key moments** | Wickets and boundaries trigger sound, animation, agent reactions. |
| **Real-time activities** | "Call the Ball" prediction loop, head-to-head score vs AI, streak counter. |
| **Feel connected** | Banter from three distinct personalities = simulates watching with friends; "Ask the Panel" makes it conversational. |

## UX polish (this is the main thing per organizers)

- 🎉 **Confetti** burst on a correct user prediction
- 📳 **Screen shake** on a wrong prediction
- 💯 **Score pulse + count-up** animations on every score change
- 🔥 **Streak counter** appears when user goes 2+ correct in a row
- ⌨️ **Typing indicators** (animated dots) for each agent while their Gemini call is in flight
- 🔊 **Sound design**: distinct synthesized cues for boundary, wicket, correct, wrong (no asset deps — pure Web Audio API so it works on any deploy)
- 📨 **Smooth fade-in** on every new message
- 🏆 **Match-over state** with proper winner declaration

## Tech stack

- **Frontend**: React 19 + Vite + TypeScript + Custom CSS Tokens (Sledge Design System)
- **Backend**: Node.js + Express (single server, serves the built client static files in prod)
- **LLM**: Gemini 2.5 Flash via `@google/genai` SDK, with function calling for Stats Nerd
- **Match data**: Bundled Cricsheet-format JSON (replayed as the "live feed" mock)
- **Deployment**: Single Docker container, target Google Cloud Run

## Architecture & Data

The core architecture supports a fully simulated ball-by-ball gameplay loop, allowing for a fast-paced demo experience without waiting for a real live match.

| Component | Implementation |
|---|---|
| Bundled Cricsheet JSON replayed at configurable speed (`client/public/data/match.json`) | Allows users to experience a complete match flow in minutes. |
| Hardcoded player stats in `server/tools.js` (Kohli, Bumrah, Rohit, Dhoni, Pandya, etc.) | Demonstrates Stats Nerd's tool-calling capabilities instantly. |
| Hardcoded batter-vs-bowler head-to-heads | Demonstrates complex query tool-calling. |

All API calls to Gemini for the "Ask the Panel" feature are **real** — there's no LLM mocking.

## Local setup

### 1. Get a Gemini API key
Go to [Google AI Studio](https://aistudio.google.com/), sign in, click "Get API Key". Free tier is plenty for development.

### 2. Configure environment
```bash
cd server
cp ../.env.example .env
# Open .env and paste your key after GEMINI_API_KEY=
```

### 3. Install + run

In one terminal:
```bash
cd server
npm install
node index.js
# Server listening on port 8080
```

In another terminal:
```bash
cd client
npm install
npm run dev
# Vite dev server on port 5173, proxies /api to 8080
```

Open `http://localhost:5173`.

## Deploying to Google Cloud Run

This project targets Cloud Run specifically — Google's hackathon credits cover the hosting bill. The single `Dockerfile` builds the Vite client and serves it via the Express backend on port 8080.

```bash
gcloud run deploy agentic-cricket-panel \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_actual_key_here
```

> **Note on sponsor credits**: We use the `$300 GCP credits` for Cloud Run hosting. Gemini API calls themselves use an AI Studio key (no `@google-cloud/vertexai` auth setup needed — keeps the build path friction-free).

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/predict-next` | Predictor agent makes a pre-ball call (Dot/Boundary/Wicket/Other) |
| `POST` | `/api/react` | All 3 agents react in parallel to the ball that just played |
| `POST` | `/api/ask` | "Ask the Panel" — all 3 agents answer a free-text question in character |

## Project structure

```
agentic-cricket-panel/
├── client/                          Vite + React
│   ├── public/data/match.json       Cricsheet replay data
│   └── src/
│       ├── App.tsx                  Main game loop
│       ├── components/
│       │   ├── Scoreboard.tsx       User vs AI score + streak
│       │   ├── MatchHeader.tsx      Over, batter, bowler, pause/speed
│       │   ├── PredictionButtons.tsx 4-choice prediction
│       │   ├── AgentFeed.tsx        Chat-style feed + typing indicators
│       │   ├── AgentMessage.tsx     Single message bubble
│       │   └── AskPanel.tsx         Ask the Panel input
│       └── lib/
│           ├── cricsheet.ts         Cricsheet JSON → Ball[] parser
│           └── api.ts               Server API client
├── server/
│   ├── index.js                     Express routes
│   ├── agents.js                    3 system prompts + Gemini orchestration
│   └── tools.js                     Mock player-stats functions
├── Dockerfile                       Single-container build for Cloud Run
└── .env.example
```
