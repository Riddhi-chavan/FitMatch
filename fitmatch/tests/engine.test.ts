import { describe, it, expect } from 'vitest';
import {
  scoreRows,
  getConfidence,
  buildBreakdown,
  measurementsFromReference,
  mergeReferences,
  SizeRow,
} from '@/lib/engine';

const sampleJeansRows: SizeRow[] = [
  { label: '28', ranges: { waist: { min: 71, max: 74 }, hip: { min: 86, max: 89 }, inseam: { min: 78, max: 82 } } },
  { label: '30', ranges: { waist: { min: 76, max: 79 }, hip: { min: 91, max: 94 }, inseam: { min: 78, max: 82 } } },
  { label: '32', ranges: { waist: { min: 81, max: 84 }, hip: { min: 96, max: 99 }, inseam: { min: 78, max: 82 } } },
  { label: '34', ranges: { waist: { min: 86, max: 89 }, hip: { min: 101, max: 104 }, inseam: { min: 78, max: 82 } } },
  { label: '36', ranges: { waist: { min: 91, max: 94 }, hip: { min: 106, max: 109 }, inseam: { min: 78, max: 82 } } },
];

describe('FitMatch Size Engine', () => {
  it('1. A body inside exactly one size range returns that size with high confidence', () => {
    const body = { waist: 82, hip: 97, inseam: 80 };
    const scored = scoreRows(sampleJeansRows, body, 'jeans', 'regular');
    expect(scored[0].label).toBe('32');
    const conf = getConfidence(scored, body, 'jeans');
    expect(conf).toBe('high');
  });

  it('2. A body between two sizes returns the closer one with medium or low confidence', () => {
    // 30 ends at 79, 32 starts at 81. Exactly at 80.4 (closer to 30 or 32)
    const body = { waist: 80.2, hip: 95 };
    const scored = scoreRows(sampleJeansRows, body, 'jeans', 'regular');
    expect(['30', '32']).toContain(scored[0].label);
    const conf = getConfidence(scored, body, 'jeans');
    expect(['medium', 'low']).toContain(conf);
  });

  it('3. Snug preference shifts toward smaller size, roomy toward larger size', () => {
    // A border case around waist 80.5
    const body = { waist: 80.5, hip: 95 };
    const snugScored = scoreRows(sampleJeansRows, body, 'jeans', 'snug');
    const roomyScored = scoreRows(sampleJeansRows, body, 'jeans', 'roomy');
    expect(Number(snugScored[0].label)).toBeLessThanOrEqual(Number(roomyScored[0].label));
  });

  it('4. A missing key measurement lowers confidence and does not crash', () => {
    // only inseam provided, waist & hip missing
    const body = { inseam: 80 };
    const scored = scoreRows(sampleJeansRows, body, 'jeans', 'regular');
    expect(scored.length).toBe(sampleJeansRows.length);
    const conf = getConfidence(scored, body, 'jeans');
    expect(conf).toBe('low');
  });

  it('5. Cut offset: skinny cut leans larger, baggy cut leans smaller', () => {
    const body = { waist: 80.2, hip: 95.2 }; // between 30 and 32
    const skinny = scoreRows(sampleJeansRows, body, 'jeans', 'regular', 'skinny');
    const baggy = scoreRows(sampleJeansRows, body, 'jeans', 'regular', 'baggy');
    expect(Number(skinny[0].label)).toBeGreaterThanOrEqual(Number(baggy[0].label));
  });

  it('6. Stretch fabric offset leans towards a snugger size', () => {
    const body = { waist: 80.5, hip: 95.5 };
    const rigid = scoreRows(sampleJeansRows, body, 'jeans', 'regular', 'straight', false);
    const stretch = scoreRows(sampleJeansRows, body, 'jeans', 'regular', 'straight', true);
    expect(Number(stretch[0].label)).toBeLessThanOrEqual(Number(rigid[0].label));
  });

  it('7. Breakdown contains status for each measured dimension', () => {
    const body = { waist: 82, hip: 97 };
    const breakdown = buildBreakdown(sampleJeansRows[2], body, 'jeans');
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0].measure).toBe('waist');
    expect(breakdown[0].status).toBe('good');
  });

  it('8. Reference size accurately computes midpoints', () => {
    const row = sampleJeansRows[2]; // 32: waist 81-84, hip 96-99
    const estimated = measurementsFromReference(row);
    expect(estimated.waist).toBe(82.5);
    expect(estimated.hip).toBe(97.5);
  });

  it('9. Two reference items that disagree by more than 4cm are flagged as far apart', () => {
    const ref1 = { waist: 80, hip: 95 };
    const ref2 = { waist: 86, hip: 101 }; // 6cm diff
    const { merged, farApart } = mergeReferences([ref1, ref2]);
    expect(farApart).toBe(true);
    expect(merged.waist).toBe(83);
  });

  it('10. References that agree do not trigger farApart flag', () => {
    const ref1 = { waist: 81, hip: 96 };
    const ref2 = { waist: 83, hip: 98 }; // 2cm diff
    const { merged, farApart } = mergeReferences([ref1, ref2]);
    expect(farApart).toBe(false);
    expect(merged.waist).toBe(82);
  });
});
