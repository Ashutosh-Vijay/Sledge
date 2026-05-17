
import { Monogram, AgentAvatar, AGENT_META, Ic, type AgentId } from '../Shared';

type MatchDetailProps = {
  teams: [string, string];
  venue: string;
  battingTeam: string;
  onStart: () => void;
  onBack: () => void;
};

export function ScreenMatchDetail({ teams, venue, battingTeam, onStart, onBack }: MatchDetailProps) {
  const teamA = teams[0]?.substring(0, 3).toUpperCase() || "MUM";
  const teamB = teams[1]?.substring(0, 3).toUpperCase() || "KOL";

  return (
    <div className="sl-screen" style={{ overflow: "hidden" }}>
      {/* nav bar */}
      <div className="sl-content" style={{ padding: "4px 18px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--light-2)" }}>
        <div onClick={onBack} style={{ width: 32, height: 32, borderRadius: 10, background: "var(--ink-2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Ic.back />
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 0.06, color: "var(--light-3)", textTransform: "uppercase" as const }}>Match · Group stage</div>
        <div style={{ width: 32, height: 32 }} />
      </div>

      <div className="sl-content" style={{ flex: 1, overflowY: "auto" }}>
        {/* hero — the matchup */}
        <div style={{ padding: "16px 22px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <Monogram code={teamA} size={56} />
              <div style={{ fontFamily: "var(--f-display)", fontSize: 24, fontWeight: 600, marginTop: 10, letterSpacing: -0.02 }}>{teams[0]}</div>
            </div>
            <div style={{
              fontFamily: "var(--f-display)", fontStyle: "italic",
              fontSize: 38, color: "var(--pitch-1)", fontWeight: 500,
              padding: "0 14px",
            }}>v</div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}><Monogram code={teamB} size={56} /></div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 24, fontWeight: 600, marginTop: 10, letterSpacing: -0.02 }}>{teams[1]}</div>
            </div>
          </div>

          <div style={{
            marginTop: 18, padding: "11px 14px",
            background: "var(--ink-2)", border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)", letterSpacing: 0.06 }}>TOSS</div>
              <div style={{ fontSize: 13, marginTop: 2, color: "var(--light-1)" }}>{battingTeam} elected to <span style={{ color: "var(--pitch-1)" }}>bat</span></div>
            </div>
            <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.06)", margin: "0 12px" }} />
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)", letterSpacing: 0.06 }}>VENUE</div>
              <div style={{ fontSize: 13, marginTop: 2, color: "var(--light-1)" }}>{venue}</div>
            </div>
          </div>
        </div>

        {/* panel preview */}
        <div style={{ padding: "22px 22px 0" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)", letterSpacing: 0.08, marginBottom: 10, textTransform: "uppercase" as const }}>Your panel for the call</div>
          {([
            ["stats" as AgentId, "Stats Nerd", "cites cold numbers. 47 ms / response.", "ACC 64%"],
            ["roast" as AgentId, "Roast", "trash-talks every wrong call you make.", "BURNS 312"],
            ["predict" as AgentId, "Predictor", "calls each ball before it's bowled.", "ACC 51%"],
          ]).map(([agent, name, sub, badge]) => (
            <div key={agent} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 12px", marginBottom: 8,
              background: "var(--ink-2)", borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <AgentAvatar agent={agent as AgentId} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "var(--light-1)", letterSpacing: -0.01, fontWeight: 500 }}>{name}</div>
                <div style={{ fontSize: 11, color: "var(--light-3)", marginTop: 2 }}>{sub}</div>
              </div>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: 9.5, color: AGENT_META[agent as AgentId].color,
                letterSpacing: 0.06, padding: "3px 7px", borderRadius: 6,
                background: AGENT_META[agent as AgentId].bg,
              }}>{badge}</div>
            </div>
          ))}
        </div>
      </div>

      {/* fixed CTA */}
      <div className="sl-content" style={{ padding: "12px 22px 30px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "var(--ink-0)", flexShrink: 0 }}>
        <button className="sl-btn" onClick={onStart} style={{ width: "100%", justifyContent: "space-between", padding: "16px 20px" }}>
          <span>Call the first ball</span>
          <span style={{ fontFamily: "var(--f-mono)", fontWeight: 500, fontSize: 12, color: "var(--light-3)" }}>→</span>
        </button>
      </div>
    </div>
  );
}
