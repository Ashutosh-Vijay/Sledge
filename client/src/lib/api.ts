import type { Ball, MatchContext, AgentResponse } from '../types';

const API_BASE = '/api';

export async function fetchNextPrediction(matchContext: MatchContext): Promise<string> {
  const res = await fetch(`${API_BASE}/predict-next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchContext })
  });
  if (!res.ok) throw new Error('API Error');
  const data = await res.json();
  return data.prediction;
}

export async function submitReaction(
  ball: Ball,
  userPrediction: string,
  predictorPrediction: string,
  matchContext: MatchContext
): Promise<AgentResponse> {
  const res = await fetch(`${API_BASE}/react`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ball, userPrediction, predictorPrediction, matchContext })
  });
  if (!res.ok) throw new Error('API Error');
  return res.json();
}

export async function askPanel(question: string, matchContext: MatchContext): Promise<AgentResponse> {
  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, matchContext })
  });
  if (!res.ok) throw new Error('Ask Panel failed');
  return res.json();
}
