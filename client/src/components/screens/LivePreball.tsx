import React from 'react';
import { AgentAvatar, AgentLine, Ic, Pill, Side, BottomMini, type AgentId } from '../Shared';
import type { Ball } from '../../types';

// ── ScoreBar ─────────────────────────────────────────────────
export function ScoreBar({ over, batter, nonStriker, bowler, score, you, ai, streak, isPaused, onTogglePause, speed, onToggleSpeed, onBack, onAskPanel }: {
  over: string; batter: string; nonStriker: string; bowler: string; score: string;
  you: number; ai: number; streak: number;
  isPaused: boolean; onTogglePause: () => void;
  speed: number; onToggleSpeed: () => void;
  onBack: () => void;
  onAskPanel: () => void;
}) {
  return (
    <div style={{
      background: "linear-gradient(180deg, var(--ink-1) 0%, var(--ink-0) 100%)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      flexShrink: 0,
    }}>
      <div className="sl-content" style={{ padding: "10px 16px 12px" }}>
      {/* top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div onClick={onBack} style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ink-2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--light-2)" }}>
            <Ic.back />
          </div>
          <span className="sl-live-dot" />
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: 0.08, color: "var(--red-0)", textTransform: "uppercase" as const }}>Live</span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--light-2)", marginLeft: 4 }}>{over}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Pill><div onClick={onAskPanel} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Ic.spark /> <span style={{ fontFamily: "var(--f-mono)", fontSize: 10 }}>Ask</span></div></Pill>
          <Pill><div onClick={onTogglePause} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>{isPaused ? "▶" : <Ic.pause />}</div></Pill>
          <Pill><div onClick={onToggleSpeed} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Ic.fast /> <span style={{ fontFamily: "var(--f-mono)", fontSize: 10 }}>{speed}×</span></div></Pill>
        </div>
      </div>

      {/* score row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span className="sl-mono" style={{ fontSize: 22, color: "var(--light-0)", fontWeight: 500, letterSpacing: -0.01 }}>{score}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--light-2)", marginTop: 1, letterSpacing: -0.01 }}>
            <span style={{ color: "var(--light-0)" }}>{batter}</span>
            <span style={{ color: "var(--light-3)" }}> · {nonStriker}</span>
            <span style={{ color: "var(--ink-5)" }}> v </span>
            <span style={{ color: "var(--light-3)" }}>{bowler}</span>
          </div>
        </div>
      </div>

      {/* you vs AI score bar */}
      <div style={{
        marginTop: 10, padding: "8px 10px",
        background: "var(--ink-2)", borderRadius: 10,
        display: "flex", alignItems: "center", gap: 10,
        border: "1px solid rgba(255,255,255,0.04)",
      }}>
        <Side label="YOU" value={you} color="var(--pitch-1)" align="left" />
        <div style={{ flex: 1, position: "relative", height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${you + ai > 0 ? (you / (you + ai)) * 100 : 50}%`, background: "var(--pitch-1)", borderRadius: 2, transition: "width 0.3s ease" }} />
        </div>
        <Side label="AI" value={ai} color="var(--predict)" align="right" />
        {streak > 1 && (
          <div style={{
            marginLeft: 4, padding: "3px 7px", borderRadius: 999,
            background: "var(--red-bg)", color: "var(--red-0)",
            fontFamily: "var(--f-mono)", fontSize: 10, fontWeight: 500, letterSpacing: 0.04,
          }}>🔥{streak}</div>
        )}
      </div>
      </div>
    </div>
  );
}

// ── CallCard ─────────────────────────────────────────────────
function CallCard({ who, value, confidence, tint, locked, thinking }: {
  who: string; value: string; confidence: string; tint: string;
  locked?: boolean; thinking?: boolean; isUser?: boolean;
}) {
  return (
    <div style={{
      flex: 1, borderRadius: 16, padding: "12px 12px",
      background: thinking ? "linear-gradient(135deg, var(--ink-2), var(--ink-1))" : "var(--ink-2)",
      border: `1px solid ${thinking ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)"}`,
      position: "relative", overflow: "hidden", minHeight: 96,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 0.1, color: "var(--light-3)" }}>{who}</div>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: tint, opacity: locked || !thinking ? 1 : 0.5 }} />
      </div>
      {thinking ? (
        <>
          <div style={{ marginTop: 18, display: "flex", alignItems: "baseline", gap: 4, height: 26 }}>
            {[0, 1, 2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: 4, background: "var(--predict)", animation: `sl-pulse-dot 1.1s ${i * 0.15}s ease-in-out infinite` }} />)}
          </div>
          <div style={{ marginTop: 12, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", letterSpacing: 0.04 }}>predictor thinking</div>
        </>
      ) : (
        <>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 24, color: tint, fontWeight: 600, letterSpacing: -0.02, lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", marginTop: 8, letterSpacing: 0.04 }}>{confidence}</div>
          </div>
          <div style={{ position: "absolute", bottom: -20, right: -20, width: 80, height: 80, borderRadius: 40, border: `1px solid ${tint}`, opacity: 0.12 }} />
        </>
      )}
    </div>
  );
}

// ── BallStrip ────────────────────────────────────────────────
function BallStrip({ balls, currentOver }: { balls: { run: string; c: string; over: number }[]; currentOver: number }) {
  const thisOver = balls.filter(b => b.over === currentOver);
  if (thisOver.length === 0) return null;
  return (
    <div style={{
      marginTop: 6, padding: "9px 12px",
      background: "var(--ink-1)", borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.04)",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)", letterSpacing: 0.06 }}>OV {currentOver} · BALL {thisOver.length}</div>
      <div style={{ display: "flex", gap: 4 }}>
        {thisOver.map((b, i) => (
          <div key={i} style={{
            minWidth: 22, height: 22, padding: b.run.length > 1 ? "0 4px" : 0, borderRadius: 6,
            background: b.run === "·" ? "var(--ink-3)" : "transparent",
            border: b.run === "·" ? "1px solid rgba(255,255,255,0.04)" : `1px solid ${b.c}`,
            color: b.c, fontFamily: "var(--f-mono)", fontSize: 10, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{b.run}</div>
        ))}
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          border: "1px dashed rgba(255,255,255,0.18)",
          color: "var(--light-3)", fontFamily: "var(--f-mono)", fontSize: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>?</div>
      </div>
    </div>
  );
}

// ── PredictionButtons ────────────────────────────────────────
export function PredictionButtons({ selected, disabled, onPredict }: {
  selected: string | null; disabled: boolean;
  onPredict?: (choice: 'Dot' | 'Boundary' | 'Wicket' | 'Other') => void;
}) {
  const choices = [
    { id: "Dot" as const,      glyph: "·",  sub: "no run" },
    { id: "Boundary" as const, glyph: "4",  sub: "or six" },
    { id: "Wicket" as const,   glyph: "W",  sub: "out" },
    { id: "Other" as const,    glyph: "Other", sub: "extras/runs" },
  ];
  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
    <div className="sl-content" style={{ padding: "12px 14px 10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)", letterSpacing: 0.08, textTransform: "uppercase" as const }}>Your call · lock in</div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--pitch-1)", letterSpacing: 0.06 }}>+10 if correct</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
        {choices.map(c => {
          const isSel = selected === c.id;
          return (
            <button key={c.id} disabled={disabled} onClick={() => onPredict?.(c.id)} style={{
              border: "none", cursor: disabled ? "not-allowed" : "pointer",
              background: isSel ? "var(--light-0)" : "var(--ink-2)",
              color: isSel ? "var(--ink-0)" : "var(--light-1)",
              borderRadius: 14, padding: "12px 0 10px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              boxShadow: isSel ? "0 0 0 1px var(--pitch-1), 0 6px 24px oklch(0.78 0.18 142 / 0.25)" : "inset 0 0 0 1px rgba(255,255,255,0.04)",
              transition: "transform .12s ease",
              fontFamily: "var(--f-display)",
              opacity: disabled && !isSel ? 0.5 : 1,
            }}>
              <span style={{ fontSize: c.id === 'Other' ? 16 : 22, fontWeight: 600, letterSpacing: -0.02, lineHeight: 1 }}>{c.glyph}</span>
              <span style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: -0.01 }}>{c.id}</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: isSel ? "var(--ink-3)" : "var(--light-3)", letterSpacing: 0.06, textTransform: "uppercase" as const }}>{c.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
    </div>
  );
}

// ── Feed Types ───────────────────────────────────────────────
export type FeedItem = {
  id: string;
  agentId: 'statsNerd' | 'roastAgent' | 'predictor' | 'user' | 'ballDivider';
  message: string;
  // only for ballDivider
  ballOutcome?: string;
  ballRuns?: number;
  ballLabel?: string;
  userCorrect?: boolean;
  // only for proactive
  isProactive?: boolean;
};

const AGENT_MAP: Record<string, AgentId> = {
  statsNerd: 'stats',
  roastAgent: 'roast',
  predictor: 'predict',
};

// ── Ball Divider ─────────────────────────────────────────────
function BallDivider({ label, outcome, runs, userCorrect }: { label: string; outcome: string; runs: number; userCorrect?: boolean }) {
  const outcomeColor = outcome === 'Wicket' ? 'var(--red-1)' : outcome === 'Boundary' ? 'var(--boundary)' : outcome === 'Dot' ? 'var(--dot)' : 'var(--light-2)';
  const runLabel = outcome === 'Wicket' ? 'W' : outcome === 'Dot' ? '·' : String(runs);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 0",
    }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "4px 10px", borderRadius: 8,
        background: "var(--ink-1)", border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: 6,
          background: outcomeColor === 'var(--dot)' ? "var(--ink-3)" : "transparent",
          border: `1.5px solid ${outcomeColor}`,
          color: outcomeColor, fontFamily: "var(--f-mono)", fontSize: 10, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{runLabel}</div>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", letterSpacing: 0.06 }}>{label}</span>
        {userCorrect !== undefined && (
          <span style={{
            fontFamily: "var(--f-mono)", fontSize: 10, fontWeight: 600,
            color: userCorrect ? "var(--pitch-1)" : "var(--red-0)",
          }}>{userCorrect ? "✓" : "✕"}</span>
        )}
      </div>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

// ── Main Screen ──────────────────────────────────────────────
export function ScreenLivePreball({
  ball, matchScore, userScore, predictorScore, streak,
  isPaused, onTogglePause, speed, onToggleSpeed,
  userPrediction, predictorPrediction, onPredict,
  feed, isBallPlaying, isAIFetching,
  onBack, onAskPanel, onNavigate,
  recentBalls, forcePlayNextBall,
}: {
  ball: Ball | null;
  matchScore: string;
  userScore: number; predictorScore: number; streak: number;
  isPaused: boolean; onTogglePause: () => void;
  speed: number; onToggleSpeed: () => void;
  userPrediction: string | null;
  predictorPrediction: string;
  onPredict: (choice: 'Dot' | 'Boundary' | 'Wicket' | 'Other') => void;
  feed: FeedItem[];
  isBallPlaying: boolean;
  isAIFetching: boolean;
  onBack: () => void;
  onAskPanel: () => void;
  onNavigate?: (id: string) => void;
  recentBalls: { run: string; c: string; over: number }[];
  forcePlayNextBall: (p: string) => void;
}) {
  const feedEndRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feed]);

  const overStr = ball ? `${ball.over}.${ball.ball} / 20` : "0.0 / 20";
  const pChoice = predictorPrediction.match(/\b(Dot|Boundary|Wicket|Other)\b/i)?.[0] ?? '...';

  return (
    <div className="sl-screen" style={{ overflow: "hidden" }}>
      <ScoreBar
        over={overStr}
        batter={ball?.batter || "-"}
        nonStriker={ball?.nonStriker || "-"}
        bowler={ball?.bowler || "-"}
        score={matchScore}
        you={userScore} ai={predictorScore} streak={streak}
        isPaused={isPaused} onTogglePause={onTogglePause}
        speed={speed} onToggleSpeed={onToggleSpeed}
        onBack={onBack}
        onAskPanel={onAskPanel}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* phase strip */}
        <div className="sl-content" style={{ padding: "12px 16px 4px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 10, color: isAIFetching ? "var(--predict)" : "var(--pitch-1)",
            letterSpacing: 0.08, textTransform: "uppercase" as const,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: isAIFetching ? "var(--predict)" : "var(--pitch-1)", animation: "sl-pulse-dot 0.8s infinite" }} />
            {isAIFetching ? "AI thinking..." : isBallPlaying ? "Ball playing..." : "Make your call"}
          </div>
          <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, transformOrigin: "left", transform: isAIFetching ? "scaleX(0.6)" : "scaleX(1)", background: isAIFetching ? "var(--predict)" : "var(--pitch-1)", transition: "transform 0.5s ease" }} />
          </div>
        </div>

        {/* the two cards */}
        <div className="sl-content" style={{ display: "flex", gap: 12, padding: "8px 16px 12px" }}>
          <CallCard who="YOUR CALL" locked={!!userPrediction} value={userPrediction || "—"} confidence={userPrediction ? "locked in" : "waiting..."} tint="var(--pitch-1)" isUser />
          <CallCard who="AI CALL" value={predictorPrediction ? pChoice : "..."} confidence={predictorPrediction ? "predicted" : "thinking"} tint="var(--predict)" thinking={isAIFetching} />
        </div>

        {/* recent feed */}
        <div className="sl-content" style={{ flex: 1, overflowY: "auto", padding: "6px 16px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
          {feed.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--light-3)", fontFamily: "var(--f-mono)", fontSize: 11, padding: "20px 0", letterSpacing: 0.04 }}>
              Pick a prediction. Agents will react when the ball plays.
            </div>
          )}
          {feed.slice(-24).map((item) => {
            // Ball divider
            if (item.agentId === 'ballDivider') {
              return <BallDivider key={item.id} label={item.ballLabel || ''} outcome={item.ballOutcome || ''} runs={item.ballRuns ?? 0} userCorrect={item.userCorrect} />;
            }
            // User message
            if (item.agentId === 'user') {
              return (
                <div key={item.id} style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    maxWidth: "80%", padding: "10px 14px",
                    background: "var(--light-0)", color: "var(--ink-0)",
                    borderRadius: "16px 16px 4px 16px",
                    fontSize: 13, letterSpacing: -0.01, lineHeight: 1.4, fontWeight: 500,
                  }}>{item.message}</div>
                </div>
              );
            }
            // Agent message
            const agentKey = AGENT_MAP[item.agentId];
            if (!agentKey) return null;
            if (item.isProactive) {
              return (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4, marginBottom: 4 }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: 'var(--stats)', letterSpacing: 0.08, background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: 4, alignSelf: 'flex-start', border: '1px solid rgba(56, 189, 248, 0.2)' }}>⚠️ PROACTIVE INTERVENTION</div>
                  <AgentLine agent={agentKey} message={item.message} mono={item.agentId === 'statsNerd'} />
                </div>
              );
            }
            return <AgentLine key={item.id} agent={agentKey} message={item.message} mono={item.agentId === 'statsNerd'} />;
          })}
          {(isBallPlaying && isAIFetching) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: 0.8, animation: "sl-fade-up .25s ease", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 12, marginTop: 8 }}>
              <div style={{ display: "flex", gap: 10 }}>
                {(['stats', 'roast', 'predict'] as AgentId[]).map(agent => (
                  <AgentAvatar key={agent} agent={agent} size={24} />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: 3, background: "var(--light-2)", animation: `sl-pulse-dot 1.1s ${i * 0.15}s ease-in-out infinite` }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: "var(--light-3)", fontFamily: "var(--f-mono)" }}>Agents analyzing & synthesizing audio...</span>
              </div>
            </div>
          )}
          {recentBalls.length > 0 && ball && <BallStrip balls={recentBalls} currentOver={ball.over} />}
          <div ref={feedEndRef} />
        </div>

            <PredictionButtons
              selected={userPrediction}
              disabled={isBallPlaying || userPrediction !== null}
              onPredict={(p) => {
                onPredict(p);
                forcePlayNextBall(p);
              }}
            />
      </div>

      <BottomMini active="matches" onNavigate={onNavigate} />
    </div>
  );
}
