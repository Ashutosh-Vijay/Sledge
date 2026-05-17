import { AgentAvatar, AGENT_META, type AgentId } from '../Shared';

type Props = { onBack: () => void };

function PanelCard({ agent, name, tag, model, temperature, tools, quote, stats }: {
  agent: AgentId; name: string; tag: string; model: string; temperature: string;
  tools?: string[]; quote: string; stats: [string, string][];
}) {
  const m = AGENT_META[agent];
  return (
    <div style={{
      marginBottom: 14, padding: "16px 16px 14px", background: "var(--ink-1)",
      border: "1px solid rgba(255,255,255,0.04)", borderRadius: 18, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: 60, background: m.bg, opacity: 0.6, filter: "blur(8px)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
        <AgentAvatar agent={agent} size={42} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 18, color: "var(--light-0)", fontWeight: 600, letterSpacing: -0.02 }}>{name}</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: m.color, letterSpacing: 0.06, marginTop: 2 }}>{tag}</div>
        </div>
        <div style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "var(--f-mono)", fontSize: 9.5, color: m.color, letterSpacing: 0.04 }}>T {temperature}</div>
      </div>

      <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--ink-0)", borderRadius: 12, borderLeft: `2px solid ${m.color}`, fontSize: 12, lineHeight: 1.45, color: "var(--light-1)", fontStyle: "italic" }}>"{quote}"</div>

      {tools && <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
        {tools.map(t => <span key={t} style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 0.02, padding: "3px 7px", borderRadius: 5, background: m.bg, color: m.color, border: "1px solid rgba(255,255,255,0.04)" }}>{t}()</span>)}
      </div>}

      <div style={{ display: "flex", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {stats.map(([k, v]) => <div key={k} style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 0.06, color: "var(--light-3)" }}>{k}</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 13, color: "var(--light-0)", marginTop: 2, fontWeight: 500 }}>{v}</div>
        </div>)}
      </div>

      <div style={{ marginTop: 10, fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--light-3)", letterSpacing: 0.04 }}>{model}</div>
    </div>
  );
}

export function ScreenPanel({ onBack }: Props) {
  return (
    <div className="sl-screen" style={{ overflow: "hidden" }}>
      <div className="sl-content" style={{ padding: "4px 20px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div onClick={onBack} style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--light-3)", textTransform: "uppercase" as const, cursor: "pointer" }}>← Back · The panel</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 28, fontWeight: 600, letterSpacing: -0.02, marginTop: 2, color: "var(--light-0)" }}>
            Three opinions,<br/><span style={{ fontStyle: "italic", color: "var(--pitch-1)", fontWeight: 500 }}>no consensus</span>.
          </div>
        </div>
      </div>

      <div className="sl-content" style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
        <PanelCard agent="stats" name="Stats Nerd" tag="cold numbers · 47 ms" model="Gemini 2.5 Flash · 3 tools" temperature="0.3"
          tools={["get_player_career_stats", "get_batsman_vs_bowler", "get_recent_form"]}
          quote="Hazlewood's economy in over 14 of T20s this season: 9.12. Below his career mean."
          stats={[["ACCURACY", "64%"], ["AVG RESPONSE", "1.4s"], ["TOOL CALLS", "412"]]} />
        <PanelCard agent="roast" name="Roast" tag="indian cricket twitter · weaponised" model="Gemini 2.5 Flash · no tools" temperature="0.9"
          quote="Bro called Boundary on a yorker. The pitch isn't the only flat thing here — see also: your IQ."
          stats={[["BURNS", "312"], ["TEMPERATURE", "0.9"], ["BANNED", "0"]]} />
        <PanelCard agent="predict" name="Predictor" tag="probabilistic · self-aware" model="Gemini 2.5 Flash · no tools" temperature="0.7"
          quote="My pre-ball call: Dot at 58%. Boundary at 24%. Wicket at 7%. I will be smug or self-deprecating."
          stats={[["VS USER", "30/70"], ["CONFIDENCE", "61%"], ["BEST", "Ov 9"]]} />

        <div style={{ marginTop: 22, padding: "14px", background: "var(--ink-1)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--light-3)", textTransform: "uppercase" as const }}>How it works</div>
          <div style={{ fontSize: 12, color: "var(--light-2)", marginTop: 8, lineHeight: 1.45 }}>
            Each ball triggers three parallel Gemini calls. Stats Nerd has function-calling against a stats backend. Roast and Predictor run hot on temperature, no tools.
          </div>
        </div>
      </div>
    </div>
  );
}
