import React from 'react';

// ── Team Colors ──────────────────────────────────────────────
export const TEAM_COLORS: Record<string, { bg: string; fg: string }> = {
  MUM: { bg: "linear-gradient(135deg,#2e6df5,#1145bb)", fg: "#fff" },
  BOM: { bg: "linear-gradient(135deg,#2e6df5,#1145bb)", fg: "#fff" },
  BLR: { bg: "linear-gradient(135deg,#e23232,#7a1010)", fg: "#fff" },
  MAA: { bg: "linear-gradient(135deg,#f4c43a,#c98a05)", fg: "#1a1100" },
  DEL: { bg: "linear-gradient(135deg,#11589a,#0b3a6c)", fg: "#fff" },
  KOL: { bg: "linear-gradient(135deg,#5a2d8a,#2c1450)", fg: "#fff" },
  HYD: { bg: "linear-gradient(135deg,#f06614,#9c3a05)", fg: "#fff" },
  JAI: { bg: "linear-gradient(135deg,#ff5fb4,#8a1c5a)", fg: "#fff" },
  AHM: { bg: "linear-gradient(135deg,#cf8b3d,#5a3a10)", fg: "#fff" },
  LUC: { bg: "linear-gradient(135deg,#0aa3e8,#0060a0)", fg: "#fff" },
  GUJ: { bg: "linear-gradient(135deg,#48bfe3,#1a6e99)", fg: "#fff" },
  PUN: { bg: "linear-gradient(135deg,#dc2626,#8b1515)", fg: "#fff" },
};

// ── Monogram ─────────────────────────────────────────────────
export function Monogram({ code = "BOM", size = 36 }: { code?: string; size?: number }) {
  const c = TEAM_COLORS[code] || TEAM_COLORS.BOM;
  return (
    <div className="sl-monogram" style={{
      background: c.bg, color: c.fg,
      width: size, height: size,
      borderRadius: size * 0.28,
      fontSize: size * 0.33,
    }}>
      {code}
    </div>
  );
}

// ── Agent Avatar ─────────────────────────────────────────────
const AVATAR_MAP = {
  stats:   { bg: "var(--stats-bg)",   ring: "var(--stats)",   glyph: "Σ" },
  roast:   { bg: "var(--roast-bg)",   ring: "var(--roast)",   glyph: "🜲" },
  predict: { bg: "var(--predict-bg)", ring: "var(--predict)", glyph: "◎" },
} as const;

export type AgentId = "stats" | "roast" | "predict";

export function AgentAvatar({ agent, size = 28 }: { agent: AgentId; size?: number }) {
  const a = AVATAR_MAP[agent];
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32,
      background: a.bg,
      boxShadow: `inset 0 0 0 1px ${a.ring}`,
      color: a.ring,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--f-mono)", fontSize: size * 0.5, fontWeight: 500,
      flexShrink: 0,
    }}>{a.glyph}</div>
  );
}

// ── Agent Meta ────────────────────────────────────────────────
export const AGENT_META: Record<AgentId, { name: string; color: string; bg: string }> = {
  stats:   { name: "Stats Nerd", color: "var(--stats)",   bg: "var(--stats-bg)" },
  roast:   { name: "Roast",      color: "var(--roast)",   bg: "var(--roast-bg)" },
  predict: { name: "Predictor",  color: "var(--predict)", bg: "var(--predict-bg)" },
};

// ── Agent Line ───────────────────────────────────────────────
export function AgentLine({ agent, message, mono }: { agent: AgentId; message: string; mono?: boolean }) {
  const m = AGENT_META[agent];
  return (
    <div style={{ display: "flex", gap: 10, animation: "sl-fade-up .35s ease both" }}>
      <AgentAvatar agent={agent} size={24} />
      <div style={{ flex: 1, paddingTop: 1 }}>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 0.06,
          textTransform: "uppercase" as const, color: m.color, marginBottom: 3, fontWeight: 500,
        }}>{m.name}</div>
        <div style={{
          fontSize: 12.5, lineHeight: 1.42, color: "var(--light-1)",
          fontFamily: mono ? "var(--f-mono)" : "var(--f-body)",
          letterSpacing: mono ? 0 : -0.01,
        }}>{message}</div>
      </div>
    </div>
  );
}

// ── Status Pill ──────────────────────────────────────────────
const PILL_STYLES: Record<string, { bg: string; fg: string; dot: boolean }> = {
  live:  { bg: "var(--red-bg)",   fg: "var(--red-0)",   dot: true },
  soon:  { bg: "var(--ink-3)",    fg: "var(--light-2)", dot: false },
  recap: { bg: "var(--ink-3)",    fg: "var(--light-3)", dot: false },
  win:   { bg: "var(--pitch-bg)", fg: "var(--pitch-1)", dot: false },
  loss:  { bg: "var(--red-bg)",   fg: "var(--red-0)",   dot: false },
};

export function StatusPill({ kind = "live", children }: { kind?: string; children: React.ReactNode }) {
  const s = PILL_STYLES[kind] || PILL_STYLES.live;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px", borderRadius: 999,
      background: s.bg, color: s.fg,
      fontFamily: "var(--f-mono)", fontSize: 9.5, fontWeight: 500,
      letterSpacing: 0.06, textTransform: "uppercase" as const,
    }}>
      {s.dot && <span className="sl-live-dot" />}
      {children}
    </span>
  );
}

// ── Icons ────────────────────────────────────────────────────
export const Ic = {
  back: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  send: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8l12-6-3 14-3-6-6-2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/></svg>,
  pause: () => <svg width="14" height="14" viewBox="0 0 14 14"><rect x="3" y="2" width="3" height="10" fill="currentColor"/><rect x="8" y="2" width="3" height="10" fill="currentColor"/></svg>,
  fast: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3l6 5-6 5V3zM8 3l6 5-6 5V3z" fill="currentColor"/></svg>,
  spark: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v3M7 10v3M1 7h3M10 7h3M3 3l2 2M9 9l2 2M3 11l2-2M9 5l2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  chevron: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  share: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l4-4 4 4M7 3v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  export: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8m0-8L4 4m3-3l3 3M2 9v3a1 1 0 001 1h8a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  user: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 13c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
};

// ── Section Label ────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22, marginBottom: 8 }}>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--light-3)", textTransform: "uppercase" as const }}>{children}</div>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

// ── Stat ─────────────────────────────────────────────────────
export function Stat({ big, sub }: { big: string; sub: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 22, fontWeight: 500, color: "var(--light-0)", letterSpacing: -0.01 }}>{big}</div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--light-3)", letterSpacing: 0.06, marginTop: 1 }}>{sub}</div>
    </div>
  );
}

// ── BigStat ──────────────────────────────────────────────────
export function BigStat({ label, value, sub, color, align = "left" }: { label: string; value: string; sub: string; color: string; align?: string }) {
  return (
    <div style={{ flex: 1, textAlign: align as any }}>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 0.08, color: "var(--light-3)", textTransform: "uppercase" as const }}>{label}</div>
      <div style={{ fontFamily: "var(--f-display)", fontSize: 38, color, fontWeight: 600, lineHeight: 1, marginTop: 4, letterSpacing: -0.02 }}>{value}</div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--light-3)", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

// ── Bottom Tab ───────────────────────────────────────────────
export function BottomTab({ active = "matches", onNavigate }: { active?: string; onNavigate?: (id: string) => void }) {
  const items: [string, string, React.ReactNode][] = [
    ["matches", "Matches", <svg key="1" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4"/><path d="M2.5 6.5h13M2.5 11.5h13M9 2c-2 3-2 11 0 14M9 2c2 3 2 11 0 14" stroke="currentColor" strokeWidth="1.3"/></svg>],
    ["panel", "Panel", <svg key="2" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="5" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="13" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c.5-2 2-3 4-3M16 14c-.5-2-2-3-4-3M9 16v-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>],
    ["you", "You", <svg key="3" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 16c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>],
  ];
  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      background: "var(--ink-0)",
      flexShrink: 0,
    }}>
      <div className="sl-content" style={{ padding: "8px 24px 26px", display: "flex", justifyContent: "space-around" }}>
      {items.map(([id, label, icon]) => (
        <div key={id} onClick={() => onNavigate?.(id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          color: id === active ? "var(--light-0)" : "var(--light-3)",
          cursor: "pointer",
        }}>
          {icon}
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 0.04 }}>{label}</div>
        </div>
      ))}
      </div>
    </div>
  );
}

// ── Bottom Mini (for live screens) ───────────────────────────
export function BottomMini({ active, onNavigate }: { active?: string; onNavigate?: (id: string) => void }) {
  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.05)",
      background: "var(--ink-0)",
      flexShrink: 0,
    }}>
      <div className="sl-content" style={{ padding: "6px 0 22px", display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
      {["matches", "panel", "you"].map(id => (
        <div key={id} onClick={() => onNavigate?.(id)} style={{
          fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 0.06,
          color: id === active ? "var(--light-0)" : "var(--light-3)",
          textTransform: "uppercase" as const, padding: "4px 0",
          borderTop: id === active ? "1px solid var(--pitch-1)" : "1px solid transparent",
          cursor: "pointer",
        }}>{id}</div>
      ))}
      </div>
    </div>
  );
}

// ── Pill (small inline button) ───────────────────────────────
export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      padding: "5px 9px", borderRadius: 8,
      background: "var(--ink-2)", border: "1px solid rgba(255,255,255,0.04)",
      color: "var(--light-2)",
    }}>{children}</div>
  );
}

// ── Side (YOU / AI score label) ──────────────────────────────
export function Side({ label, value, color, align }: { label: string; value: number; color: string; align: string }) {
  return (
    <div style={{ textAlign: align as any, minWidth: 38 }}>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 0.08, color: "var(--light-3)" }}>{label}</div>
      <div className="sl-mono" style={{ fontSize: 15, color, fontWeight: 500, lineHeight: 1, marginTop: 2 }}>{value}</div>
    </div>
  );
}

// ── Chip (suggestion) ────────────────────────────────────────
export function Chip({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      border: "1px solid rgba(255,255,255,0.08)",
      background: "var(--ink-1)",
      color: "var(--light-2)",
      padding: "6px 11px", borderRadius: 999,
      fontSize: 11.5, fontFamily: "var(--f-body)", letterSpacing: -0.01,
      cursor: "pointer",
    }}>{children}</button>
  );
}
