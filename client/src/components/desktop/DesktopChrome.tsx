/* eslint-disable react-refresh/only-export-components */
import { Monogram, AgentAvatar, AGENT_META, Ic, type AgentId, TEAM_COLORS } from '../Shared';

// Map full team name → 3-letter monogram code for the Monogram component.
export function teamCode(name: string): string {
  if (!name) return 'BOM';
  const n = name.toLowerCase();
  if (n.includes('mumbai')) return 'BOM';
  if (n.includes('kolkata')) return 'KOL';
  if (n.includes('bangalore') || n.includes('bengaluru')) return 'BLR';
  if (n.includes('chennai') || n.includes('madras')) return 'MAA';
  if (n.includes('delhi')) return 'DEL';
  if (n.includes('hyderabad')) return 'HYD';
  if (n.includes('rajasthan') || n.includes('jaipur')) return 'JAI';
  if (n.includes('gujarat') || n.includes('ahmedabad')) return 'AHM';
  if (n.includes('lucknow')) return 'LUC';
  if (n.includes('punjab')) return 'PUN';
  return name.slice(0, 3).toUpperCase();
}

// ──────────────────────────────────────────────────────────────
// Top Bar — logo, match selector, agent status, score chip
// ──────────────────────────────────────────────────────────────
export function DesktopTopBar({ teamA, teamB, score, over, userScore, userDelta, onExit, onUserProfile }: {
  teamA: string; teamB: string; score: string; over: string;
  userScore: number; userDelta?: number;
  onExit?: () => void;
  onUserProfile?: () => void;
}) {
  return (
    <div style={{
      height: 56, padding: "0 22px",
      display: "flex", alignItems: "center", gap: 18,
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "var(--ink-1)",
      flexShrink: 0,
    }}>
      {onExit && (
        <button onClick={onExit} title="Exit match" style={{
          width: 30, height: 30, borderRadius: 8,
          background: "var(--ink-2)", border: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--light-2)", padding: 0,
        }}>
          <Ic.back />
        </button>
      )}
      <div onClick={onExit} style={{ display: "flex", alignItems: "center", gap: 9, cursor: onExit ? "pointer" : "default" }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: "var(--pitch-1)", color: "var(--ink-0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--f-display)", fontWeight: 600, fontSize: 15,
        }}>S</div>
        <div style={{ fontFamily: "var(--f-display)", fontWeight: 600, fontSize: 14, letterSpacing: -0.01, color: "var(--light-0)" }}>Sledge</div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", letterSpacing: 0.06, marginLeft: 2 }}>v0.1</div>
      </div>

      <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)" }} />

      {/* match selector chip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "5px 11px 5px 7px", borderRadius: 8,
        background: "var(--ink-2)", border: "1px solid rgba(255,255,255,0.05)",
      }}>
        <span className="sl-live-dot" />
        <Monogram code={teamCode(teamA)} size={20} />
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--light-2)" }}>v</span>
        <Monogram code={teamCode(teamB)} size={20} />
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--light-1)", marginLeft: 4 }}>{score}</span>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)" }}>· {over}</span>
        <Ic.chevron />
      </div>

      <div style={{ flex: 1 }} />

      {/* agentic status pill */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "4px 10px", borderRadius: 999,
        background: "var(--ink-2)", border: "1px solid rgba(255,255,255,0.05)",
        fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-2)", letterSpacing: 0.04,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: 3, background: "var(--pitch-1)" }} />
        3 agents · gemini 3.1 flash lite
      </div>

      {/* user score chip */}
      <div onClick={onUserProfile} style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "5px 5px 5px 12px", borderRadius: 999,
        background: "var(--ink-2)", border: "1px solid rgba(255,255,255,0.05)",
        cursor: onUserProfile ? "pointer" : "default",
      }}>
        <span className="sl-mono" style={{
          fontSize: 12, color: userDelta && userDelta > 0 ? "var(--pitch-1)" : "var(--light-2)", fontWeight: 500,
        }}>
          {userDelta && userDelta > 0 ? `+${userDelta}` : userScore}
        </span>
        <div style={{
          width: 26, height: 26, borderRadius: 999,
          background: "linear-gradient(135deg, oklch(0.7 0.15 220), oklch(0.5 0.10 220))",
          fontFamily: "var(--f-mono)", fontSize: 10, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", color: "var(--light-0)",
        }}>YU</div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Left Rail — score, win prob, batter, bowler, recent overs
// ──────────────────────────────────────────────────────────────
type Stat = [string, string];
type RailPlayer = { name: string; line: string; stats: Stat[] };

export function LeftRail({ battingTeam, score, oversText, winProb, batter, bowler, recentOvers }: {
  battingTeam: string;
  score: string; // e.g. "127/4"
  oversText: string; // e.g. "14.3 / 20 ov"
  winProb: number; // 0-100
  batter: RailPlayer;
  bowler: RailPlayer;
  recentOvers: { n: string; balls: string[] }[];
}) {
  const teamA = teamCode(battingTeam);
  const teamB = teamA === 'BOM' ? 'KOL' : 'BOM';
  return (
    <div style={{
      width: 280, padding: "20px 18px",
      borderRight: "1px solid rgba(255,255,255,0.05)",
      background: "var(--ink-1)",
      display: "flex", flexDirection: "column", gap: 18, overflowY: "auto",
      flexShrink: 0,
    }}>
      {/* Score block */}
      <div>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)",
          letterSpacing: 0.08, textTransform: "uppercase" as const,
        }}>1st innings · {battingTeam.split(' ')[0]} batting</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
          <Monogram code={teamA} size={32} />
          <div className="sl-mono" style={{
            fontSize: 28, color: "var(--light-0)", letterSpacing: -0.01, fontWeight: 500,
          }}>
            {score.split('/')[0]}<span style={{ color: "var(--light-3)" }}>/{score.split('/')[1] || '0'}</span>
          </div>
        </div>
        <div className="sl-mono" style={{
          fontSize: 10.5, color: "var(--light-3)", marginTop: 2, letterSpacing: 0.02,
        }}>{oversText}</div>
      </div>

      {/* Win probability */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)",
            letterSpacing: 0.08, textTransform: "uppercase" as const,
          }}>Win probability</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)" }}>HAWKEYE</div>
        </div>
        <div style={{
          display: "flex", height: 6, borderRadius: 3, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ width: `${winProb}%`, background: (TEAM_COLORS[teamA] || TEAM_COLORS.BOM).bg }} />
          <div style={{ width: `${100 - winProb}%`, background: (TEAM_COLORS[teamB] || TEAM_COLORS.KOL).bg }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--light-1)" }}>{teamA} {winProb}%</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--light-3)" }}>{100 - winProb}% {teamB}</div>
        </div>
      </div>

      <div>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)",
          letterSpacing: 0.08, textTransform: "uppercase" as const,
        }}>On strike</div>
        <PlayerCard role="batter" name={batter.name} line={batter.line} stats={batter.stats} />
      </div>

      <div>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)",
          letterSpacing: 0.08, textTransform: "uppercase" as const,
        }}>Bowling</div>
        <PlayerCard role="bowler" name={bowler.name} line={bowler.line} stats={bowler.stats} />
      </div>

      <div>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)",
          letterSpacing: 0.08, textTransform: "uppercase" as const, marginBottom: 8,
        }}>Last {recentOvers.length} overs</div>
        <RecentOvers overs={recentOvers} />
      </div>
    </div>
  );
}

function PlayerCard({ role, name, line, stats }: { role: 'batter' | 'bowler'; name: string; line: string; stats: Stat[] }) {
  return (
    <div style={{
      marginTop: 7, padding: "10px 12px",
      background: "var(--ink-2)", borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "var(--ink-3)",
          backgroundImage: "repeating-linear-gradient(135deg, transparent 0 4px, rgba(255,255,255,0.04) 4px 5px)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--light-3)", fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 0.06,
          flexShrink: 0,
        }}>{role === "batter" ? "BAT" : "BWL"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, color: "var(--light-0)", fontWeight: 500, letterSpacing: -0.01,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{name}</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", marginTop: 2 }}>{line}</div>
        </div>
      </div>
      {stats.length > 0 && (
        <div style={{
          display: "flex", gap: 12, marginTop: 9, paddingTop: 8,
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--light-3)", letterSpacing: 0.06 }}>{s[0]}</div>
              <div className="sl-mono" style={{ fontSize: 11, color: "var(--light-1)", marginTop: 1, fontWeight: 500 }}>{s[1]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ballColor(b: string): string {
  if (b === '·') return 'var(--dot)';
  if (b === 'W') return 'var(--red-1)';
  if (b === '4' || b === '6') return 'var(--boundary)';
  if (b.endsWith('wd')) return 'var(--stats)';
  if (b.endsWith('nb')) return 'var(--roast)';
  if (b.endsWith('lb') || b.endsWith('b')) return 'var(--light-3)';
  return 'var(--light-2)';
}

function RecentOvers({ overs }: { overs: { n: string; balls: string[] }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {overs.map(ov => (
        <div key={ov.n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)",
            letterSpacing: 0.04, width: 36,
          }}>{ov.n}</div>
          {ov.balls.map((b, i) => {
            const c = ballColor(b);
            const isDot = b === "·";
            return (
              <div key={i} style={{
                minWidth: 18, height: 18, padding: b.length > 1 ? "0 4px" : 0, borderRadius: 5,
                background: isDot ? "var(--ink-3)" : "transparent",
                border: isDot ? "1px solid rgba(255,255,255,0.04)" : `1px solid ${c}`,
                color: c, fontFamily: "var(--f-mono)", fontSize: 9, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{b}</div>
            );
          })}
        </div>
      ))}
      {overs.length === 0 && (
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", opacity: 0.6 }}>
          No completed overs yet.
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Agent Lane — the right column showpiece
// ──────────────────────────────────────────────────────────────
export type LaneMsg = {
  message: string;
  tool?: string;
  time?: string;
  over?: string;
  dim?: boolean;
};

export function AgentLane({ agent, latency, status, messages }: {
  agent: AgentId;
  latency: string;
  status: 'idle' | 'thinking';
  messages: LaneMsg[];
}) {
  const m = AGENT_META[agent];
  return (
    <div style={{
      flex: 1, minWidth: 0,
      display: "flex", flexDirection: "column",
      borderRadius: 14, overflow: "hidden",
      background: "var(--ink-1)",
      border: "1px solid rgba(255,255,255,0.04)",
    }}>
      {/* Lane header */}
      <div style={{
        padding: "10px 12px",
        background: m.bg,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 8,
        flexShrink: 0,
      }}>
        <AgentAvatar agent={agent} size={22} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--f-display)", fontSize: 12, fontWeight: 500,
            color: m.color, letterSpacing: -0.01,
          }}>{m.name}</div>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--light-3)",
            letterSpacing: 0.04, marginTop: 1,
          }}>{latency}</div>
        </div>
        <div style={{
          width: 6, height: 6, borderRadius: 3,
          background: status === "thinking" ? m.color : "var(--ink-4)",
          animation: status === "thinking" ? "sl-pulse-dot 1.1s infinite" : "none",
        }} />
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 12,
        overflowY: "auto",
      }}>
        {messages.length === 0 && status !== 'thinking' && (
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)",
            opacity: 0.5, letterSpacing: 0.04, textAlign: "center", padding: "16px 0",
          }}>waiting for the next ball</div>
        )}
        {messages.map((msg, i) => (
          <LaneMessage key={i} agent={agent} {...msg} />
        ))}
        {status === "thinking" && <ThinkingBubble agent={agent} />}
      </div>
    </div>
  );
}

function LaneMessage({ agent, message, tool, time, over, dim }: LaneMsg & { agent: AgentId }) {
  const m = AGENT_META[agent];
  return (
    <div style={{
      animation: "sl-fade-up .4s ease both",
      opacity: dim ? 0.55 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--light-3)", letterSpacing: 0.06,
        }}>{over}</div>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.04)" }} />
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--light-3)", letterSpacing: 0.04,
        }}>{time}</div>
      </div>
      {tool && (
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 9.5, color: m.color, letterSpacing: 0.02,
          padding: "5px 8px", marginBottom: 5,
          background: "rgba(0,0,0,0.3)", borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3l3 2 3-2M5 5v3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          {tool}
        </div>
      )}
      <div style={{
        fontSize: 11.5, lineHeight: 1.45, color: "var(--light-1)", letterSpacing: -0.005,
        fontFamily: agent === "stats" ? "var(--f-mono)" : "var(--f-body)",
        fontStyle: agent === "roast" ? "italic" : "normal",
      }}>{message}</div>
    </div>
  );
}

function ThinkingBubble({ agent }: { agent: AgentId }) {
  const m = AGENT_META[agent];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: 3, background: m.color,
          animation: `sl-pulse-dot 1.1s ${i * 0.15}s ease-in-out infinite`,
        }} />
      ))}
      <span style={{
        fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)",
        letterSpacing: 0.04, marginLeft: 4,
      }}>streaming</span>
    </div>
  );
}
