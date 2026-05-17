import { Monogram, AgentAvatar, StatusPill, Stat, BottomTab } from '../Shared';

type HomeProps = {
  teams: [string, string];
  venue: string;
  battingTeam: string;
  userScore: number;
  predictorScore: number;
  matchesPlayed: number;
  onJoinMatch: () => void;
  onNavigate?: (id: string) => void;
  onUserProfile?: () => void;
};

export function ScreenHome({ teams, venue, battingTeam, onJoinMatch, userScore, predictorScore, matchesPlayed, onNavigate, onUserProfile }: HomeProps) {
  const teamA = teams[0]?.substring(0, 3).toUpperCase() || "MUM";
  const teamB = teams[1]?.substring(0, 3).toUpperCase() || "KOL";

  return (
    <div className="sl-screen" style={{ overflow: "hidden" }}>
      {/* header */}
      <div className="sl-content" style={{ padding: "8px 22px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 0.08, color: "var(--light-3)", textTransform: "uppercase" as const }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 26, fontWeight: 600, letterSpacing: -0.02, color: "var(--light-0)", marginTop: 2 }}>Tonight's panel</div>
        </div>
        <div onClick={onUserProfile} style={{
          width: 34, height: 34, borderRadius: 10,
          background: "var(--ink-2)", border: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--light-2)", cursor: "pointer",
          transition: "background 0.15s ease",
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 13c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </div>
      </div>

      <div className="sl-content" style={{ flex: 1, overflowY: "auto", padding: "0 22px 28px" }}>
        {/* live now hero card */}
        <div style={{
          position: "relative", borderRadius: 22, overflow: "hidden",
          background: "linear-gradient(155deg, oklch(0.22 0.06 145) 0%, oklch(0.16 0.02 240) 60%)",
          padding: "18px 18px 18px",
          border: "1px solid rgba(120, 220, 120, 0.12)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <StatusPill kind="live">Live · Ready</StatusPill>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-2)", letterSpacing: 0.06 }}>{venue.toUpperCase()}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
            <Monogram code={teamA} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 20, color: "var(--light-0)", letterSpacing: -0.01, fontWeight: 600 }}>
                {teams[0]}
              </div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", marginTop: 1, letterSpacing: 0.04 }}>
                {battingTeam} batting first
              </div>
            </div>
            <Monogram code={teamB} size={28} />
          </div>

          <div style={{
            marginTop: 14, display: "flex", alignItems: "center", gap: 8,
            padding: "10px 12px", borderRadius: 12,
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{ display: "flex", gap: -2 }}>
              <AgentAvatar agent="stats" size={20} />
              <AgentAvatar agent="roast" size={20} />
              <AgentAvatar agent="predict" size={20} />
            </div>
            <div style={{ flex: 1, fontSize: 11.5, color: "var(--light-2)", letterSpacing: -0.01 }}>
              Panel is ready to call balls
            </div>
            <div onClick={onJoinMatch} style={{
              padding: "6px 12px", borderRadius: 999, background: "var(--light-0)", color: "var(--ink-0)",
              fontFamily: "var(--f-display)", fontWeight: 600, fontSize: 11, letterSpacing: -0.01,
              cursor: "pointer",
            }}>Join →</div>
          </div>
        </div>

        {/* season stats */}
        <div style={{
          marginTop: 22, padding: "16px 16px 14px",
          background: "var(--ink-2)", borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 0.08, color: "var(--light-3)", textTransform: "uppercase" as const }}>
              Season · {matchesPlayed} matches
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: userScore > predictorScore ? "var(--pitch-1)" : "var(--red-0)", letterSpacing: 0.06 }}>
              {userScore > predictorScore ? "+" : ""}{userScore - predictorScore} vs AI
            </div>
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 12, alignItems: "baseline" }}>
            <Stat big={`${userScore}`} sub="YOUR PTS" />
            <Stat big={`${predictorScore}`} sub="AI PTS" />
          </div>
        </div>
      </div>

      {/* bottom tab */}
      <BottomTab active="matches" onNavigate={onNavigate} />
    </div>
  );
}
