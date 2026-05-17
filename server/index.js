// /server/index.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { getMockPrediction, getMockReactions, getPanelAnswers } = require('./agents');

const app = express();
app.use(cors());
app.use(express.json());

// Serve Vite-built static files in production
app.use(express.static(path.join(__dirname, '../client/dist')));

// Pre-ball: predictor calls its shot (mocked — instant, no API cost)
app.post('/api/predict-next', (req, res) => {
  res.json({ prediction: getMockPrediction() });
});

// Post-ball: all 3 agents react (mocked — instant, no API cost)
app.post('/api/react', (req, res) => {
  const { ball, userPrediction, predictorPrediction } = req.body || {};
  if (!ball) return res.status(400).json({ error: 'ball required' });
  res.json(getMockReactions(ball, userPrediction, predictorPrediction));
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

// Catch-all: serve React app (Express 5 syntax)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server on :${PORT} — mocks for autoplay, live Gemini for Ask the Panel`));
