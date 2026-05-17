/* eslint-disable @typescript-eslint/no-explicit-any */
// Desktop variants of mobile screens — wide layouts that use the full viewport.
// Each accepts the same props as its mobile counterpart, so swapping in App.tsx
// is a one-line conditional.

import React from 'react';
import { Monogram, AgentAvatar, StatusPill, Ic, Chip, AGENT_META, type AgentId } from '../Shared';
import type { FeedItem } from '../screens/LivePreball';

// ──────────────────────────────────────────────────────────────
// Shared desktop chrome: persistent top nav + stadium ambience
// ──────────────────────────────────────────────────────────────
function DesktopAppBar({ onNavigate, onUserProfile, active = "matches" }: {
  onNavigate?: (id: string) => void;
  onUserProfile?: () => void;
  active?: string;
}) {
  const navItems = [
    ["matches", "Matches"],
    ["panel", "Panel"],
    ["you", "You"],
  ] as const;
  return (
    <div style={{
      height: 56, padding: "0 28px",
      display: "flex", alignItems: "center", gap: 22,
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "var(--ink-1)",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
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

      {/* Nav */}
      <div style={{ display: "flex", gap: 2 }}>
        {navItems.map(([id, label]) => (
          <button key={id} onClick={() => onNavigate?.(id)} style={{
            border: "none", cursor: "pointer",
            padding: "8px 14px", borderRadius: 8,
            fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 0.04,
            color: active === id ? "var(--light-0)" : "var(--light-3)",
            textTransform: "uppercase" as const,
            background: active === id ? "var(--ink-2)" : "transparent",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div onClick={onUserProfile} style={{
        width: 32, height: 32, borderRadius: 999,
        background: "linear-gradient(135deg, oklch(0.7 0.15 220), oklch(0.5 0.10 220))",
        fontFamily: "var(--f-mono)", fontSize: 11, fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--light-0)", cursor: "pointer",
      }}>YU</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 01 · Onboarding (desktop) — two-column hero
// ──────────────────────────────────────────────────────────────
export function OnboardingDesktop({ onStart }: { onStart: () => void }) {
  return (
    <div className="sl-screen sl-grid" style={{ position: "relative", overflow: "hidden", height: "100dvh" }}>
      {/* stadium ambience */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 50% at 30% 40%, oklch(0.22 0.06 145 / 0.4), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 70%, oklch(0.22 0.08 240 / 0.25), transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* top bar */}
      <div style={{
        padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: "var(--pitch-1)", color: "var(--ink-0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--f-display)", fontWeight: 600, fontSize: 15,
          }}>S</div>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 600, fontSize: 15, letterSpacing: -0.01, color: "var(--light-0)" }}>Sledge</div>
        </div>
        <div className="sl-tag" style={{ fontSize: 10 }}>v0.1 · agentic premier league</div>
      </div>

      {/* hero — 2 columns */}
      <div style={{
        flex: 1, display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        gap: 60, alignItems: "center",
        padding: "0 60px 40px", position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto", width: "100%",
      }}>
        {/* left */}
        <div>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 0.14,
            color: "var(--pitch-1)", textTransform: "uppercase" as const, marginBottom: 22,
          }}>A second screen for the only screen that matters</div>

          <h1 style={{
            fontFamily: "var(--f-display)", fontSize: "clamp(72px, 8vw, 132px)", lineHeight: 0.92,
            letterSpacing: "-0.04em", margin: 0, fontWeight: 600, color: "var(--light-0)",
          }}>
            Call<br/>every<br/>
            <span style={{ color: "var(--pitch-1)", fontStyle: "italic", fontWeight: 500 }}>ball.</span>
          </h1>

          <p style={{
            marginTop: 28, fontSize: 17, lineHeight: 1.5, color: "var(--light-2)",
            maxWidth: 540, letterSpacing: -0.01,
          }}>
            Tap your call before each delivery. Three AI agents react — one quotes the numbers,
            one slanders you, one calls it before it happens.
          </p>

          <button className="sl-btn" onClick={onStart} style={{
            marginTop: 36, padding: "18px 32px", fontSize: 16,
          }}>
            Pick tonight's match
            <Ic.chevron />
          </button>
          <div style={{
            marginTop: 14, fontFamily: "var(--f-mono)", fontSize: 10,
            color: "var(--light-3)", letterSpacing: 0.06,
          }}>
            NO ACCOUNT · NO PUSH NOTIFS · NO BS
          </div>
        </div>

        {/* right — three principles in big cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {([
            ["01", "Dot · Boundary · Wicket · Other", "Four buttons. Five seconds per ball.", "var(--pitch-1)"],
            ["02", "Three agents, three temperatures", "Stats. Roast. Prediction. In parallel.", "var(--predict)"],
            ["03", "Ask the panel anything", "They'll answer in character. Tools and all.", "var(--stats)"],
          ] as const).map(([n, head, sub, color]) => (
            <div key={n} style={{
              display: "flex", gap: 18, alignItems: "flex-start",
              padding: "20px 22px", background: "var(--ink-1)",
              border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16,
            }}>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: 13, color, fontWeight: 500,
                padding: "4px 10px", borderRadius: 8,
                background: "rgba(255,255,255,0.04)", border: `1px solid ${color}`,
              }}>{n}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, color: "var(--light-1)", letterSpacing: -0.01, fontWeight: 500 }}>{head}</div>
                <div style={{ fontSize: 13, color: "var(--light-3)", marginTop: 4 }}>{sub}</div>
              </div>
            </div>
          ))}

          {/* agent stack avatar row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "16px 20px", background: "var(--ink-1)",
            border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16,
            marginTop: 4,
          }}>
            <AgentAvatar agent="stats" size={32} />
            <AgentAvatar agent="roast" size={32} />
            <AgentAvatar agent="predict" size={32} />
            <div style={{ flex: 1, fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--light-3)", letterSpacing: 0.04 }}>
              powered by gemini 3.1 flash · function calling for stats
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 02 · Home (desktop) — dashboard with hero match + sidebar
// ──────────────────────────────────────────────────────────────
export function HomeDesktop({ teams, venue, userScore, predictorScore, matchesPlayed, onJoinMatch, onNavigate, onUserProfile }: {
  teams: [string, string]; venue: string; battingTeam: string;
  userScore: number; predictorScore: number; matchesPlayed: number;
  onJoinMatch: () => void;
  onNavigate?: (id: string) => void;
  onUserProfile?: () => void;
}) {
  const teamA = teams[0]?.substring(0, 3).toUpperCase() || "MUM";
  const teamB = teams[1]?.substring(0, 3).toUpperCase() || "KOL";
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div className="sl-screen" style={{ overflow: "hidden", height: "100dvh" }}>
      <DesktopAppBar active="matches" onNavigate={onNavigate} onUserProfile={onUserProfile} />

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* page header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: 0.08,
              color: "var(--light-3)", textTransform: "uppercase" as const,
            }}>{today}</div>
            <h1 style={{
              fontFamily: "var(--f-display)", fontSize: 40, fontWeight: 600,
              letterSpacing: -0.02, color: "var(--light-0)", marginTop: 4, margin: 0,
            }}>Tonight's <span style={{ fontStyle: "italic", color: "var(--pitch-1)" }}>panel</span>.</h1>
          </div>

          {/* 2-column: hero match + stats sidebar */}
          <div style={{
            display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24,
          }}>
            {/* hero match card */}
            <div style={{
              position: "relative", borderRadius: 24, overflow: "hidden",
              background: "linear-gradient(155deg, oklch(0.22 0.06 145) 0%, oklch(0.16 0.02 240) 70%)",
              padding: "28px", minHeight: 360,
              border: "1px solid rgba(120, 220, 120, 0.15)",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <StatusPill kind="live">Live · Ready</StatusPill>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--light-2)", letterSpacing: 0.06 }}>{venue.toUpperCase()}</div>
              </div>

              <div style={{
                flex: 1, display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16,
                alignItems: "center", padding: "28px 0",
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <Monogram code={teamA} size={88} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--light-0)", fontWeight: 600, letterSpacing: -0.01 }}>{teams[0]}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--pitch-1)", marginTop: 4, letterSpacing: 0.06 }}>BATTING FIRST</div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 36, color: "var(--light-3)", fontStyle: "italic", fontWeight: 500 }}>v</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <Monogram code={teamB} size={88} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--light-0)", fontWeight: 600, letterSpacing: -0.01 }}>{teams[1]}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", marginTop: 4, letterSpacing: 0.06 }}>BOWLING</div>
                  </div>
                </div>
              </div>

              {/* agent strip + join CTA */}
              <div style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "14px 18px", borderRadius: 14,
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ display: "flex" }}>
                  <AgentAvatar agent="stats" size={28} />
                  <div style={{ marginLeft: -8 }}><AgentAvatar agent="roast" size={28} /></div>
                  <div style={{ marginLeft: -8 }}><AgentAvatar agent="predict" size={28} /></div>
                </div>
                <div style={{ flex: 1, fontSize: 13, color: "var(--light-1)", letterSpacing: -0.01, fontWeight: 500 }}>
                  Panel ready · 3 agents standing by
                </div>
                <button onClick={onJoinMatch} className="sl-btn" style={{ padding: "10px 18px", fontSize: 13 }}>
                  Join match <Ic.chevron />
                </button>
              </div>
            </div>

            {/* sidebar — season stats + agent leaderboards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                padding: "20px", background: "var(--ink-1)",
                border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{
                    fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: 0.08,
                    color: "var(--light-3)", textTransform: "uppercase" as const,
                  }}>Season · {matchesPlayed} matches</div>
                  <div style={{
                    fontFamily: "var(--f-mono)", fontSize: 11,
                    color: userScore >= predictorScore ? "var(--pitch-1)" : "var(--red-0)", letterSpacing: 0.06,
                  }}>{userScore - predictorScore >= 0 ? "+" : ""}{userScore - predictorScore} vs AI</div>
                </div>
                <div style={{ display: "flex", gap: 24 }}>
                  <div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)", letterSpacing: 0.06 }}>YOU</div>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 40, fontWeight: 600, color: "var(--pitch-1)", lineHeight: 1, marginTop: 4, letterSpacing: -0.02 }}>{userScore}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)", letterSpacing: 0.06 }}>AI</div>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 40, fontWeight: 600, color: "var(--predict)", lineHeight: 1, marginTop: 4, letterSpacing: -0.02 }}>{predictorScore}</div>
                  </div>
                </div>
                <div style={{
                  marginTop: 14, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden", position: "relative",
                }}>
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 3,
                    width: `${userScore + predictorScore > 0 ? (userScore / (userScore + predictorScore)) * 100 : 50}%`,
                    background: "var(--pitch-1)",
                  }} />
                </div>
              </div>

              {/* meet the panel */}
              <div style={{
                padding: "20px", background: "var(--ink-1)",
                border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18,
              }}>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: 0.08,
                  color: "var(--light-3)", textTransform: "uppercase" as const, marginBottom: 14,
                }}>The panel tonight</div>
                {([
                  ["stats", "Stats Nerd", "cold numbers · function calling", "47ms"],
                  ["roast", "Roast", "savage burns · cricket Twitter", "0.8s"],
                  ["predict", "Predictor", "calls each ball before it lands", "0.6s"],
                ] as const).map(([id, name, desc, lat]) => (
                  <div key={id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <AgentAvatar agent={id as any} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "var(--light-1)", letterSpacing: -0.005, fontWeight: 500 }}>{name}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", marginTop: 1, letterSpacing: 0.04 }}>{desc}</div>
                    </div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--light-3)", letterSpacing: 0.04 }}>{lat}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 03 · Match Detail (desktop)
// ──────────────────────────────────────────────────────────────
export function MatchDetailDesktop({ teams, venue, battingTeam, onStart, onBack, onNavigate, onUserProfile }: {
  teams: [string, string]; venue: string; battingTeam: string;
  onStart: () => void; onBack: () => void;
  onNavigate?: (id: string) => void;
  onUserProfile?: () => void;
}) {
  const teamA = teams[0]?.substring(0, 3).toUpperCase() || "MUM";
  const teamB = teams[1]?.substring(0, 3).toUpperCase() || "KOL";

  return (
    <div className="sl-screen" style={{ overflow: "hidden", height: "100dvh" }}>
      <DesktopAppBar active="matches" onNavigate={onNavigate} onUserProfile={onUserProfile} />

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* back + breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <button onClick={onBack} style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--ink-2)", border: "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer", color: "var(--light-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><Ic.back /></button>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: 0.08,
              color: "var(--light-3)", textTransform: "uppercase" as const,
            }}>Match · Group Stage · {new Date().toLocaleDateString('en-US', { weekday: 'long' })} night</div>
          </div>

          {/* big matchup */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 32, alignItems: "center",
            padding: "40px 0", borderRadius: 24,
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.22 0.06 145 / 0.18), transparent 70%)",
          }}>
            <div style={{ textAlign: "center" }}>
              <Monogram code={teamA} size={120} />
              <div style={{ fontFamily: "var(--f-display)", fontSize: 32, fontWeight: 600, color: "var(--light-0)", marginTop: 18, letterSpacing: -0.02 }}>{teams[0]}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--pitch-1)", marginTop: 6, letterSpacing: 0.06 }}>BATTING FIRST</div>
            </div>
            <div style={{
              fontFamily: "var(--f-display)", fontSize: 56, fontWeight: 500,
              color: "var(--pitch-1)", fontStyle: "italic",
            }}>v</div>
            <div style={{ textAlign: "center" }}>
              <Monogram code={teamB} size={120} />
              <div style={{ fontFamily: "var(--f-display)", fontSize: 32, fontWeight: 600, color: "var(--light-0)", marginTop: 18, letterSpacing: -0.02 }}>{teams[1]}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--light-3)", marginTop: 6, letterSpacing: 0.06 }}>BOWLING</div>
            </div>
          </div>

          {/* info grid */}
          <div style={{
            marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
            padding: "16px 0",
          }}>
            <div style={{
              padding: "16px 18px", background: "var(--ink-1)",
              border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14,
            }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--light-3)", letterSpacing: 0.08, textTransform: "uppercase" as const }}>Toss</div>
              <div style={{ fontSize: 14.5, color: "var(--light-0)", marginTop: 6, letterSpacing: -0.01 }}>
                {battingTeam} elected to <span style={{ color: "var(--pitch-1)" }}>bat</span>
              </div>
            </div>
            <div style={{
              padding: "16px 18px", background: "var(--ink-1)",
              border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14,
            }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--light-3)", letterSpacing: 0.08, textTransform: "uppercase" as const }}>Venue</div>
              <div style={{ fontSize: 14.5, color: "var(--light-0)", marginTop: 6, letterSpacing: -0.01 }}>{venue}</div>
            </div>
          </div>

          {/* panel */}
          <div style={{ marginTop: 24 }}>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--light-3)",
              letterSpacing: 0.08, textTransform: "uppercase" as const, marginBottom: 14,
            }}>Your panel for the call</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {([
                ["stats", "Stats Nerd", "cites cold numbers. 47 ms / response.", "ACC 64%"],
                ["roast", "Roast", "trash-talks every wrong call you make.", "BURNS 312"],
                ["predict", "Predictor", "calls each ball before it's bowled.", "ACC 51%"],
              ] as const).map(([id, name, desc, stat]) => (
                <div key={id} style={{
                  padding: "18px", background: "var(--ink-1)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <AgentAvatar agent={id as any} size={32} />
                    <div style={{ flex: 1, fontFamily: "var(--f-display)", fontSize: 15, color: "var(--light-0)", letterSpacing: -0.01, fontWeight: 500 }}>{name}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--light-3)", letterSpacing: -0.01, lineHeight: 1.4 }}>{desc}</div>
                  <div style={{
                    marginTop: 12, fontFamily: "var(--f-mono)", fontSize: 10,
                    color: id === "stats" ? "var(--stats)" : id === "roast" ? "var(--roast)" : "var(--predict)",
                    letterSpacing: 0.06, textTransform: "uppercase" as const,
                  }}>{stat}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button onClick={onStart} className="sl-btn" style={{
            marginTop: 32, width: "100%", justifyContent: "center", padding: "18px", fontSize: 16,
          }}>
            Call the first ball <Ic.chevron />
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 04 · Panel (desktop) — meet the agents
// ──────────────────────────────────────────────────────────────
export function PanelDesktop({ onBack, onNavigate, onUserProfile }: {
  onBack: () => void;
  onNavigate?: (id: string) => void;
  onUserProfile?: () => void;
}) {
  return (
    <div className="sl-screen" style={{ overflow: "hidden", height: "100dvh" }}>
      <DesktopAppBar active="panel" onNavigate={onNavigate} onUserProfile={onUserProfile} />

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <button onClick={onBack} style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--ink-2)", border: "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer", color: "var(--light-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><Ic.back /></button>
            <h1 style={{
              fontFamily: "var(--f-display)", fontSize: 36, fontWeight: 600,
              letterSpacing: -0.02, color: "var(--light-0)", margin: 0,
            }}>Meet the <span style={{ fontStyle: "italic", color: "var(--pitch-1)" }}>panel</span>.</h1>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
            {([
              {
                id: "stats", name: "Stats Nerd", color: "var(--stats)", bg: "var(--stats-bg)",
                glyph: "Σ", temp: "0.3",
                tagline: "Cricinfo Statsguru power user, made flesh.",
                bio: "Speaks in cold, precise numbers. Reference economy rates, strike rates, head-to-head records. Will tell you the statistical likelihood your call was off.",
                tools: ["get_player_career_stats()", "get_batsman_vs_bowler()", "get_recent_form()"],
              },
              {
                id: "roast", name: "Roast", color: "var(--roast)", bg: "var(--roast-bg)",
                glyph: "🜲", temp: "0.9",
                tagline: "The most toxic cricket Twitter account, personified.",
                bio: "Slanders batsmen, bowlers, captains, and you when you predict wrong. Indian cricket Twitter energy. Backhanded compliments when you're right.",
                tools: ["no tools — pure vibes"],
              },
              {
                id: "predict", name: "Predictor", color: "var(--predict)", bg: "var(--predict-bg)",
                glyph: "◎", temp: "0.7",
                tagline: "A probabilistic agent that calls each ball.",
                bio: "Smug when right, self-deprecating when wrong. Tracks the head-to-head with you. Acknowledges every time you beat it.",
                tools: ["no tools — pure inference"],
              },
            ] as const).map(a => (
              <div key={a.id} style={{
                padding: "24px", background: "var(--ink-1)",
                border: `1px solid ${a.color}`, borderRadius: 20,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${a.bg}, transparent 60%)`,
                  pointerEvents: "none",
                }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <AgentAvatar agent={a.id as any} size={56} />
                  <div style={{
                    fontFamily: "var(--f-display)", fontSize: 22, color: a.color, marginTop: 14, letterSpacing: -0.02, fontWeight: 600,
                  }}>{a.name}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", marginTop: 4, letterSpacing: 0.06 }}>
                    temperature {a.temp}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--light-1)", marginTop: 14, lineHeight: 1.4, letterSpacing: -0.005, fontStyle: "italic" }}>
                    {a.tagline}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--light-3)", marginTop: 14, lineHeight: 1.5 }}>
                    {a.bio}
                  </div>
                  <div style={{
                    marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div style={{
                      fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)",
                      letterSpacing: 0.08, textTransform: "uppercase" as const, marginBottom: 6,
                    }}>Tools</div>
                    {a.tools.map(t => (
                      <div key={t} style={{
                        fontFamily: "var(--f-mono)", fontSize: 10.5, color: a.color,
                        padding: "4px 0",
                      }}>{t}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 05 · You (desktop) — stats dashboard
// ──────────────────────────────────────────────────────────────
export function YouDesktop({ userScore, predictorScore, bestStreak, matchesPlayed, totalBalls, correctPredictions, onBack, onNavigate, onUserProfile }: {
  userScore: number; predictorScore: number; bestStreak: number;
  matchesPlayed: number; totalBalls: number; correctPredictions: number;
  onBack: () => void;
  onNavigate?: (id: string) => void;
  onUserProfile?: () => void;
}) {
  const accuracy = totalBalls > 0 ? Math.round((correctPredictions / totalBalls) * 100) : 0;
  return (
    <div className="sl-screen" style={{ overflow: "hidden", height: "100dvh" }}>
      <DesktopAppBar active="you" onNavigate={onNavigate} onUserProfile={onUserProfile} />

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <button onClick={onBack} style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--ink-2)", border: "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer", color: "var(--light-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><Ic.back /></button>
            <h1 style={{
              fontFamily: "var(--f-display)", fontSize: 36, fontWeight: 600,
              letterSpacing: -0.02, color: "var(--light-0)", margin: 0,
            }}>Your <span style={{ fontStyle: "italic", color: "var(--pitch-1)" }}>stats</span>.</h1>
          </div>

          {/* hero score */}
          <div style={{
            padding: "32px", borderRadius: 22,
            background: "var(--ink-1)", border: "1px solid rgba(255,255,255,0.05)",
            marginBottom: 18,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--light-3)", letterSpacing: 0.08, textTransform: "uppercase" as const }}>Your score</div>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 84, fontWeight: 600, color: "var(--pitch-1)", lineHeight: 1, marginTop: 8, letterSpacing: -0.03 }}>{userScore}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--light-3)", letterSpacing: 0.08, textTransform: "uppercase" as const }}>AI score</div>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 84, fontWeight: 600, color: "var(--predict)", lineHeight: 1, marginTop: 8, letterSpacing: -0.03 }}>{predictorScore}</div>
              </div>
            </div>
            <div style={{
              marginTop: 24, height: 8, background: "rgba(255,255,255,0.05)",
              borderRadius: 4, overflow: "hidden", position: "relative",
            }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 4,
                width: `${userScore + predictorScore > 0 ? (userScore / (userScore + predictorScore)) * 100 : 50}%`,
                background: "var(--pitch-1)", transition: "width 0.5s ease",
              }} />
            </div>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: 11.5,
              color: userScore >= predictorScore ? "var(--pitch-1)" : "var(--red-0)",
              marginTop: 12, letterSpacing: 0.04, textAlign: "center",
            }}>
              {userScore > predictorScore ? `You lead by ${userScore - predictorScore} pts` : userScore < predictorScore ? `AI leads by ${predictorScore - userScore} pts` : "Tied!"}
            </div>
          </div>

          {/* stat grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { label: "ACCURACY", value: `${accuracy}%`, color: "var(--pitch-1)" },
              { label: "BEST STREAK", value: `🔥 ${bestStreak}`, color: "var(--red-0)" },
              { label: "BALLS CALLED", value: String(totalBalls), color: "var(--light-0)" },
              { label: "CORRECT", value: String(correctPredictions), color: "var(--pitch-1)" },
              { label: "MATCHES", value: String(matchesPlayed), color: "var(--light-0)" },
              { label: "vs AI", value: `${userScore - predictorScore >= 0 ? "+" : ""}${userScore - predictorScore}`, color: userScore >= predictorScore ? "var(--pitch-1)" : "var(--red-0)" },
            ].map(s => (
              <div key={s.label} style={{
                padding: "20px", background: "var(--ink-1)", borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 0.08, color: "var(--light-3)", textTransform: "uppercase" as const }}>{s.label}</div>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 34, color: s.color, fontWeight: 600, marginTop: 8, lineHeight: 1, letterSpacing: -0.02 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 06 · Recap (desktop) — match over summary
// ──────────────────────────────────────────────────────────────
export function RecapDesktop({ userScore, predictorScore, streak, teams, onBack, onNavigate, onUserProfile }: {
  userScore: number; predictorScore: number; streak: number;
  teams: [string, string];
  onBack: () => void;
  onNavigate?: (id: string) => void;
  onUserProfile?: () => void;
}) {
  const won = userScore > predictorScore;
  const tied = userScore === predictorScore;
  const teamA = teams[0]?.substring(0, 3).toUpperCase() || "MUM";
  const teamB = teams[1]?.substring(0, 3).toUpperCase() || "KOL";

  return (
    <div className="sl-screen" style={{ overflow: "hidden", height: "100dvh" }}>
      <DesktopAppBar active="matches" onNavigate={onNavigate} onUserProfile={onUserProfile} />

      <div style={{ flex: 1, overflowY: "auto", padding: "40px 40px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* big verdict */}
          <div style={{
            textAlign: "center", padding: "40px 0", borderRadius: 24,
            background: won
              ? "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.22 0.06 145 / 0.4), transparent 70%)"
              : tied
              ? "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.22 0.05 90 / 0.4), transparent 70%)"
              : "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.24 0.06 25 / 0.4), transparent 70%)",
          }}>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 0.14,
              color: "var(--light-3)", textTransform: "uppercase" as const,
            }}>{teams[0]} vs {teams[1]} · Match Over</div>
            <h1 style={{
              fontFamily: "var(--f-display)", fontSize: "clamp(64px, 8vw, 110px)", fontWeight: 600,
              letterSpacing: -0.04, lineHeight: 0.95, margin: "20px 0 0",
              color: won ? "var(--pitch-1)" : tied ? "var(--boundary)" : "var(--red-0)",
              fontStyle: "italic",
            }}>{won ? "You won." : tied ? "Tied." : "AI wins."}</h1>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: 13, color: "var(--light-2)", marginTop: 16, letterSpacing: 0.04,
            }}>{won ? `By ${userScore - predictorScore} points` : tied ? "Coward's result" : `By ${predictorScore - userScore} points`}</div>
          </div>

          {/* score breakdown */}
          <div style={{
            marginTop: 32, padding: "28px", background: "var(--ink-1)",
            border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20,
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, alignItems: "center",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", letterSpacing: 0.08, textTransform: "uppercase" as const }}>YOU</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 64, fontWeight: 600, color: "var(--pitch-1)", lineHeight: 1, marginTop: 6, letterSpacing: -0.03 }}>{userScore}</div>
            </div>
            <div style={{
              fontFamily: "var(--f-display)", fontSize: 28, color: "var(--light-3)", fontStyle: "italic", textAlign: "center",
            }}>vs</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", letterSpacing: 0.08, textTransform: "uppercase" as const }}>AI</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 64, fontWeight: 600, color: "var(--predict)", lineHeight: 1, marginTop: 6, letterSpacing: -0.03 }}>{predictorScore}</div>
            </div>
          </div>

          {/* streak callout */}
          {streak > 0 && (
            <div style={{
              marginTop: 18, padding: "20px 24px", background: "var(--ink-1)",
              border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16,
              display: "flex", alignItems: "center", gap: 18,
            }}>
              <div style={{ fontSize: 40 }}>🔥</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", letterSpacing: 0.06, textTransform: "uppercase" as const }}>Best streak</div>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 28, color: "var(--light-0)", fontWeight: 500, marginTop: 4, letterSpacing: -0.02 }}>
                  {streak} {streak === 1 ? 'correct call in a row' : 'correct calls in a row'}
                </div>
              </div>
              <Monogram code={teamA} size={36} />
              <span style={{ color: "var(--light-3)" }}>vs</span>
              <Monogram code={teamB} size={36} />
            </div>
          )}

          {/* back to matches */}
          <button onClick={onBack} className="sl-btn" style={{
            marginTop: 32, width: "100%", justifyContent: "center", padding: "16px", fontSize: 15,
          }}>
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// AskPanel (desktop)
// ──────────────────────────────────────────────────────────────
export function AskPanelDesktop({ feed, matchScore, over, onAsk, onBack, disabled, onNavigate, onUserProfile }: {
  feed: FeedItem[];
  matchScore: string;
  over: string;
  onAsk: (q: string) => void;
  onBack: () => void;
  disabled: boolean;
  onNavigate?: (id: string) => void;
  onUserProfile?: () => void;
}) {
  const [text, setText] = React.useState('');
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth' }); }, [feed]);
  const submit = () => { const q = text.trim(); if (!q || disabled) return; onAsk(q); setText(''); };
  const AM: Record<string, AgentId> = { statsNerd: 'stats', roastAgent: 'roast', predictor: 'predict' };

  return (
    <div className="sl-screen" style={{ overflow: "hidden", height: "100dvh" }}>
      <DesktopAppBar active="panel" onNavigate={onNavigate} onUserProfile={onUserProfile} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 800, margin: "0 auto", width: "100%", padding: "24px 40px", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 24 }}>
          <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 12, background: "var(--ink-1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--light-2)", cursor: "pointer", transition: "background 0.15s ease" }}><Ic.back /></div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="sl-live-dot" />
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--red-0)", letterSpacing: 0.08 }}>LIVE</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--light-3)" }}>· {over} ov · {matchScore}</span>
            </div>
            <div style={{ fontSize: 18, color: "var(--light-0)", marginTop: 4, fontWeight: 500, letterSpacing: -0.01 }}>Ask the Panel</div>
          </div>
        </div>

        {/* Feed */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: 12 }}>
          {feed.filter(f => f.agentId === 'user' || AM[f.agentId]).map((item) => {
            if (item.agentId === 'user') {
              return (<div key={item.id} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
                <div style={{ maxWidth: "70%", padding: "14px 18px", background: "var(--light-0)", color: "var(--ink-0)", borderRadius: "20px 20px 4px 20px", fontSize: 14.5, lineHeight: 1.45, fontWeight: 500 }}>{item.message}</div>
              </div>);
            }
            const ak = AM[item.agentId]; if (!ak) return null;
            const m = AGENT_META[ak];
            return (<div key={item.id} style={{ display: "flex", gap: 16, animation: "sl-fade-up .35s ease both", marginBottom: 24 }}>
              <AgentAvatar agent={ak} size={36} />
              <div style={{ flex: 1, maxWidth: "85%" }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: 0.08, color: m.color, textTransform: "uppercase" as const, marginBottom: 6, fontWeight: 500 }}>{m.name}</div>
                <div style={{ background: m.bg, borderRadius: "4px 16px 16px 16px", padding: "14px 18px", fontSize: 14, lineHeight: 1.5, color: "var(--light-1)", border: "1px solid rgba(255,255,255,0.04)" }}>{item.message}</div>
              </div>
            </div>);
          })}
          {disabled && (
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
          
          <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Chip onClick={() => onAsk("Who wins this match?")}>Who wins?</Chip>
            <Chip onClick={() => onAsk("Win probability now?")}>Win prob?</Chip>
            <Chip onClick={() => onAsk("Roast my last call")}>Roast me</Chip>
          </div>
          <div ref={ref} style={{ height: 20 }} />
        </div>

        {/* Input */}
        <div style={{ marginTop: 24, padding: "8px 8px 8px 18px", borderRadius: 999, background: "var(--ink-1)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <input type="text" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Ask the panel..." disabled={disabled} maxLength={500}
            style={{ flex: 1, fontSize: 15, color: "var(--light-0)", background: "transparent", border: "none", outline: "none", fontFamily: "var(--f-body)" }} />
          <button onClick={submit} disabled={disabled || !text.trim()} style={{ width: 44, height: 44, borderRadius: 999, border: "none", background: "var(--pitch-1)", color: "var(--ink-0)", display: "flex", alignItems: "center", justifyContent: "center", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled || !text.trim() ? 0.5 : 1, transition: "opacity 0.15s ease" }}><Ic.send /></button>
        </div>
      </div>
    </div>
  );
}
