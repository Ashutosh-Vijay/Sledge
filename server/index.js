// /server/index.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { getMockPrediction, getMockReactions, getLiveReactions, getPanelAnswers, getProactiveIntervention, getTTS } = require('./agents');

const app = express();
app.use(cors());
app.use(express.json());

// Serve Vite-built static files in production
app.use(express.static(path.join(__dirname, '../client/dist')));

// Pre-ball: predictor calls its shot (mocked — instant, no API cost)
app.post('/api/predict-next', (req, res) => {
  const { matchContext, nextBall } = req.body || {};
  const proactive = nextBall ? getProactiveIntervention(nextBall) : null;
  res.json({ prediction: getMockPrediction(), proactive });
});

// Post-ball: all 3 agents react (live API with fallback)
app.post('/api/react', async (req, res) => {
  const { ball, userPrediction, predictorPrediction } = req.body || {};
  if (!ball) return res.status(400).json({ error: 'ball required' });
  try {
    const reactions = await getLiveReactions(ball, userPrediction, predictorPrediction);
    res.json(reactions);
  } catch (e) {
    console.error("Live reactions failed, falling back to mock:", e);
    res.json(getMockReactions(ball, userPrediction, predictorPrediction));
  }
});

// Ask the Panel — LIVE Gemini (this is the interactive demo moment)
app.post('/api/ask', async (req, res) => {
  const { question, matchContext } = req.body || {};

  if (!question || typeof question !== 'string' || question.length > 500) {
    return res.status(400).json({ error: 'Question required (max 500 chars)' });
  }

  const contextString = `Over ${matchContext?.over ?? 0}, Score ${matchContext?.score ?? '0/0'}. Head-to-head: User ${matchContext?.userScoreTotal ?? 0} — AI ${matchContext?.predictorScoreTotal ?? 0}.`;

  try {
    const answers = await getPanelAnswers(question, contextString);
    res.json(answers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tts', async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Text required' });
  try {
    const audioBase64 = await getTTS(text);
    res.json({ audio: audioBase64 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all: serve React app (Express 5 syntax)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server on :${PORT} — mocks for autoplay, live Gemini for Ask the Panel`));
