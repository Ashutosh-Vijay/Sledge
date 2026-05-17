import { StatusPill, Monogram, SectionLabel, BigStat, Ic } from '../Shared';

type RecapProps = {
  userScore: number;
  predictorScore: number;
  streak: number;
  teams: [string, string];
  onBack: () => void;
};

export function ScreenRecap({ userScore, predictorScore, streak, teams, onBack }: RecapProps) {
  const won = userScore >= predictorScore;
  const tA = teams[0]?.substring(0, 3).toUpperCase() || "BOM";
  const tB = teams[1]?.substring(0, 3).toUpperCase() || "BLR";

  return (
    <div className="sl-screen" style={{ overflow: "hidden" }}>
      <div className="sl-content" style={{ padding: "4px 18px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--light-2)", flexShrink: 0 }}>
        <div onClick={onBack} style={{ width: 32, height: 32, borderRadius: 10, background: "var(--ink-2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Ic.back /></div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", letterSpacing: 0.06, textTransform: "uppercase" as const }}>Recap · Match Over</div>
        <div style={{ width: 32, height: 32 }} />
      </div>

      <div className="sl-content" style={{ flex: 1, overflowY: "auto", padding: "12px 18px 24px" }}>
        <div style={{
          position: "relative", overflow: "hidden", borderRadius: 22, padding: "20px 18px 18px",
          background: won ? "linear-gradient(155deg, var(--pitch-bg) 0%, var(--ink-1) 80%)" : "linear-gradient(155deg, var(--red-bg) 0%, var(--ink-1) 80%)",
          border: won ? "1px solid oklch(0.78 0.18 142 / 0.18)" : "1px solid oklch(0.78 0.20 25 / 0.18)",
        }}>
          <StatusPill kind={won ? "win" : "loss"}>Final result</StatusPill>
          <div style={{
            fontFamily: "var(--f-display)", fontSize: 44, fontWeight: 600, letterSpacing: -0.03,
            color: won ? "var(--pitch-1)" : "var(--red-0)", marginTop: 14, lineHeight: 1,
          }}>
            {won ? <>You beat<br/>the panel<span style={{ color: "var(--light-0)" }}>.</span></> : <>AI wins<br/>this time<span style={{ color: "var(--light-0)" }}>.</span></>}
          </div>

          <div style={{ display: "flex", marginTop: 18, gap: 10, alignItems: "stretch" }}>
            <BigStat label="YOU" value={String(userScore)} sub="points scored" color={won ? "var(--pitch-1)" : "var(--light-1)"} />
            <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
            <BigStat label="PANEL" value={String(predictorScore)} sub="predictor agent" color="var(--predict)" align="right" />
          </div>

          {streak > 0 && <div style={{
            marginTop: 14, padding: "10px 12px", background: "rgba(0,0,0,0.30)", borderRadius: 12,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", letterSpacing: 0.06 }}>BEST STREAK</div>
            <div style={{ flex: 1, fontFamily: "var(--f-mono)", fontSize: 14, color: "var(--light-0)" }}>{streak} in a row</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--pitch-1)" }}>🔥</div>
          </div>}
        </div>

        <SectionLabel>Match summary</SectionLabel>
        <div style={{ padding: "12px 14px", borderRadius: 14, background: "var(--ink-2)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Monogram code={tA} size={28} />
            <div style={{ flex: 1, fontSize: 13, color: "var(--light-1)" }}>{teams[0]}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <Monogram code={tB} size={28} />
            <div style={{ flex: 1, fontSize: 13, color: "var(--light-1)" }}>{teams[1]}</div>
          </div>
        </div>

        <button onClick={onBack} style={{
          marginTop: 18, width: "100%", padding: "14px",
          background: "var(--light-0)", color: "var(--ink-0)",
          border: "none", borderRadius: 999, cursor: "pointer",
          fontFamily: "var(--f-display)", fontWeight: 600, fontSize: 14,
          display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
        }}>
          Back to home <Ic.chevron />
        </button>
      </div>
    </div>
  );
}
