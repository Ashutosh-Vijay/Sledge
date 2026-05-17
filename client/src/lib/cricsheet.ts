import type { Ball, ExtraKind } from '../types';

export function parseCricsheet(data: any): Ball[] {
  const balls: Ball[] = [];

  if (!data || !data.innings || data.innings.length === 0) return balls;

  for (const inning of data.innings) {
    for (const over of inning.overs) {
      const overNum = over.over;
      let ballNum = 1;

      for (const delivery of over.deliveries) {
        const runs = delivery.runs.total;
        const isWicket = !!delivery.wickets;
        const isBoundary = (runs === 4 || runs === 6) && !delivery.extras;
        const isDot = runs === 0 && !isWicket;

        // Detect extras (wides, no-balls, leg-byes, byes)
        let extra: ExtraKind = null;
        if (delivery.extras) {
          if (delivery.extras.wides) extra = 'wide';
          else if (delivery.extras.noballs) extra = 'noball';
          else if (delivery.extras.legbyes) extra = 'legbye';
          else if (delivery.extras.byes) extra = 'bye';
        }

        let outcome: 'Dot' | 'Boundary' | 'Wicket' | 'Other' = 'Other';
        if (isWicket) outcome = 'Wicket';
        else if (isBoundary) outcome = 'Boundary';
        else if (isDot) outcome = 'Dot';

        const wicketInfo = isWicket && delivery.wickets?.[0]
          ? { playerOut: delivery.wickets[0].player_out, kind: delivery.wickets[0].kind }
          : undefined;

        balls.push({
          over: overNum,
          ball: ballNum,
          batter: delivery.batter,
          nonStriker: delivery.non_striker || '',
          bowler: delivery.bowler,
          runs,
          isWicket,
          isBoundary,
          isDot,
          outcome,
          wicketInfo,
          extra,
        });

        // Wides + no-balls don't count as a "legal" delivery — over doesn't advance
        if (extra !== 'wide' && extra !== 'noball') {
          ballNum++;
        }
      }
    }
  }

  return balls;
}
