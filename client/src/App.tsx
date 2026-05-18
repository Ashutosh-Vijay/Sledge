import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ScreenOnboarding } from './components/screens/Onboarding';
import { ScreenHome } from './components/screens/Home';
import { ScreenMatchDetail } from './components/screens/MatchDetail';
import { ScreenLivePreball } from './components/screens/LivePreball';
import type { FeedItem } from './components/screens/LivePreball';
import { LiveDesktop } from './components/desktop/LiveDesktop';
import { OnboardingDesktop, HomeDesktop, MatchDetailDesktop, PanelDesktop, YouDesktop, RecapDesktop, AskPanelDesktop } from './components/desktop/DesktopScreens';
import { ScreenAskPanel } from './components/screens/AskPanelScreen';
import { ScreenRecap } from './components/screens/Recap';
import { ScreenPanel } from './components/screens/PanelScreen';
import type { Ball, MatchContext } from './types';
import { parseCricsheet } from './lib/cricsheet';
import { fetchNextPrediction, submitReaction, askPanel } from './lib/api';

type Screen = 'onboarding' | 'home' | 'matchDetail' | 'live' | 'askPanel' | 'recap' | 'panel' | 'you';

const SPEEDS = [1, 2, 4];
const BASE_INTERVAL_MS = 16000;

let audioCtx: AudioContext | null = null;
const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
};
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', initAudio, { once: true });
  window.addEventListener('keydown', initAudio, { once: true });
}
function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.18) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    osc.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.start(); osc.stop(ctx.currentTime + dur);
  } catch { /* audio blocked */ }
}
const playBoundary = () => { 
  tone(440, 0.15, 'square', 0.1); 
  setTimeout(() => tone(554, 0.15, 'square', 0.1), 100); 
  setTimeout(() => tone(659, 0.3, 'square', 0.15), 200); 
  setTimeout(() => tone(880, 0.4, 'triangle', 0.2), 300);
};
const playWicket = () => { 
  tone(600, 0.2, 'sawtooth', 0.3); 
  tone(650, 0.2, 'square', 0.2); 
  setTimeout(() => { tone(400, 0.4, 'sawtooth', 0.4); tone(430, 0.4, 'square', 0.2); }, 150);
};
const playCorrect = () => { 
  const notes = [1046.50, 1318.51, 1567.98, 2093.00, 1567.98, 2093.00, 2637.02];
  notes.forEach((freq, i) => {
    setTimeout(() => tone(freq, 0.1, 'sine', 0.15), i * 60);
    setTimeout(() => tone(freq * 1.5, 0.1, 'triangle', 0.05), i * 60);
  });
};
const playWrong = () => {
  tone(300, 0.3, 'sawtooth', 0.2);
  tone(315, 0.3, 'triangle', 0.2);
  setTimeout(() => { tone(200, 0.4, 'sawtooth', 0.25); tone(210, 0.4, 'square', 0.1); }, 200);
  setTimeout(() => { tone(100, 0.6, 'sawtooth', 0.3); tone(105, 0.6, 'square', 0.15); }, 450);
};
const playStreak3 = () => {
  [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'sine', 0.2), i * 75));
  setTimeout(() => tone(1319, 0.6, 'sine', 0.28), 420);
};
const playStreak5 = () => {
  [262, 330, 392, 523, 659, 784, 1047, 1319, 1568].forEach((f, i) =>
    setTimeout(() => { tone(f, 0.14, 'sine', 0.22); tone(f * 1.5, 0.14, 'triangle', 0.08); }, i * 52)
  );
  setTimeout(() => { tone(1047, 0.9, 'sine', 0.3); tone(1319, 0.9, 'sine', 0.22); tone(1568, 0.9, 'sine', 0.18); }, 530);
};
const playNearMiss = () => {
  tone(880, 0.1, 'sine', 0.12);
  setTimeout(() => tone(660, 0.15, 'sine', 0.1), 90);
  setTimeout(() => tone(440, 0.3, 'sawtooth', 0.08), 220);
};

const API_URL = import.meta.env.VITE_API_URL || '';

// ── Audio state machine ────────────────────────────────────────────────
// IPL theme — plays everywhere, pauses during crowd/TTS, resumes after
let _bgAudio: HTMLAudioElement | null = null;
function initBgAudio() {
  if (typeof window === 'undefined' || _bgAudio) return;
  _bgAudio = new Audio('/audio/bg.wav');
  _bgAudio.loop = true;
  _bgAudio.volume = 0.28;
}
function startBgAudio() { initBgAudio(); if (_bgAudio?.paused) _bgAudio.play().catch(() => {}); }
function pauseBgAudio() { if (_bgAudio && !_bgAudio.paused) _bgAudio.pause(); }
function resumeBgAudio() { if (_bgAudio?.paused) _bgAudio.play().catch(() => {}); }
// @ts-ignore
function stopBgAudio() { if (_bgAudio) { _bgAudio.pause(); _bgAudio.currentTime = 0; } }

// Crowd — plays during the 3s prediction delay
let _crowdAudio: HTMLAudioElement | null = null;
function playCrowd() {
  if (_crowdAudio) { _crowdAudio.pause(); _crowdAudio.currentTime = 0; }
  _crowdAudio = new Audio('/audio/crowd.wav');
  _crowdAudio.volume = 0.75;
  _crowdAudio.play().catch(() => {});
}
function stopCrowd() {
  if (_crowdAudio) { _crowdAudio.pause(); _crowdAudio.currentTime = 0; _crowdAudio = null; }
}

// Event clip (Mumbai/Kolkata) — plays on boundary/wicket, ducked when TTS starts
let _eventAudio: HTMLAudioElement | null = null;
function playEventClip(src: string, vol = 0.85) {
  if (_eventAudio) { _eventAudio.pause(); _eventAudio = null; }
  const a = new Audio(src);
  a.volume = vol;
  _eventAudio = a;
  a.play().catch(() => {});
}
function stopEventClip() {
  if (_eventAudio) { _eventAudio.pause(); _eventAudio = null; }
}

// Ducking — lower all playing audio when TTS commentator speaks, restore after
type DuckedEntry = { el: HTMLAudioElement; orig: number };
let _ducked: DuckedEntry[] = [];
function duckAllAudio() {
  _ducked = [];
  [_bgAudio, _crowdAudio, _eventAudio].forEach(el => {
    if (el && !el.paused && el.volume > 0.08) {
      _ducked.push({ el, orig: el.volume });
      el.volume = 0.07;
    }
  });
}
function unduckAllAudio() {
  _ducked.forEach(({ el, orig }) => { try { el.volume = orig; } catch { /* */ } });
  _ducked = [];
}

// One-shot (Rohit intro etc.)
function playClip(src: string, volume = 0.8) {
  if (typeof window === 'undefined') return;
  const a = new Audio(src);
  a.volume = volume;
  a.play().catch(() => {});
}

let _ttsAbort: AbortController | null = null;
let _audioSource: AudioBufferSourceNode | null = null;
let _pendingAudio: { buffer: AudioBuffer; agentId: string } | null = null;
let _playWhenReady = false;
let _fallbackTimer: ReturnType<typeof setTimeout> | null = null;
// @ts-ignore
let _fallbackAgentId = '';
// @ts-ignore
let _fallbackMsg = '';

function cancelCurrentTTS() {
  if (_ttsAbort) { _ttsAbort.abort(); _ttsAbort = null; }
  if (_audioSource) { try { _audioSource.stop(); } catch { /* already stopped */ } _audioSource = null; }
  _pendingAudio = null;
  _playWhenReady = false;
  if (_fallbackTimer) { clearTimeout(_fallbackTimer); _fallbackTimer = null; }
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
}

function playAudioBuffer(buffered: { buffer: AudioBuffer; agentId: string }) {
  if (!audioCtx) return;
  if (_audioSource) { try { _audioSource.stop(); } catch { /* */ } _audioSource = null; }
  duckAllAudio();
  console.log(`[audio] playing TTS buffer for ${buffered.agentId}`);
  const source = audioCtx.createBufferSource();
  source.buffer = buffered.buffer;
  _audioSource = source;
  if (buffered.agentId === 'statsNerd') source.playbackRate.value = 0.85;
  else if (buffered.agentId === 'roastAgent') source.playbackRate.value = 1.15;
  source.connect(audioCtx.destination);
  source.onended = () => {
    if (_audioSource === source) _audioSource = null;
    unduckAllAudio();
    console.log('[audio] TTS ended — restoring audio and resuming IPL theme');
    resumeBgAudio();
  };
  source.start(0);
}

// @ts-ignore
function fallbackSpeak(agentId: string, message: string) {
  if (typeof window === 'undefined') return;
  window.speechSynthesis?.cancel();
  pauseBgAudio();
  const utterance = new SpeechSynthesisUtterance(message);
  const voices = window.speechSynthesis.getVoices();
  const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));
  if (indianVoice) utterance.voice = indianVoice;
  const rates: Record<string, number> = { statsNerd: 0.85, roastAgent: 1.15, predictor: 1.0 };
  utterance.rate = rates[agentId] || 1.0;
  const pitches: Record<string, number> = { statsNerd: 0.5, roastAgent: 1.5, predictor: 1.0 };
  utterance.pitch = pitches[agentId] || 1.0;
  utterance.onend = () => resumeBgAudio();
  utterance.onerror = () => resumeBgAudio();
  window.speechSynthesis.speak(utterance);
}

async function fetchTTSBuffer(agentId: string, message: string, signal: AbortSignal): Promise<void> {
  const sanitizedMessage = message.replace(/\//g, " or ");
  try {
    const res = await fetch(`${API_URL}/api/tts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sanitizedMessage, agentId }), signal,
    });
    if (signal.aborted || !res.ok) return;
    const data = await res.json();
    if (signal.aborted || !data.audio) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const binaryString = atob(data.audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;
    const buffer = audioCtx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    const buffered = { buffer, agentId };
    if (_playWhenReady && !signal.aborted) {
      console.log('[fetchTTSBuffer] buffer arrived AFTER reveal — playing immediately');
      _playWhenReady = false;
      if (_fallbackTimer) { clearTimeout(_fallbackTimer); _fallbackTimer = null; }
      playAudioBuffer(buffered);
    } else if (!signal.aborted) {
      console.log('[fetchTTSBuffer] buffer arrived BEFORE reveal — stored in _pendingAudio');
      _pendingAudio = buffered;
    }
  } catch { /* aborted or network error — silent */ }
}

const speakMessage = (agentId: string, message: string) => {
  console.log(`[speakMessage] called for ${agentId} — pendingAudio: ${!!_pendingAudio}`);
  if (_pendingAudio) {
    console.log('[speakMessage] TTS was pre-fetched ✓ — playing now');
    playAudioBuffer(_pendingAudio);
    _pendingAudio = null;
  } else {
    console.log('[speakMessage] TTS still in flight — setting _playWhenReady, browser blocked');
    _playWhenReady = true;
    _fallbackAgentId = agentId;
    _fallbackMsg = message;
    // Browser fallback BLOCKED — resuming IPL if TTS never arrives after 6s
    _fallbackTimer = setTimeout(() => {
      if (_playWhenReady) {
        _playWhenReady = false;
        console.warn('[speakMessage] TTS never arrived after 6s — resuming IPL theme (no browser fallback)');
        resumeBgAudio();
      }
    }, 6000);
  }
};

// ── "You" Profile Screen ──────────────────────────────────────
function ScreenYou({ userScore, predictorScore, bestStreak, matchesPlayed, totalBalls, correctPredictions, onBack }: {
  userScore: number; predictorScore: number; bestStreak: number;
  matchesPlayed: number; totalBalls: number; correctPredictions: number;
  onBack: () => void;
}) {
  const accuracy = totalBalls > 0 ? Math.round((correctPredictions / totalBalls) * 100) : 0;
  return (
    <div className="sl-screen" style={{ overflow: "hidden" }}>
      <div className="sl-content" style={{ padding: "4px 20px 16px", flexShrink: 0 }}>
        <div onClick={onBack} style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--light-3)", textTransform: "uppercase" as const, cursor: "pointer" }}>← Back</div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 28, fontWeight: 600, letterSpacing: -0.02, marginTop: 2, color: "var(--light-0)" }}>
          Your <span style={{ fontStyle: "italic", color: "var(--pitch-1)" }}>stats</span>.
        </div>
      </div>

      <div className="sl-content" style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
        {/* Score hero */}
        <div style={{
          padding: "24px 20px", background: "var(--ink-1)", borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.05)", marginBottom: 16,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--light-3)", textTransform: "uppercase" as const }}>Your score</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 48, fontWeight: 600, color: "var(--pitch-1)", lineHeight: 1, marginTop: 4 }}>{userScore}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--light-3)", textTransform: "uppercase" as const }}>AI score</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 48, fontWeight: 600, color: "var(--predict)", lineHeight: 1, marginTop: 4 }}>{predictorScore}</div>
            </div>
          </div>
          <div style={{
            marginTop: 16, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden", position: "relative",
          }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 3,
              width: `${userScore + predictorScore > 0 ? (userScore / (userScore + predictorScore)) * 100 : 50}%`,
              background: "var(--pitch-1)", transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: userScore >= predictorScore ? "var(--pitch-1)" : "var(--red-0)", marginTop: 8, letterSpacing: 0.04, textAlign: "center" }}>
            {userScore > predictorScore ? `You lead by ${userScore - predictorScore} pts` : userScore < predictorScore ? `AI leads by ${predictorScore - userScore} pts` : "Tied!"}
          </div>
        </div>

        {/* Stat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "ACCURACY", value: `${accuracy}%`, color: "var(--pitch-1)" },
            { label: "BEST STREAK", value: `🔥 ${bestStreak}`, color: "var(--red-0)" },
            { label: "BALLS CALLED", value: String(totalBalls), color: "var(--light-0)" },
            { label: "CORRECT", value: String(correctPredictions), color: "var(--pitch-1)" },
            { label: "MATCHES", value: String(matchesPlayed), color: "var(--light-0)" },
          ].map(s => (
            <div key={s.label} style={{
              padding: "16px 14px", background: "var(--ink-1)", borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 0.06, color: "var(--light-3)" }}>{s.label}</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 26, color: s.color, fontWeight: 600, marginTop: 6, lineHeight: 1, letterSpacing: -0.02 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── viewport hook ────────────────────────────────────────────
function useIsDesktop(breakpoint = 1024): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia(`(min-width: ${breakpoint}px)`).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isDesktop;
}

export default function App() {
  const isDesktop = useIsDesktop(1024);
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [balls, setBalls] = useState<Ball[]>([]);
  const [currentBallIndex, setCurrentBallIndex] = useState(0);
  const [matchInfo, setMatchInfo] = useState<{ teams: [string, string]; venue: string; battingTeam: string }>({
    teams: ['Team A', 'Team B'], venue: 'TBA', battingTeam: 'Team A',
  });

  const [userScore, setUserScore] = useState(0);
  const [predictorScore, setPredictorScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctPredictions, setCorrectPredictions] = useState(0);
  const [totalBallsCalled, setTotalBallsCalled] = useState(0);
  const [matchScoreInfo, setMatchScoreInfo] = useState({ runs: 0, wickets: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [userPrediction, setUserPrediction] = useState<'Dot' | 'Boundary' | 'Wicket' | 'Other' | null>(null);
  const [predictorPrediction, setPredictorPrediction] = useState<string>('');
  const [isBallPlaying, setIsBallPlaying] = useState(false);
  const [isAIFetching, setIsAIFetching] = useState(false);
  const [ballPendingDelay, setBallPendingDelay] = useState(false);
  const [shake, setShake] = useState(false);
  const [askingPanel, setAskingPanel] = useState(false);
  const [recentBalls, setRecentBalls] = useState<{ run: string; c: string; over: number }[]>([]);
  const [outcomeFlash, setOutcomeFlash] = useState<'correct' | 'wrong' | null>(null);
  const [floatingScores, setFloatingScores] = useState<{ val: string; id: number }[]>([]);
  const [streakBanner, setStreakBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!streakBanner) return;
    const t = setTimeout(() => setStreakBanner(null), 2200);
    return () => clearTimeout(t);
  }, [streakBanner]);

  // IPL theme plays everywhere; Rohit intro fires once on entering live
  useEffect(() => {
    startBgAudio();
    if (screen === 'live' && !rohitIntroPlayedRef.current) {
      rohitIntroPlayedRef.current = true;
      setTimeout(() => playClip('/audio/rohit.wav', 0.9), 300);
    }
  }, [screen]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingReactionsRef = useRef<{ statsNerd: string; roastAgent: string; predictor: string } | null>(null);
  const rohitIntroPlayedRef = useRef(false);

  useEffect(() => {
    fetch('/data/match.json')
      .then(res => res.json())
      .then(data => {
        const parsedBalls = parseCricsheet(data).map(ball => {
          // Keep wickets and extras exact (proactive interventions key off batter/bowler/outcome)
          if (ball.isWicket || ball.extra) return ball;
          if (ball.isBoundary) {
            // Randomly 4 or 6
            const runs = Math.random() < 0.38 ? 6 : 4;
            return { ...ball, runs };
          }
          if (ball.isDot) return ball;
          // "Other" singles/twos/threes — randomise within cricket-realistic range
          const r = Math.random();
          const runs = r < 0.55 ? 1 : r < 0.85 ? 2 : 3;
          return { ...ball, runs };
        });
        setBalls(parsedBalls);
        const teams = data?.info?.teams ?? ['Team A', 'Team B'];
        const battingTeam = data?.innings?.[0]?.team ?? teams[0];
        setMatchInfo({
          teams: [teams[0] ?? 'Team A', teams[1] ?? 'Team B'],
          venue: data?.info?.venue ?? 'Stadium',
          battingTeam,
        });
      })
      .catch(err => console.error("Failed to load match data", err));
  }, []);

  const addFeedItem = (agentId: FeedItem['agentId'], message: string, extra?: Partial<FeedItem>) => {
    setFeed(prev => [...prev, { id: Math.random().toString() + Date.now(), agentId, message, ...extra }]);
  };

  const currentBall = balls[currentBallIndex] || null;
  const speed = SPEEDS[speedIndex];
  const ballIntervalMs = BASE_INTERVAL_MS / speed;

  const playNextBall = useCallback(async (forcedPrediction?: string) => {
    if (currentBallIndex >= balls.length || isAIFetching) return;
    stopEventClip();
    stopCrowd();
    setIsBallPlaying(true);
    setIsAIFetching(true);

    const ball = balls[currentBallIndex];
    const newRuns = matchScoreInfo.runs + ball.runs;
    const newWickets = matchScoreInfo.wickets + (ball.isWicket ? 1 : 0);
    setMatchScoreInfo({ runs: newRuns, wickets: newWickets });

    // Ball outcome display — wides/no-balls/leg-byes get distinct glyphs
    let ballDisplay: string;
    let ballColor: string;
    if (ball.isWicket) {
      ballDisplay = "W"; ballColor = "var(--red-1)";
    } else if (ball.extra === 'wide') {
      ballDisplay = `${ball.runs}wd`; ballColor = "var(--stats)";
    } else if (ball.extra === 'noball') {
      ballDisplay = `${ball.runs}nb`; ballColor = "var(--roast)";
    } else if (ball.extra === 'legbye') {
      ballDisplay = `${ball.runs}lb`; ballColor = "var(--light-3)";
    } else if (ball.extra === 'bye') {
      ballDisplay = `${ball.runs}b`; ballColor = "var(--light-3)";
    } else if (ball.isDot) {
      ballDisplay = "·"; ballColor = "var(--dot)";
    } else if (ball.isBoundary) {
      ballDisplay = String(ball.runs); ballColor = "var(--boundary)";
    } else {
      ballDisplay = String(ball.runs); ballColor = "var(--light-2)";
    }
    setRecentBalls(prev => {
      const next = [...prev, { run: ballDisplay, c: ballColor, over: ball.over }];
      // Keep last 24 balls (4 overs of context) — UI filters/groups by `over`
      return next.length > 24 ? next.slice(-24) : next;
    });

    if (ball.isWicket) { playWicket(); setTimeout(() => playEventClip('/audio/kolkata.wav', 0.85), 400); }
    else if (ball.isBoundary) { playBoundary(); setTimeout(() => playEventClip('/audio/mumbai.wav', 0.85), 300); }

    const actualUserPrediction = forcedPrediction || userPrediction || 'None';
    const userWasCorrect = actualUserPrediction === ball.outcome;
    
    let pScoreDelta = 0;
    const pChoiceMatch = predictorPrediction.match(/\b(Dot|Boundary|Wicket|Other)\b/i);
    const pChoice = pChoiceMatch ? pChoiceMatch[0] : null;
    const predictorWasCorrect = pChoice && pChoice.toLowerCase() === ball.outcome.toLowerCase();

    let uScoreDelta = 0;
    if (actualUserPrediction !== 'None') {
      setTotalBallsCalled(prev => prev + 1);
      if (userWasCorrect) {
        uScoreDelta = 10;
        setUserScore(s => s + 10);
        setCorrectPredictions(prev => prev + 1);
        setStreak(s => {
          const next = s + 1;
          setBestStreak(b => Math.max(b, next));
          // Escalating streak celebrations
          if (next >= 7) {
            setTimeout(playStreak5, 0);
            setStreakBanner('UNSTOPPABLE 🔥🔥🔥');
            confetti({ particleCount: 300, spread: 140, startVelocity: 50, origin: { y: 0.5 } });
            confetti({ particleCount: 150, spread: 100, startVelocity: 40, origin: { x: 0.1, y: 0.6 } });
            confetti({ particleCount: 150, spread: 100, startVelocity: 40, origin: { x: 0.9, y: 0.6 } });
          } else if (next >= 5) {
            setTimeout(playStreak5, 0);
            setStreakBanner('ON FIRE 🔥🔥');
            confetti({ particleCount: 180, spread: 110, startVelocity: 45, origin: { y: 0.55 } });
          } else if (next >= 3) {
            setTimeout(playStreak3, 0);
            setStreakBanner('HOT STREAK 🔥');
            confetti({ particleCount: 120, spread: 90, startVelocity: 40, origin: { y: 0.6 } });
          } else {
            setTimeout(playCorrect, 200);
            confetti({ particleCount: 80, spread: 70, startVelocity: 35, origin: { y: 0.6 } });
          }
          return next;
        });
        // Green flash + floating +10
        setOutcomeFlash('correct');
        setTimeout(() => setOutcomeFlash(null), 600);
        const fid = Date.now();
        setFloatingScores(prev => [...prev, { val: '+10', id: fid }]);
        setTimeout(() => setFloatingScores(prev => prev.filter(f => f.id !== fid)), 1600);
      } else {
        setStreak(0);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        // Near miss — called Boundary got single, called Wicket got dot, etc.
        const isNearMiss =
          (actualUserPrediction === 'Boundary' && ball.outcome === 'Other') ||
          (actualUserPrediction === 'Wicket' && ball.outcome === 'Dot') ||
          (actualUserPrediction === 'Dot' && ball.outcome === 'Other');
        setTimeout(isNearMiss ? playNearMiss : playWrong, 200);
        setOutcomeFlash('wrong');
        setTimeout(() => setOutcomeFlash(null), 500);
      }
    }

    if (predictorWasCorrect) {
      pScoreDelta = 10;
      setPredictorScore(s => s + 10);
    }

    // ── Add ball divider to feed ──
    const overLabel = `${ball.over}.${ball.ball}`;
    const wicketDetail = ball.wicketInfo ? ` · ${ball.wicketInfo.playerOut} ${ball.wicketInfo.kind}` : '';
    const runsDetail = ball.outcome === 'Boundary' ? `${ball.runs} runs` : ball.outcome === 'Other' ? `${ball.runs} run${ball.runs !== 1 ? 's' : ''}` : '';
    const dividerLabel = `OV ${overLabel} · ${ball.batter} → ${ball.outcome}${wicketDetail}${runsDetail ? ` · ${runsDetail}` : ''}`;
    addFeedItem('ballDivider', '', {
      ballOutcome: ball.outcome,
      ballRuns: ball.runs,
      ballLabel: dividerLabel,
      userCorrect: actualUserPrediction !== 'None' ? userWasCorrect : undefined,
    });

    const matchContext: MatchContext = {
      over: ball.over,
      score: `${newRuns}/${newWickets}`,
      userScoreTotal: userScore + uScoreDelta,
      predictorScoreTotal: predictorScore + pScoreDelta
    };

    try {
      const reactions = pendingReactionsRef.current || await submitReaction(ball, actualUserPrediction, predictorPrediction, matchContext);
      pendingReactionsRef.current = null;

      addFeedItem('statsNerd', reactions.statsNerd);
      addFeedItem('roastAgent', reactions.roastAgent);
      addFeedItem('predictor', reactions.predictor);

      // Play pre-fetched TTS buffer if ready, otherwise browser speech fallback
      const toSpeak = [
        { id: 'statsNerd', msg: reactions.statsNerd },
        { id: 'roastAgent', msg: reactions.roastAgent },
        { id: 'predictor', msg: reactions.predictor }
      ];
      const speaker = toSpeak[Math.floor(Math.random() * toSpeak.length)];
      speakMessage(speaker.id, speaker.msg);
    } catch (e) {
      console.error(e);
      addFeedItem('roastAgent', "API choked. The agents are all stuck in traffic.");
    }

    setIsAIFetching(false);
    setIsBallPlaying(false);
    setUserPrediction(null);
    setPredictorPrediction('');
    setCurrentBallIndex(i => i + 1);
  }, [balls, currentBallIndex, userPrediction, predictorPrediction, matchScoreInfo, userScore, predictorScore, isAIFetching]);

  const forcePlayNextBall = useCallback((p: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    playNextBall(p);
  }, [playNextBall]);

  useEffect(() => {
    if (userPrediction && !isAIFetching && !isBallPlaying && !ballPendingDelay) {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      if (pendingDelayRef.current) { clearTimeout(pendingDelayRef.current); pendingDelayRef.current = null; }
      pendingReactionsRef.current = null;
      cancelCurrentTTS();
      pauseBgAudio();
      playCrowd();
      setBallPendingDelay(true);

      // Fire reactions API + TTS fetch during the 3s window so both are ready on reveal
      const ball = balls[currentBallIndex];
      if (ball) {
        const matchCtx = {
          over: ball.over,
          score: `${matchScoreInfo.runs}/${matchScoreInfo.wickets}`,
          userScoreTotal: userScore, predictorScoreTotal: predictorScore,
        };
        submitReaction(ball, userPrediction, predictorPrediction, matchCtx)
          .then(reactions => {
            pendingReactionsRef.current = reactions;
            const speakers = [
              { id: 'statsNerd', msg: reactions.statsNerd },
              { id: 'roastAgent', msg: reactions.roastAgent },
              { id: 'predictor', msg: reactions.predictor },
            ];
            const pick = speakers[Math.floor(Math.random() * speakers.length)];
            const abort = new AbortController();
            _ttsAbort = abort;
            fetchTTSBuffer(pick.id, pick.msg, abort.signal);
          })
          .catch(() => {});
      }

      pendingDelayRef.current = setTimeout(() => {
        setBallPendingDelay(false);
        playNextBall(userPrediction);
      }, 3000);
    }
  }, [userPrediction, isAIFetching, isBallPlaying, ballPendingDelay, playNextBall, balls, currentBallIndex, matchScoreInfo, userScore, predictorScore, predictorPrediction]);

  useEffect(() => {
    if (screen !== 'live' || isPaused || balls.length === 0 || currentBallIndex >= balls.length || isAIFetching) {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      return;
    }

    if (!predictorPrediction && !isBallPlaying) {
      setTimeout(() => setIsAIFetching(true), 0);
      stopEventClip();
      const ball = balls[currentBallIndex];
      const matchContext: MatchContext = {
        over: ball.over,
        score: `${matchScoreInfo.runs}/${matchScoreInfo.wickets}`,
        userScoreTotal: userScore, predictorScoreTotal: predictorScore
      };
      fetchNextPrediction(matchContext, ball).then(res => {
        setPredictorPrediction(res.prediction);
        if (res.proactive) {
          addFeedItem('statsNerd', res.proactive, { isProactive: true });
        }
        setIsAIFetching(false);
        timerRef.current = setTimeout(playNextBall, ballIntervalMs);
      }).catch(e => {
        console.error(e);
        setPredictorPrediction('Other');
        setIsAIFetching(false);
        timerRef.current = setTimeout(playNextBall, ballIntervalMs);
      });
      return;
    }

    if (!timerRef.current && !isBallPlaying) {
      timerRef.current = setTimeout(playNextBall, ballIntervalMs);
    }

    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };
  }, [screen, isPaused, balls, currentBallIndex, isAIFetching, playNextBall, ballIntervalMs, predictorPrediction, isBallPlaying, matchScoreInfo.runs, matchScoreInfo.wickets, predictorScore, userScore]);

  // Check for match over
  useEffect(() => {
    if (screen === 'live' && balls.length > 0 && currentBallIndex >= balls.length) {
      setTimeout(() => setScreen('recap'), 0);
    }
  }, [screen, balls, currentBallIndex]);

  const handleAsk = async (question: string) => {
    if (askingPanel) return;
    setAskingPanel(true);
    addFeedItem('user', question);
    const matchContext: MatchContext = {
      over: currentBall?.over ?? 0,
      score: `${matchScoreInfo.runs}/${matchScoreInfo.wickets}`,
      userScoreTotal: userScore, predictorScoreTotal: predictorScore,
    };
    try {
      const answers = await askPanel(question, matchContext);
      
      const toSpeak = [
        { id: 'statsNerd', msg: answers.statsNerd },
        { id: 'roastAgent', msg: answers.roastAgent },
        { id: 'predictor', msg: answers.predictor }
      ];
      const speaker = toSpeak[Math.floor(Math.random() * toSpeak.length)];
      speakMessage(speaker.id, speaker.msg);

      addFeedItem('statsNerd', answers.statsNerd);
      addFeedItem('roastAgent', answers.roastAgent);
      addFeedItem('predictor', answers.predictor);
    } catch (e) {
      console.error(e);
      addFeedItem('roastAgent', "Network choked on that question.");
    } finally { setAskingPanel(false); }
  };

  const isInMatch = currentBallIndex > 0 && currentBallIndex < balls.length;

  const handleNavigate = (id: string) => {
    if (id === 'panel') setScreen('panel');
    else if (id === 'matches') setScreen(isInMatch ? 'live' : 'home');
    else if (id === 'you') setScreen('you');
  };

  const matchScore = `${matchScoreInfo.runs}/${matchScoreInfo.wickets}`;

  return (
    <div style={{
      width: "100%", height: "100dvh",
      position: "relative", overflow: "hidden",
      animation: shake ? "sl-shake 0.5s ease-in-out" : undefined,
    }}>

      {/* Screen flash on correct/wrong */}
      {outcomeFlash && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 997, pointerEvents: 'none',
          background: outcomeFlash === 'correct' ? 'rgba(50,255,120,0.16)' : 'rgba(255,50,50,0.13)',
          animation: `${outcomeFlash === 'correct' ? 'sl-flash-green' : 'sl-flash-red'} 0.55s ease-out forwards`,
        }} />
      )}

      {/* Floating +10 score popup */}
      {floatingScores.map(f => (
        <div key={f.id} style={{
          position: 'fixed', bottom: 200, left: '50%',
          fontFamily: 'var(--f-display)', fontSize: 34, fontWeight: 800,
          color: 'var(--pitch-1)', zIndex: 999, pointerEvents: 'none',
          letterSpacing: -0.02,
          animation: 'sl-float-score 1.5s ease-out forwards',
          textShadow: '0 0 20px rgba(50,255,120,0.5)',
        }}>{f.val}</div>
      ))}

      {/* Streak milestone banner */}
      {streakBanner && (
        <div style={{
          position: 'fixed', top: '38%', left: '50%',
          zIndex: 999, pointerEvents: 'none',
          fontFamily: 'var(--f-display)', fontSize: 42, fontWeight: 800,
          letterSpacing: -0.02, whiteSpace: 'nowrap',
          animation: 'sl-streak-pop 2.2s ease-out forwards',
          textShadow: '0 0 40px rgba(50,255,120,0.7), 0 2px 12px rgba(0,0,0,0.9)',
          color: 'var(--light-0)',
        }}>{streakBanner}</div>
      )}

      {/* 3s timer drain bar at top */}
      {ballPendingDelay && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 1000, pointerEvents: 'none', background: 'var(--ink-2)' }}>
          <div style={{ height: '100%', background: 'var(--pitch-1)', animation: 'sl-timer-drain 3s linear forwards' }} />
        </div>
      )}

      {/* Playing the ball toast */}
      {ballPendingDelay && (
        <div style={{
          position: 'fixed', bottom: 96, left: '50%', transform: 'translateX(-50%)',
          zIndex: 999, pointerEvents: 'none',
          background: 'var(--ink-1)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 100, padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--f-mono)', fontSize: 12, letterSpacing: '0.06em',
          color: 'var(--light-2)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          animation: 'sl-fade-up 0.2s ease',
        }}>
          <span className="sl-live-dot" style={{ background: 'var(--pitch-1)', flexShrink: 0 }} />
          Playing the ball...
        </div>
      )}

      {screen === 'onboarding' && (
        isDesktop ? (
          <OnboardingDesktop onStart={() => setScreen('home')} />
        ) : (
          <ScreenOnboarding onStart={() => setScreen('home')} />
        )
      )}

      {screen === 'home' && (
        isDesktop ? (
          <HomeDesktop
            teams={matchInfo.teams}
            venue={matchInfo.venue}
            battingTeam={matchInfo.battingTeam}
            userScore={userScore}
            predictorScore={predictorScore}
            matchesPlayed={1}
            onJoinMatch={() => setScreen('matchDetail')}
            onNavigate={handleNavigate}
            onUserProfile={() => setScreen('you')}
          />
        ) : (
          <ScreenHome
            teams={matchInfo.teams}
            venue={matchInfo.venue}
            battingTeam={matchInfo.battingTeam}
            userScore={userScore}
            predictorScore={predictorScore}
            matchesPlayed={1}
            onJoinMatch={() => setScreen('matchDetail')}
            onNavigate={handleNavigate}
            onUserProfile={() => setScreen('you')}
          />
        )
      )}

      {screen === 'matchDetail' && (
        isDesktop ? (
          <MatchDetailDesktop
            teams={matchInfo.teams}
            venue={matchInfo.venue}
            battingTeam={matchInfo.battingTeam}
            onStart={() => setScreen('live')}
            onBack={() => setScreen('home')}
            onNavigate={handleNavigate}
            onUserProfile={() => setScreen('you')}
          />
        ) : (
          <ScreenMatchDetail
            teams={matchInfo.teams}
            venue={matchInfo.venue}
            battingTeam={matchInfo.battingTeam}
            onStart={() => setScreen('live')}
            onBack={() => setScreen('home')}
          />
        )
      )}

      {screen === 'live' && (
        isDesktop ? (
          <LiveDesktop
            ball={currentBall}
            matchScore={matchScore}
            battingTeam={matchInfo.battingTeam}
            teams={matchInfo.teams}
            userScore={userScore}
            predictorScore={predictorScore}
            streak={streak}
            userPrediction={userPrediction}
            predictorPrediction={predictorPrediction}
            onPredict={(p) => { playClip('/audio/crowd.wav', 0.7); setUserPrediction(p); }}
            feed={feed}
            isBallPlaying={isBallPlaying || ballPendingDelay}
            isAIFetching={isAIFetching}
            onAskPanel={() => setScreen('askPanel')}
            recentBalls={recentBalls}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
            speed={speed}
            onToggleSpeed={() => setSpeedIndex(s => (s + 1) % SPEEDS.length)}
            onExit={() => setScreen('home')}
            onUserProfile={() => setScreen('you')}
          />
        ) : (
          <ScreenLivePreball
            ball={currentBall}
            matchScore={matchScore}
            userScore={userScore}
            predictorScore={predictorScore}
            streak={streak}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
            speed={speed}
            onToggleSpeed={() => setSpeedIndex(s => (s + 1) % SPEEDS.length)}
            userPrediction={userPrediction}
            predictorPrediction={predictorPrediction}
            onPredict={(p) => { playClip('/audio/crowd.wav', 0.7); setUserPrediction(p); }}
            feed={feed}
            isBallPlaying={isBallPlaying || ballPendingDelay}
            isAIFetching={isAIFetching}
            onBack={() => setScreen('home')}
            onAskPanel={() => setScreen('askPanel')}
            onNavigate={handleNavigate}
            recentBalls={recentBalls}
            forcePlayNextBall={forcePlayNextBall}
          />
        )
      )}

      {screen === 'askPanel' && (
        isDesktop ? (
          <AskPanelDesktop
            feed={feed}
            matchScore={matchScore}
            over={currentBall ? `${currentBall.over}.${currentBall.ball}` : "0.0"}
            onAsk={handleAsk}
            onBack={() => setScreen('live')}
            disabled={askingPanel || isBallPlaying || isAIFetching}
            onNavigate={handleNavigate}
            onUserProfile={() => setScreen('you')}
          />
        ) : (
          <ScreenAskPanel
            feed={feed}
            matchScore={matchScore}
            over={currentBall ? `${currentBall.over}.${currentBall.ball}` : "0.0"}
            onAsk={handleAsk}
            onBack={() => setScreen('live')}
            disabled={askingPanel || isBallPlaying || isAIFetching}
          />
        )
      )}

      {screen === 'recap' && (
        isDesktop ? (
          <RecapDesktop
            userScore={userScore}
            predictorScore={predictorScore}
            streak={bestStreak}
            teams={matchInfo.teams}
            onBack={() => setScreen('home')}
            onNavigate={handleNavigate}
            onUserProfile={() => setScreen('you')}
          />
        ) : (
          <ScreenRecap
            userScore={userScore}
            predictorScore={predictorScore}
            streak={bestStreak}
            teams={matchInfo.teams}
            onBack={() => setScreen('home')}
          />
        )
      )}

      {screen === 'panel' && (
        isDesktop ? (
          <PanelDesktop
            onBack={() => setScreen(isInMatch ? 'live' : 'home')}
            onNavigate={handleNavigate}
            onUserProfile={() => setScreen('you')}
          />
        ) : (
          <ScreenPanel onBack={() => setScreen(isInMatch ? 'live' : 'home')} />
        )
      )}

      {screen === 'you' && (
        isDesktop ? (
          <YouDesktop
            userScore={userScore}
            predictorScore={predictorScore}
            bestStreak={bestStreak}
            matchesPlayed={1}
            totalBalls={totalBallsCalled}
            correctPredictions={correctPredictions}
            onBack={() => setScreen(isInMatch ? 'live' : 'home')}
            onNavigate={handleNavigate}
            onUserProfile={() => setScreen('you')}
          />
        ) : (
          <ScreenYou
            userScore={userScore}
            predictorScore={predictorScore}
            bestStreak={bestStreak}
            matchesPlayed={1}
            totalBalls={totalBallsCalled}
            correctPredictions={correctPredictions}
            onBack={() => setScreen(isInMatch ? 'live' : 'home')}
          />
        )
      )}
    </div>
  );
}
