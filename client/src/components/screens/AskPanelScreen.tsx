import React from 'react';
import { AgentAvatar, AGENT_META, Ic, Chip, type AgentId } from '../Shared';
import type { FeedItem } from './LivePreball';

type Props = {
  feed: FeedItem[];
  matchScore: string;
  over: string;
  onAsk: (q: string) => void;
  onBack: () => void;
  disabled: boolean;
};

const AM: Record<string, AgentId> = { statsNerd: 'stats', roastAgent: 'roast', predictor: 'predict' };

export function ScreenAskPanel({ feed, matchScore, over, onAsk, onBack, disabled }: Props) {
  const [text, setText] = React.useState('');
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth' }); }, [feed]);

  const submit = () => { const q = text.trim(); if (!q || disabled) return; onAsk(q); setText(''); };

  return (
    <div className="sl-screen" style={{ overflow: "hidden" }}>
      <div className="sl-content" style={{ padding: "10px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div onClick={onBack} style={{ width: 32, height: 32, borderRadius: 10, background: "var(--ink-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--light-2)", cursor: "pointer" }}><Ic.back /></div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="sl-live-dot" />
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--red-0)", letterSpacing: 0.08 }}>LIVE</span>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)" }}>· {over} ov · {matchScore}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--light-1)", marginTop: 1, fontWeight: 500 }}>Ask the panel</div>
        </div>
      </div>

      <div className="sl-content" style={{ flex: 1, overflowY: "auto", padding: "14px 18px 16px" }}>
        {feed.filter(f => f.agentId === 'user' || AM[f.agentId]).slice(-20).map((item) => {
          if (item.agentId === 'user') {
            return (<div key={item.id} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
              <div style={{ maxWidth: "80%", padding: "10px 14px", background: "var(--light-0)", color: "var(--ink-0)", borderRadius: "16px 16px 4px 16px", fontSize: 13, lineHeight: 1.4, fontWeight: 500 }}>{item.message}</div>
            </div>);
          }
          const ak = AM[item.agentId]; if (!ak) return null;
          const m = AGENT_META[ak];
          return (<div key={item.id} style={{ display: "flex", gap: 10, animation: "sl-fade-up .35s ease both", marginBottom: 18 }}>
            <AgentAvatar agent={ak} size={28} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 0.08, color: m.color, textTransform: "uppercase" as const, marginBottom: 4, fontWeight: 500 }}>{m.name}</div>
              <div style={{ background: m.bg, borderRadius: "4px 14px 14px 14px", padding: "10px 13px", fontSize: 12.5, lineHeight: 1.45, color: "var(--light-1)", border: "1px solid rgba(255,255,255,0.04)" }}>{item.message}</div>
            </div>
          </div>);
        })}
        {disabled && <div style={{ display: "flex", gap: 10, opacity: 0.7 }}><AgentAvatar agent="stats" size={24} /><div style={{ display: "flex", alignItems: "center", gap: 4, paddingTop: 8 }}>{[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: 3, background: "var(--stats)", animation: `sl-pulse-dot 1.1s ${i*0.15}s ease-in-out infinite` }} />)}</div></div>}
        <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 6 }}>
          <Chip onClick={() => onAsk("Who wins this match?")}>Who wins?</Chip>
          <Chip onClick={() => onAsk("Win probability now?")}>Win prob?</Chip>
          <Chip onClick={() => onAsk("Roast my last call")}>Roast me</Chip>
        </div>
        <div ref={ref} />
      </div>

      <div className="sl-content" style={{ padding: "0 14px 30px", background: "var(--ink-0)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 6px 6px 14px", borderRadius: 999, background: "var(--ink-2)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <input type="text" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Ask the panel..." disabled={disabled} maxLength={500}
            style={{ flex: 1, fontSize: 13, color: "var(--light-1)", background: "transparent", border: "none", outline: "none", fontFamily: "var(--f-body)" }} />
          <button onClick={submit} disabled={disabled || !text.trim()} style={{ width: 36, height: 36, borderRadius: 999, border: "none", background: "var(--pitch-1)", color: "var(--ink-0)", display: "flex", alignItems: "center", justifyContent: "center", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled || !text.trim() ? 0.5 : 1 }}><Ic.send /></button>
        </div>
      </div>
    </div>
  );
}
