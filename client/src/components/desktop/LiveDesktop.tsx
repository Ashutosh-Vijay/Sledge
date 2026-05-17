import React from 'react';
import { DesktopTopBar, LeftRail, AgentLane, type LaneMsg } from './DesktopChrome';
import { Ic } from '../Shared';
import type { Ball } from '../../types';
import type { FeedItem } from '../screens/LivePreball';

// ──────────────────────────────────────────────────────────────
// LiveDesktop — the full "Control Room" screen
// ──────────────────────────────────────────────────────────────
export function LiveDesktop({
  ball,
  matchScore,
  battingTeam,
  teams,
  userScore,
  predictorScore,
  streak,
  userPrediction,
  predictorPrediction,
  onPredict,
  feed,
  isBallPlaying,
  isAIFetching,
  onAskPanel,
  recentBalls,
  isPaused,
  onTogglePause,
  speed,
  onToggleSpeed,
  lastOutcome,
  lastUserCorrect,
  onExit,
  onUserProfile,
}: {
  ball: Ball | null;
  matchScore: string;
  battingTeam: string;
  teams: [string, string];
  userScore: number;
  predictorScore: number;
  streak: number;
  userPrediction: string | null;
  predictorPrediction: string;
  onPredict: (choice: 'Dot' | 'Boundary' | 'Wicket' | 'Other') => void;
  feed: FeedItem[];
  isBallPlaying: boolean;
  isAIFetching: boolean;
  onAskPanel: () => void;
  recentBalls: { run: string; c: string; over: number }[];
  isPaused: boolean;
  onTogglePause: () => void;
  speed: number;
  onToggleSpeed: () => void;
  lastOutcome?: { outcome: string; runs: number; batter: string; bowler: string; userCorrect?: boolean } | null;
  lastUserCorrect?: boolean;
  onExit?: () => void;
  onUserProfile?: () => void;
}) {
  const overStr = ball ? `${ball.over}.${ball.ball} ov` : "0.0 ov";
  const pChoice = predictorPrediction.match(/\b(Dot|Boundary|Wicket|Other)\b/i)?.[0] ?? null;
  const pConfMatch = predictorPrediction.match(/(\d+)\s*%/);
  const pConf = pConfMatch ? `${pConfMatch[1]}% confidence` : "streaming · gemini 3.1 flash";

  // Group feed messages by agent — last 6 per lane
  const groupedFeed = groupFeedByAgent(feed);

  // Determine if we should show outcome banner (last ball was boundary/wicket)
  const showBanner = lastOutcome && (lastOutcome.outcome === 'Boundary' || lastOutcome.outcome === 'Wicket');

  // Build recent overs from recentBalls
  const recentOvers = buildRecentOvers(recentBalls);

  // Calculate win prob — fake but contextual
  const winProb = Math.max(28, Math.min(72, 50 + (predictorScore - userScore) * 0.3 + (Math.max(0, 6 - (ball?.over ?? 0)) * 2)));

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "var(--ink-0)", color: "var(--light-1)",
      fontFamily: "var(--f-body)", letterSpacing: -0.005,
      display: "flex", flexDirection: "column",
    }}>
      <DesktopTopBar
        teamA={teams[0]} teamB={teams[1]}
        score={matchScore} over={overStr}
        userScore={userScore}
        onExit={onExit}
        onUserProfile={onUserProfile}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        <LeftRail
          battingTeam={battingTeam}
          score={matchScore}
          oversText={ball ? `${ball.over}.${ball.ball} / 20 ov` : "0.0 / 20 ov"}
          winProb={Math.round(winProb)}
          batter={{
            name: ball?.batter ?? "—",
            line: ball ? `non-striker · ${ball.nonStriker || "—"}` : "—",
            stats: [
              ["YOU", String(userScore)],
              ["AI", String(predictorScore)],
              ["STREAK", `🔥 ${streak}`],
            ],
          }}
          bowler={{
            name: ball?.bowler ?? "—",
            line: ball ? `bowling · over ${ball.over + 1}` : "—",
            stats: [],
          }}
          recentOvers={recentOvers}
        />

        {/* Center column */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          padding: "22px 28px", minWidth: 0, overflowY: "auto", gap: 14,
        }}>
          {/* Ball incoming banner / reveal banner */}
          {showBanner && lastOutcome ? (
            <OutcomeBanner outcome={lastOutcome.outcome} runs={lastOutcome.runs} batter={lastOutcome.batter} bowler={lastOutcome.bowler} matchScore={matchScore} />
          ) : (
            <BallIncomingBanner
              over={ball ? `${ball.over}.${ball.ball}` : "0.0"}
              isAIFetching={isAIFetching}
              isBallPlaying={isBallPlaying}
              isPaused={isPaused}
              onTogglePause={onTogglePause}
              speed={speed}
              onToggleSpeed={onToggleSpeed}
            />
          )}

          {/* Two big call cards */}
          <div style={{ display: "flex", gap: 14 }}>
            <BigCallCard
              who="YOUR CALL"
              value={userPrediction || undefined}
              status={userPrediction ? "locked" : isBallPlaying ? "locked" : "waiting"}
              tint="var(--pitch-1)"
              caption={userPrediction ? "locked in · waiting for the ball" : "tap a prediction below"}
              verdict={lastUserCorrect}
            />
            <BigCallCard
              who="AI PREDICTION"
              value={pChoice || undefined}
              status={isAIFetching ? "thinking" : (pChoice ? "locked" : "waiting")}
              tint="var(--predict)"
              caption={isAIFetching ? "streaming · gemini 3.1 flash" : pConf}
            />
          </div>

          {/* Prediction buttons */}
          <PredictionGrid
            selected={userPrediction}
            disabled={isBallPlaying || isPaused || userPrediction !== null || isAIFetching}
            onPredict={onPredict}
          />

          {/* Ask the panel */}
          <AskPanelInline onAsk={onAskPanel} />
        </div>

        {/* Right column: 3 agent lanes */}
        <div style={{
          width: 480, padding: "22px 22px",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          background: "var(--ink-0)",
          display: "flex", flexDirection: "column", gap: 12, minHeight: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)",
              letterSpacing: 0.08, textTransform: "uppercase" as const,
            }}>The Panel · {isAIFetching ? 'reacting' : 'live'}</div>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)", letterSpacing: 0.04,
            }}>3 gemini calls / ball</div>
          </div>
          <div style={{ flex: 1, display: "flex", gap: 10, minHeight: 0 }}>
            <AgentLane
              agent="stats"
              latency={isAIFetching ? "streaming · 3 tools" : "47 ms · 3 tools"}
              status={isAIFetching && isBallPlaying ? "thinking" : "idle"}
              messages={groupedFeed.stats}
            />
            <AgentLane
              agent="roast"
              latency={isAIFetching ? "streaming" : "0.8s · no tools"}
              status={isAIFetching && isBallPlaying ? "thinking" : "idle"}
              messages={groupedFeed.roast}
            />
            <AgentLane
              agent="predict"
              latency={isAIFetching ? "streaming" : "0.6s · no tools"}
              status={isAIFetching && isBallPlaying ? "thinking" : "idle"}
              messages={groupedFeed.predict}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Ball incoming banner — header above call cards
// ──────────────────────────────────────────────────────────────
function BallIncomingBanner({ over, isAIFetching, isBallPlaying, isPaused, onTogglePause, speed, onToggleSpeed }: {
  over: string;
  isAIFetching: boolean;
  isBallPlaying: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  speed: number;
  onToggleSpeed: () => void;
}) {
  const label = isBallPlaying ? "Ball resolving…" : isAIFetching ? "Panel thinking…" : isPaused ? "Paused" : `Ball ${over} incoming`;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 16px",
      background: "var(--ink-1)", borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{
        padding: "4px 9px", borderRadius: 6,
        background: "var(--predict-bg)", color: "var(--predict)",
        fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 0.08, textTransform: "uppercase" as const,
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: 3, background: "var(--predict)", animation: "sl-pulse-dot 0.8s infinite" }} />
        {label}
      </div>
      <div style={{
        flex: 1, height: 3, borderRadius: 2,
        background: "rgba(255,255,255,0.06)", overflow: "hidden", position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0, transformOrigin: "left",
          transform: isAIFetching ? "scaleX(0.4)" : isBallPlaying ? "scaleX(0.85)" : "scaleX(0.6)",
          background: "linear-gradient(90deg, var(--predict), var(--pitch-1))",
          transition: "transform 0.6s ease",
        }} />
      </div>

      {/* Pause + speed controls */}
      <button onClick={onTogglePause} style={{
        border: "1px solid rgba(255,255,255,0.05)", background: "var(--ink-2)",
        color: "var(--light-2)", padding: "5px 10px", borderRadius: 8,
        fontFamily: "var(--f-mono)", fontSize: 11, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        {isPaused ? "▶" : <Ic.pause />}
      </button>
      <button onClick={onToggleSpeed} style={{
        border: "1px solid rgba(255,255,255,0.05)", background: "var(--ink-2)",
        color: "var(--light-2)", padding: "5px 10px", borderRadius: 8,
        fontFamily: "var(--f-mono)", fontSize: 11, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        <Ic.fast /> {speed}×
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Outcome banner — shows when a boundary or wicket just resolved
// ──────────────────────────────────────────────────────────────
function OutcomeBanner({ outcome, runs, batter, bowler, matchScore }: {
  outcome: string; runs: number; batter: string; bowler: string; matchScore: string;
}) {
  const isWicket = outcome === 'Wicket';
  const isSix = runs === 6;
  const glyph = isWicket ? "W" : runs === 6 ? "6" : "4";
  const word = isWicket ? "WICKET" : runs === 6 ? "SIX" : "FOUR";
  const tint = isWicket ? "var(--red-0)" : "var(--boundary)";
  const tintHue = isWicket ? "25" : "95";
  const tintColor = isWicket ? "0.20" : "0.18";
  const subtitle = isWicket ? `${bowler} ends ${batter}` : `${batter} hits ${bowler} for ${runs}`;

  return (
    <div style={{
      borderRadius: 18, padding: "18px 22px 20px",
      background: `linear-gradient(115deg, oklch(0.32 0.10 ${tintHue}) 0%, oklch(0.20 0.04 ${tintHue}) 50%, var(--ink-1) 100%)`,
      border: `1px solid oklch(0.86 ${tintColor} ${tintHue} / 0.20)`,
      position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center", gap: 22,
      animation: "sl-fade-up 0.4s ease both",
    }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.18, pointerEvents: "none" }}>
        {[12, 30, 50, 70, 88].map((x, i) => (
          <div key={i} style={{
            position: "absolute", left: `${x}%`, top: `${(i % 2) * 60 + 15}%`,
            width: 3, height: 3, borderRadius: 2, background: tint,
            boxShadow: `0 0 0 ${3 + i * 2}px oklch(0.86 ${tintColor} ${tintHue} / 0.12)`,
          }} />
        ))}
      </div>
      <div style={{
        fontFamily: "var(--f-display)", fontSize: 96, color: tint,
        fontWeight: 700, letterSpacing: -0.06, lineHeight: 0.85,
        textShadow: `0 0 36px oklch(0.86 ${tintColor} ${tintHue} / 0.45)`,
        position: "relative",
      }}>{glyph}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 0.12,
          color: tint, textTransform: "uppercase" as const,
        }}>{word}{isSix ? " · over the rope" : isWicket ? "" : ""}</div>
        <div style={{
          marginTop: 5, fontFamily: "var(--f-display)", fontSize: 20,
          color: "var(--light-0)", fontWeight: 500, letterSpacing: -0.02,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{subtitle}</div>
      </div>
      <div style={{
        padding: "10px 14px", borderRadius: 12,
        background: "rgba(0,0,0,0.30)",
        border: `1px solid oklch(0.86 ${tintColor} ${tintHue} / 0.25)`,
      }}>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)", letterSpacing: 0.08,
        }}>SCORE</div>
        <div className="sl-mono" style={{
          fontSize: 22, color: tint, fontWeight: 500, marginTop: 3,
        }}>{matchScore.split('/')[0]}<span style={{ color: "var(--light-3)" }}>/{matchScore.split('/')[1]}</span></div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// BigCallCard — large prediction card (your call / AI call)
// ──────────────────────────────────────────────────────────────
function BigCallCard({ who, value, status, tint, caption, verdict }: {
  who: string;
  value?: string;
  status: 'locked' | 'thinking' | 'waiting';
  tint: string;
  caption: string;
  verdict?: boolean;
}) {
  const thinking = status === 'thinking';
  const correct = verdict === true;
  const wrong = verdict === false;
  return (
    <div style={{
      flex: 1, borderRadius: 16,
      padding: "16px 18px 18px", minHeight: 130,
      background: correct
        ? "linear-gradient(155deg, var(--pitch-bg), var(--ink-2))"
        : wrong
        ? "linear-gradient(155deg, var(--red-bg), var(--ink-2))"
        : thinking
        ? "linear-gradient(155deg, var(--ink-1), var(--ink-2))"
        : "var(--ink-2)",
      border: `1px solid ${correct ? "oklch(0.78 0.18 142 / 0.30)" : wrong ? "oklch(0.68 0.22 25 / 0.30)" : "rgba(255,255,255,0.06)"}`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 0.1, color: "var(--light-3)" }}>{who}</div>
        {verdict !== undefined ? (
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 0.08,
            padding: "3px 8px", borderRadius: 5,
            background: correct ? "var(--pitch-1)" : "var(--red-bg)",
            color: correct ? "var(--ink-0)" : "var(--red-0)",
            fontWeight: 500,
          }}>{correct ? "✓ CORRECT +10" : "✕ WRONG"}</div>
        ) : (
          <div style={{ width: 8, height: 8, borderRadius: 2, background: tint }} />
        )}
      </div>
      {thinking ? (
        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 6, height: 26 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: 9, height: 9, borderRadius: 5, background: tint,
              animation: `sl-pulse-dot 1.1s ${i * 0.15}s ease-in-out infinite`,
            }} />
          ))}
        </div>
      ) : value ? (
        <div style={{
          marginTop: 18, fontFamily: "var(--f-display)", fontSize: 36,
          color: tint, fontWeight: 600, letterSpacing: -0.03, lineHeight: 1,
        }}>{value}</div>
      ) : (
        <div style={{
          marginTop: 18, fontFamily: "var(--f-display)", fontSize: 36,
          color: "var(--light-3)", fontWeight: 600, letterSpacing: -0.03, lineHeight: 1, opacity: 0.5,
        }}>—</div>
      )}
      <div style={{
        marginTop: 14, fontFamily: "var(--f-mono)", fontSize: 10,
        color: "var(--light-3)", letterSpacing: 0.04,
      }}>{caption}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Prediction grid — 4 cards
// ──────────────────────────────────────────────────────────────
function PredictionGrid({ selected, disabled, onPredict }: {
  selected: string | null;
  disabled: boolean;
  onPredict: (choice: 'Dot' | 'Boundary' | 'Wicket' | 'Other') => void;
}) {
  const choices: { id: 'Dot' | 'Boundary' | 'Wicket' | 'Other'; glyph: string; sub: string; odds: string }[] = [
    { id: "Dot",      glyph: "·",  sub: "no run", odds: "45%" },
    { id: "Boundary", glyph: "4",  sub: "or six", odds: "27%" },
    { id: "Wicket",   glyph: "W",  sub: "out",    odds: "11%" },
    { id: "Other",    glyph: "1+", sub: "runs",   odds: "17%" },
  ];
  return (
    <div style={{
      padding: "14px 16px", background: "var(--ink-1)",
      border: "1px solid rgba(255,255,255,0.04)", borderRadius: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)",
          letterSpacing: 0.08, textTransform: "uppercase" as const,
        }}>Your call</div>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--pitch-1)", letterSpacing: 0.06,
        }}>+10 if correct · +25 with 5-streak bonus</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {choices.map(c => {
          const isSel = selected === c.id;
          return (
            <button
              key={c.id}
              disabled={disabled}
              onClick={() => onPredict(c.id)}
              style={{
                border: "none", cursor: disabled ? "not-allowed" : "pointer",
                background: isSel ? "var(--light-0)" : "var(--ink-2)",
                color: isSel ? "var(--ink-0)" : "var(--light-1)",
                borderRadius: 14, padding: "14px 12px 12px",
                boxShadow: isSel ? "0 0 0 1.5px var(--pitch-1)" : "inset 0 0 0 1px rgba(255,255,255,0.04)",
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
                position: "relative", textAlign: "left",
                fontFamily: "var(--f-display)",
                opacity: disabled && !isSel ? 0.5 : 1,
                transition: "transform .12s ease",
              }}>
              <span style={{ fontSize: 28, fontWeight: 600, lineHeight: 1, letterSpacing: -0.02 }}>{c.glyph}</span>
              <span style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>{c.id}</span>
              <span style={{
                fontFamily: "var(--f-mono)", fontSize: 9.5,
                color: isSel ? "var(--ink-3)" : "var(--light-3)",
                letterSpacing: 0.06, textTransform: "uppercase" as const,
              }}>{c.sub}</span>
              <span style={{
                position: "absolute", top: 10, right: 10,
                fontFamily: "var(--f-mono)", fontSize: 9.5,
                color: isSel ? "var(--pitch-2)" : "var(--light-3)",
                padding: "2px 6px", borderRadius: 4,
                background: isSel ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.25)",
              }}>{c.odds}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Ask the panel — slim inline input
// ──────────────────────────────────────────────────────────────
function AskPanelInline({ onAsk }: { onAsk: () => void }) {
  return (
    <div>
      <div onClick={onAsk} style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 6px 6px 16px", borderRadius: 999,
        background: "var(--ink-2)", border: "1px solid rgba(255,255,255,0.06)",
        cursor: "pointer",
      }}>
        <Ic.spark />
        <div style={{ flex: 1, fontSize: 13, color: "var(--light-3)", letterSpacing: -0.01 }}>
          Ask the panel anything…
        </div>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", letterSpacing: 0.04,
        }}>⌘K</div>
        <button style={{
          width: 30, height: 30, borderRadius: 999, border: "none",
          background: "var(--pitch-1)", color: "var(--ink-0)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}><Ic.send /></button>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        <SuggestionChip onClick={onAsk}>Should this batter attack the death overs?</SuggestionChip>
        <SuggestionChip onClick={onAsk}>Roast my last 3 calls</SuggestionChip>
        <SuggestionChip onClick={onAsk}>Win prob next over</SuggestionChip>
      </div>
    </div>
  );
}

function SuggestionChip({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      border: "1px solid rgba(255,255,255,0.08)", background: "var(--ink-1)",
      color: "var(--light-2)", padding: "6px 11px", borderRadius: 999,
      fontSize: 11.5, fontFamily: "var(--f-body)", letterSpacing: -0.005, cursor: "pointer",
    }}>{children}</button>
  );
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function groupFeedByAgent(feed: FeedItem[]): { stats: LaneMsg[]; roast: LaneMsg[]; predict: LaneMsg[] } {
  const stats: LaneMsg[] = [];
  const roast: LaneMsg[] = [];
  const predict: LaneMsg[] = [];

  let currentOver = "OV 0";
  let timeOffset = 0;

  // Process feed in reverse to get newest first within each lane
  for (let i = feed.length - 1; i >= 0; i--) {
    const item = feed[i];
    if (item.agentId === 'ballDivider') {
      currentOver = item.ballLabel?.split(' · ')[0] ?? currentOver;
      timeOffset += 4;
      continue;
    }
    if (item.agentId === 'user') continue;

    const msg: LaneMsg = {
      message: item.message,
      over: currentOver,
      time: `−${timeOffset}s`,
      dim: timeOffset > 20,
    };

    if (item.agentId === 'statsNerd') {
      // Inject a fake tool call breadcrumb for the most recent stats nerd message
      if (stats.length === 0 && item.message.length > 30) {
        const playerName = currentOver.includes('→')
          ? currentOver.split('→')[0].split(' · ')[1]?.trim()
          : undefined;
        if (playerName) msg.tool = `get_recent_form('${playerName}')`;
      }
      stats.push(msg);
    } else if (item.agentId === 'roastAgent') roast.push(msg);
    else if (item.agentId === 'predictor') predict.push(msg);
  }

  return {
    stats: stats.slice(0, 5),
    roast: roast.slice(0, 5),
    predict: predict.slice(0, 5),
  };
}

function buildRecentOvers(recentBalls: { run: string; c: string; over: number }[]): { n: string; balls: string[] }[] {
  if (recentBalls.length === 0) return [];

  // Group balls by their over number
  const grouped = new Map<number, string[]>();
  for (const b of recentBalls) {
    if (!grouped.has(b.over)) grouped.set(b.over, []);
    grouped.get(b.over)!.push(b.run);
  }

  // Sort overs descending (newest first), take last 3
  const overs = [...grouped.entries()].sort((a, b) => b[0] - a[0]).slice(0, 3);
  const currentOver = overs[0]?.[0];

  return overs.map(([n, balls]) => ({
    n: n === currentOver ? "THIS" : `OV ${n}`,
    balls,
  }));
}
