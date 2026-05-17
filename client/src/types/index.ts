export type ExtraKind = 'wide' | 'noball' | 'legbye' | 'bye' | null;

export type Ball = {
  over: number;
  ball: number;
  batter: string;
  nonStriker: string;
  bowler: string;
  runs: number;
  isWicket: boolean;
  isBoundary: boolean;
  isDot: boolean;
  outcome: 'Dot' | 'Boundary' | 'Wicket' | 'Other';
  wicketInfo?: { playerOut: string; kind: string };
  extra?: ExtraKind;
};

export type MatchContext = {
  over: number;
  score: string;
  userScoreTotal: number;
  predictorScoreTotal: number;
};

export type AgentResponse = {
  statsNerd: string;
  roastAgent: string;
  predictor: string;
};
