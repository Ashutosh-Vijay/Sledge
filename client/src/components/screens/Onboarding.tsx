
import { Ic } from '../Shared';

type OnboardingProps = {
  onStart: () => void;
};

export function ScreenOnboarding({ onStart }: OnboardingProps) {
  return (
    <div className="sl-screen sl-grid" style={{ position: "relative", overflow: "hidden" }}>
      {/* deep gradient behind the title */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 50% at 50% 30%, oklch(0.22 0.06 145 / 0.5), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* top mark */}
      <div className="sl-content" style={{ padding: "8px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: "var(--pitch-1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--ink-0)", fontFamily: "var(--f-mono)", fontWeight: 600, fontSize: 13,
          }}>S</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 0.08, color: "var(--light-2)", textTransform: "uppercase" as const }}>Sledge</div>
        </div>
        <div className="sl-tag" style={{ fontSize: 9 }}>v0.1 · agentic premier league</div>
      </div>

      {/* hero */}
      <div className="sl-content" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: 0.12,
          color: "var(--pitch-1)", textTransform: "uppercase" as const, marginBottom: 18,
        }}>A second screen for the only screen that matters</div>

        <h1 style={{
          fontFamily: "var(--f-display)", fontSize: "clamp(48px, 6vw, 72px)", lineHeight: 0.95,
          letterSpacing: "-0.04em", margin: 0, fontWeight: 600, color: "var(--light-0)",
        }}>
          Call<br/>every<br/>
          <span style={{ color: "var(--pitch-1)", fontStyle: "italic", fontWeight: 500 }}>ball.</span>
        </h1>

        <p style={{
          marginTop: 22, fontSize: 14.5, lineHeight: 1.45, color: "var(--light-2)",
          maxWidth: 420, letterSpacing: -0.01,
        }}>
          Tap your call before each delivery. Three AI agents react — one quotes the numbers, one slanders you, one calls it before it happens.
        </p>

        {/* three principles */}
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 14 }}>
          {([
            ["01", "Dot · Boundary · Wicket · Other", "Four buttons. Five seconds per ball."],
            ["02", "Three agents, three temperatures", "Stats. Roast. Prediction. In parallel."],
            ["03", "Ask the panel anything", "They'll answer in character."],
          ] as const).map(([n, head, sub]) => (
            <div key={n} style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)" }}>{n}</span>
              <div>
                <div style={{ fontSize: 13.5, color: "var(--light-1)", letterSpacing: -0.01, fontWeight: 500 }}>{head}</div>
                <div style={{ fontSize: 11.5, color: "var(--light-3)", marginTop: 2 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="sl-content" style={{ padding: "20px 24px 36px", position: "relative", zIndex: 1 }}>
        <button className="sl-btn" onClick={onStart} style={{ width: "100%", maxWidth: 400, justifyContent: "center", padding: "16px", fontSize: 15.5 }}>
          Pick tonight's match
          <Ic.chevron />
        </button>
        <div style={{ textAlign: "center", marginTop: 14, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", letterSpacing: 0.06, maxWidth: 400 }}>
          NO ACCOUNT · NO PUSH NOTIFS · NO BS
        </div>
      </div>
    </div>
  );
}
