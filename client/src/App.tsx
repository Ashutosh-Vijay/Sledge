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
  tone(440, 0.1, 'square', 0.1); 
  setTimeout(() => tone(554, 0.1, 'square', 0.1), 100); 
  setTimeout(() => tone(659, 0.2, 'square', 0.15), 200); 
};
const playWicket = () => { 
  tone(220, 0.4, 'sawtooth', 0.25); 
  tone(233, 0.4, 'sawtooth', 0.25); 
  setTimeout(() => { tone(110, 0.5, 'sawtooth', 0.3); tone(116, 0.5, 'sawtooth', 0.3); }, 200);
};
const playCorrect = () => { 
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, i) => setTimeout(() => tone(freq, 0.15, 'sine', 0.2), i * 80));
};
const playWrong = () => { 
  tone(200, 0.2, 'sawtooth', 0.2);
  setTimeout(() => tone(150, 0.3, 'sawtooth', 0.2), 150);
  setTimeout(() => tone(100, 0.4, 'sawtooth', 0.3), 300);
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const speakMessage = async (agentId: string, message: string) => {
  if (typeof window === 'undefined') return;
  const sanitizedMessage = message.replace(/\//g, " or ");
  console.log(`[TTS] Requesting audio for ${agentId}:`, sanitizedMessage.substring(0, 50));
  try {
    const res = await fetch(`${API_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sanitizedMessage })
    });
    
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data.audio) {
      console.log(`[TTS] Audio received, length:`, data.audio.length);
      if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      const binaryString = atob(data.audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }
      
      const buffer = audioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      
      if (agentId === 'statsNerd' || agentId === 'stats') {
        source.playbackRate.value = 0.85;
      } else if (agentId === 'roastAgent' || agentId === 'roast') {
        source.playbackRate.value = 1.15;
      } else {
        source.playbackRate.value = 1.0;
      }
      
      source.connect(audioCtx.destination);
      
      return new Promise((resolve) => {
        source.onended = resolve;
        source.start(0);
      });
    } else {
      throw new Error("API returned null audio");
    }
  } catch (err) {
    console.error('TTS playback failed:', err);
    console.log('[TTS] Falling back to browser SpeechSynthesis');
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(sanitizedMessage);
      
      // Try to find an Indian English voice
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));
      if (indianVoice) utterance.voice = indianVoice;
      
      const rates: Record<string, number> = { statsNerd: 0.85, roastAgent: 1.15, predictor: 1.0 };
      utterance.rate = rates[agentId] || 1.0;
      
      const pitches: Record<string, number> = { statsNerd: 0.5, roastAgent: 1.5, predictor: 1.0 };
      utterance.pitch = pitches[agentId] || 1.0;

      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
    });
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
  const [shake, setShake] = useState(false);
  const [askingPanel, setAskingPanel] = useState(false);
  const [recentBalls, setRecentBalls] = useState<{ run: string; c: string; over: number }[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/data/match.json')
      .then(res => res.json())
      .then(data => {
        const parsedBalls = parseCricsheet(data);
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

    if (ball.isWicket) playWicket();
    else if (ball.isBoundary) playBoundary();

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
          return next;
        });
        confetti({ particleCount: 80, spread: 70, startVelocity: 35, origin: { y: 0.6 } });
        setTimeout(playCorrect, 200);
      } else {
        setStreak(0);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setTimeout(playWrong, 200);
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
      const reactions = await submitReaction(ball, actualUserPrediction, predictorPrediction, matchContext);
      
      addFeedItem('statsNerd', reactions.statsNerd);
      addFeedItem('roastAgent', reactions.roastAgent);
      addFeedItem('predictor', reactions.predictor);

      const toSpeak = [
        { id: 'statsNerd', msg: reactions.statsNerd },
        { id: 'roastAgent', msg: reactions.roastAgent },
        { id: 'predictor', msg: reactions.predictor }
      ];
      const speaker = toSpeak[Math.floor(Math.random() * toSpeak.length)];
      
      // Let speakMessage run without blocking the UI, but we can await it 
      // if we want to delay the NEXT ball from starting.
      // The user wants audio fast, and UI to update immediately.
      await speakMessage(speaker.id, speaker.msg);
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
    if (userPrediction && !isAIFetching && !isBallPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      playNextBall(userPrediction);
    }
  }, [userPrediction, isAIFetching, isBallPlaying, playNextBall]);

  useEffect(() => {
    if (screen !== 'live' || isPaused || balls.length === 0 || currentBallIndex >= balls.length || isAIFetching) {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      return;
    }

    if (!predictorPrediction && !isBallPlaying) {
      setTimeout(() => setIsAIFetching(true), 0);
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
            onPredict={(p) => setUserPrediction(p)}
            feed={feed}
            isBallPlaying={isBallPlaying}
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
            onPredict={(p) => setUserPrediction(p)}
            feed={feed}
            isBallPlaying={isBallPlaying}
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
