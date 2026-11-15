// Pure size-matching engine — no DB, no HTTP. Easy to unit test.
import type { Category, FitPref, FitType } from '@/types';

export type Range = { min: number; max: number };
export type SizeRow = { label: string; ranges: Record<string, Range> };

const WEIGHTS: Record<Category, Record<string, number>> = {
  jeans:  { waist: 3, hip: 2, inseam: 0.5 },
  tshirt: { chest: 3, shoulder: 1.5, length: 0.5 },
  shirt:  { chest: 3, shoulder: 1.5, neck: 2, sleeve: 1 },
};

const FIT_OFFSET: Record<FitPref, number> = { snug: -1.5, regular: 0, roomy: 2 };

const CUT_OFFSET: Record<FitType, number> = {
  skinny: 1,
  slim: 0.5,
  straight: 0,
  relaxed: -1,
  baggy: -2,
};

const STRETCH_OFFSET = -1;

function gap(v: number, r: Range): number {
  if (v < r.min) return r.min - v;
  if (v > r.max) return v - r.max;
  return 0;
}

export function scoreRows(
  rows: SizeRow[],
  body: Record<string, number>,
  category: Category,
  fitPref: FitPref,
  fitType: FitType = 'straight',
  stretch = false,
): { label: string; score: number }[] {
  const weights = WEIGHTS[category];
  const offset = FIT_OFFSET[fitPref] + CUT_OFFSET[fitType] + (stretch ? STRETCH_OFFSET : 0);

  return rows
    .map((row) => {
      let score = 0;
      for (const [measure, w] of Object.entries(weights)) {
        const v = body[measure];
        const r = row.ranges[measure];
        if (v === undefined || !r) continue;
        const adj = v + offset;
        score += w * gap(adj, r);
        score += 0.01 * w * Math.abs(adj - (r.min + r.max) / 2);
      }
      return { label: row.label, score };
    })
    .sort((a, b) => a.score - b.score);
}

export function getConfidence(
  scored: { label: string; score: number }[],
  body: Record<string, number>,
  category: Category,
): 'high' | 'medium' | 'low' {
  if (scored.length === 0) return 'low';
  const best = scored[0].score;
  const second = scored[1]?.score ?? Infinity;
  const keyCount = Object.keys(WEIGHTS[category]).filter((m) => body[m] !== undefined).length;

  // If key measurements are missing (fewer than 2 measurements provided), confidence is low
  if (keyCount < 2) return 'low';

  if (best < 1 && second - best >= 3) return 'high';
  if (best < 3 || second - best < 3) return 'medium';
  return 'low';
}

export function buildBreakdown(
  bestRow: SizeRow,
  body: Record<string, number>,
  category: Category,
) {
  return Object.keys(WEIGHTS[category])
    .filter((m) => body[m] !== undefined && bestRow.ranges[m])
    .map((m) => {
      const r = bestRow.ranges[m];
      const user = body[m];
      let status: 'good' | 'snug' | 'loose' | 'tight';
      if (user < r.min - 2)      status = 'tight';
      else if (user > r.max + 2) status = 'loose';
      else if (user < r.min)     status = 'snug';
      else                       status = 'good';
      return { measure: m, user, range: r, status };
    });
}

export function measurementsFromReference(row: SizeRow): Record<string, number> {
  const body: Record<string, number> = {};
  for (const [measure, range] of Object.entries(row.ranges)) {
    body[measure] = (range.min + range.max) / 2;
  }
  return body;
}

export function mergeReferences(
  refs: Record<string, number>[],
): { merged: Record<string, number>; farApart: boolean } {
  if (refs.length === 0) return { merged: {}, farApart: false };
  if (refs.length === 1) return { merged: refs[0], farApart: false };

  const allKeys = [...new Set(refs.flatMap(Object.keys))];
  const merged: Record<string, number> = {};
  let farApart = false;

  for (const key of allKeys) {
    const vals = refs.map((r) => r[key]).filter((v): v is number => v !== undefined);
    if (vals.length === 0) continue;
    merged[key] = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (Math.max(...vals) - Math.min(...vals) > 4) farApart = true;
  }

  return { merged, farApart };
}

