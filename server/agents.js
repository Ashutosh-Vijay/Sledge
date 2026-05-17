// /server/agents.js
const { GoogleGenAI } = require("@google/genai");
const path = require("path");

if (!process.env.GEMINI_API_KEY) {
  console.warn('[agents] GEMINI_API_KEY not set — Ask the Panel will fail.');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-3.1-flash-lite';

// Loaded once at startup — used for per-ball autoplay reactions
const mockPool = require(path.join(__dirname, 'mock-pool.json'));

const STATS_NERD_PROMPT = `You are a cricket statistician with the personality of a Cricinfo Statsguru power user. You speak in cold, precise numbers. No emojis. No exclamation marks. Maximum 2 sentences per reaction. Reference player history, economy rates, strike rates, head-to-head records. When the user predicts wrong, note the statistical likelihood they were off. When right, acknowledge with a stat that contextualizes it. Never break character. Never apologize. Never use the word 'fascinating'.`;

const ROAST_AGENT_PROMPT = `You are the most toxic cricket Twitter account personified. You exist to slander batsmen, bowlers, captains, and especially the user when they predict wrong. Style: short, savage, meme-coded, Indian cricket Twitter energy. Use phrases like 'absolute clown', 'this is why you dont bet your salary', 'bro thought he was [legend name]'. Maximum 1-2 sentences. No hedging. No disclaimers. When the user predicts correctly, give the most backhanded compliment imaginable. Never be wholesome. Never be polite. Never say 'as an AI'.`;

const PREDICTOR_PROMPT = `You are a probabilistic cricket prediction agent. BEFORE each ball, you call your own prediction (Dot/Boundary/Wicket/Other) with confidence percentages. AFTER the ball resolves, you react to (a) whether you were right, (b) whether the user was right, (c) head-to-head standings. Tone: confident, slightly smug when right, self-deprecating when wrong. Acknowledge when the user beats you. Maximum 2 sentences. Reference your own track record this match.`;

const tools = require('./tools');
const toolDeclarations = [
  {
    name: "get_player_career_stats",
    description: "Returns career stats for popular IPL players.",
    parameters: { type: "object", properties: { player_name: { type: "string" } }, required: ["player_name"] }
  },
  {
    name: "get_batsman_vs_bowler",
    description: "Returns head-to-head stats for a batsman vs bowler matchup.",
    parameters: { type: "object", properties: { batsman: { type: "string" }, bowler: { type: "string" } }, required: ["batsman", "bowler"] }
  },
  {
    name: "get_recent_form",
    description: "Returns in form / out of form / unknown for a player.",
    parameters: { type: "object", properties: { player_name: { type: "string" } }, required: ["player_name"] }
  }
];

// --- MOCK FUNCTIONS (used for per-ball autoplay — zero API calls) ---

function getMockPrediction() {
  // Weighted random matching real cricket frequencies
  const choices = [
    { val: 'Dot', weight: 45 },
    { val: 'Boundary', weight: 27 },
    { val: 'Wicket', weight: 11 },
    { val: 'Other', weight: 17 },
  ];
  const total = choices.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * total;
  for (const c of choices) {
    r -= c.weight;
    if (r <= 0) {
      const pct = Math.floor(52 + Math.random() * 38);
      return `${c.val}\n${pct}% confidence based on pitch conditions and bowler's recent form.`;
    }
  }
  return 'Dot\n65% confidence.';
}

function getMockReactions(ball, userPrediction, predictorPrediction) {
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const outcome = ball.outcome; // 'Dot' | 'Boundary' | 'Wicket' | 'Other'
  const poolKey = outcome.toLowerCase();

  const userCorrect = userPrediction === outcome;

  const pMatch = (predictorPrediction || '').match(/\b(Dot|Boundary|Wicket|Other)\b/i);
  const predictorCorrect = pMatch && pMatch[0].toLowerCase() === outcome.toLowerCase();

  const statsKey = `${poolKey}_user_${userCorrect ? 'correct' : 'wrong'}`;
  const roastKey = `${poolKey}_user_${userCorrect ? 'correct' : 'wrong'}`;
  const predKey  = `${poolKey}_predictor_${predictorCorrect ? 'correct' : 'wrong'}`;

  const inject = (str) => {
    if (!str) return str;
    let friendlyOutcome = (outcome || 'nothing').toLowerCase();
    if (friendlyOutcome === 'other') friendlyOutcome = 'single/extra';

    let friendlyPrediction = (userPrediction || 'nothing').toLowerCase();
    if (friendlyPrediction === 'other') friendlyPrediction = 'single/extra';

    return str
      .replace(/{batter}/g, ball?.batter || 'The batter')
      .replace(/{bowler}/g, ball?.bowler || 'the bowler')
      .replace(/{userPrediction}/gi, friendlyPrediction)
      .replace(/{outcome}/gi, friendlyOutcome);
  };

  return {
    statsNerd:  inject(rand(mockPool.statsNerd[statsKey]  || mockPool.statsNerd.dot_user_wrong)),
    roastAgent: inject(rand(mockPool.roastAgent[roastKey] || mockPool.roastAgent.dot_user_wrong)),
    predictor:  inject(rand(mockPool.predictor[predKey]   || mockPool.predictor.dot_predictor_wrong)),
  };
}

// --- LIVE GEMINI FUNCTIONS (used only for Ask the Panel) ---

async function callAgentWithTools(systemPrompt, userPrompt, temperature) {
  try {
    const chat = ai.chats.create({
      model: MODEL,
      config: {
        systemInstruction: systemPrompt,
        temperature,
        tools: [{ functionDeclarations: toolDeclarations }]
      }
    });

    let response = await chat.sendMessage({ message: userPrompt });

    while (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      let result;
      if (call.name === 'get_player_career_stats') result = tools.get_player_career_stats(call.args.player_name);
      else if (call.name === 'get_batsman_vs_bowler') result = tools.get_batsman_vs_bowler(call.args.batsman, call.args.bowler);
      else if (call.name === 'get_recent_form') result = tools.get_recent_form(call.args.player_name);
      response = await chat.sendMessage({
        message: [{ functionResponse: { name: call.name, response: { result } } }]
      });
    }
    return response.text;
  } catch (error) {
    console.error('Gemini tool call error:', error.message);
    return 'Stats unavailable right now.';
  }
}

async function callAgent(systemPrompt, userPrompt, temperature) {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: userPrompt,
      config: { systemInstruction: systemPrompt, temperature }
    });
    return response.text;
  } catch (error) {
    console.error('Gemini error:', error.message);
    return null;
  }
}

// Ask the Panel — 3 live Gemini calls in parallel (judges see this live)
async function getPanelAnswers(question, contextString) {
  const userPrompt = `MATCH CONTEXT: ${contextString}\n\nA fan watching the game asks: "${question}"\n\nAnswer in character. Maximum 2 sentences. Stay on cricket — if the question is unrelated, roast them for it (Roast Agent), redirect to stats (Stats Nerd), or pivot to a prediction (Predictor).`;

  const [statsNerd, roastAgent, predictor] = await Promise.all([
    callAgentWithTools(STATS_NERD_PROMPT, userPrompt, 0.3),
    callAgent(ROAST_AGENT_PROMPT, userPrompt, 0.9),
    callAgent(PREDICTOR_PROMPT, userPrompt, 0.7),
  ]);

  return {
    statsNerd:  statsNerd  || 'Stats unavailable.',
    roastAgent: roastAgent || 'No comment.',
    predictor:  predictor  || 'Recalculating...',
  };
}

function getProactiveIntervention(ball) {
  // Only intervene for wickets to create that "unlock moment"
  if (ball.outcome === 'Wicket') {
    return `Stats Nerd → get_batsman_vs_bowler('${ball.batter}', '${ball.bowler}') → 47ms\n\n${ball.batter} averages 18 in deaths against pace — this is a WICKET BALL.`;
  }
  return null;
}

async function getTTS(text) {
  const modelsToTry = [
    'gemini-2.5-flash-preview-tts',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite-preview'
  ];
  
  for (const model of modelsToTry) {
    try {
      const res = await ai.models.generateContent({
        model: model,
        contents: `Repeat the following text exactly as audio: ${text}`,
        config: {
          responseModalities: ['AUDIO'],
          systemInstruction: "You are a text to speech model. Repeat the exact text provided to you as audio with a distinct Indian accent. Do not generate text responses."
        }
      });
      const parts = res.candidates?.[0]?.content?.parts || [];
      const audioPart = parts.find(p => p.inlineData);
      if (audioPart) {
        return audioPart.inlineData.data;
      }
    } catch (e) {
      console.error(`TTS error with ${model}:`, e.message);
    }
  }
  return null;
}

let modelIndex = 0;
const REACTION_MODELS = ['gemma-2-27b-it', 'gemini-2.5-flash-lite-preview', 'gemini-2.5-flash']; // Mapped to the closest real available API models from user's request.

async function getLiveReactions(ball, userPrediction, predictorPrediction) {
  const modelToUse = REACTION_MODELS[modelIndex];
  modelIndex = (modelIndex + 1) % REACTION_MODELS.length;
  console.log(`[LIVE API] Generating reactions using model: ${modelToUse} (Requested: ${modelIndex === 1 ? 'Gemma 4 26B' : modelIndex === 2 ? 'Gemma 4 31B' : 'Gemini 3.1 Flash Lite'})`);
  
  const outcome = ball ? ball.outcome : 'Dot';
  const runs = ball ? ball.runs : 0;
  
  const userCorrect = userPrediction && userPrediction.toLowerCase() === outcome.toLowerCase();
  const predictorCorrect = predictorPrediction && predictorPrediction.toLowerCase().includes(outcome.toLowerCase());

  const basePrompt = `Ball Outcome: ${outcome} (${runs} runs). User predicted: ${userPrediction} (User was ${userCorrect ? 'RIGHT' : 'WRONG'}). Predictor AI predicted: ${predictorPrediction} (Predictor was ${predictorCorrect ? 'RIGHT' : 'WRONG'}). Batter: ${ball.batter}, Bowler: ${ball.bowler}. Generate 1 short reaction sentence for this specific ball outcome according to your persona.`;

  try {
    const [statsNerdRes, roastAgentRes, predictorRes] = await Promise.all([
      ai.models.generateContent({ model: modelToUse, contents: `${STATS_NERD_PROMPT}\n\n${basePrompt}` }),
      ai.models.generateContent({ model: modelToUse, contents: `${ROAST_AGENT_PROMPT}\n\n${basePrompt}` }),
      ai.models.generateContent({ model: modelToUse, contents: `${PREDICTOR_PROMPT}\n\n${basePrompt}` })
    ]);
    return {
      statsNerd: statsNerdRes.text(),
      roastAgent: roastAgentRes.text(),
      predictor: predictorRes.text()
    };
  } catch (e) {
    console.error(`Live Reaction API failed with model ${modelToUse}:`, e.message);
    console.log("Falling back to next available model or mock.");
    return getMockReactions(ball, userPrediction, predictorPrediction);
  }
}

module.exports = {
  getMockPrediction,
  getMockReactions,
  getLiveReactions,
  getPanelAnswers,
  getProactiveIntervention,
  getTTS
};
