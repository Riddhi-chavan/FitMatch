import SizeChart from '@/lib/models/SizeChart';
import Product from '@/lib/models/Product';
import {
  scoreRows,
  getConfidence,
  buildBreakdown,
  measurementsFromReference,
  mergeReferences,
  SizeRow,
} from '@/lib/engine';
import type { Profile, SizeResult, FitPref, Category, FitType } from '@/types';

export async function computeRecommendation(
  product: any,
  profile: Profile,
  fitPrefOverride?: FitPref
): Promise<SizeResult> {
  const category: Category = product.category;
  const fitPref: FitPref = fitPrefOverride || profile.fitPref || 'regular';
  const fitType: FitType = product.fitType || 'straight';
  const stretch: boolean = Boolean(product.stretch);

  // 1. Resolve body measurements
  let body: Record<string, number> = { ...(profile.measurements as Record<string, number>) };

  // If measurements are missing key fields but references are present, estimate from references
  if (Object.keys(body).length === 0 && profile.references && profile.references.length > 0) {
    const refEstimates: Record<string, number>[] = [];
    for (const ref of profile.references) {
      const refChart = await SizeChart.findOne({
        brandId: ref.brandId,
        category: ref.category,
        gender: profile.gender,
      }).lean();

      if (refChart && (refChart as any).rows) {
        const row = (refChart as any).rows.find(
          (r: any) => r.label.toLowerCase() === ref.size.toLowerCase()
        );
        if (row) {
          const rawRanges = row.ranges instanceof Map ? Object.fromEntries(row.ranges) : row.ranges;
          const rangesObj: Record<string, { min: number; max: number }> = {};
          for (const [k, v] of Object.entries(rawRanges || {})) {
            rangesObj[k] = v as { min: number; max: number };
          }
          refEstimates.push(measurementsFromReference({ label: row.label, ranges: rangesObj }));
        }
      }
    }
    if (refEstimates.length > 0) {
      body = mergeReferences(refEstimates).merged;
    }
  }

  // 2. Fetch the SizeChart for the target product
  const chart = await SizeChart.findOne({
    brandId: product.brandId._id || product.brandId,
    category,
    gender: product.gender,
  })
    .populate('brandId', 'name')
    .lean();

  if (!chart || !(chart as any).rows || (chart as any).rows.length === 0) {
    throw new Error(`Size chart not found for brand and category: ${category}`);
  }

  // 3. Format rows
  const rows: SizeRow[] = (chart as any).rows.map((r: any) => {
    const rawRanges = r.ranges instanceof Map ? Object.fromEntries(r.ranges) : r.ranges;
    const rangesObj: Record<string, { min: number; max: number }> = {};
    for (const [k, v] of Object.entries(rawRanges || {})) {
      rangesObj[k] = v as { min: number; max: number };
    }
    return { label: r.label, ranges: rangesObj };
  });

  // 4. Score rows
  const scored = scoreRows(rows, body, category, fitPref, fitType, stretch);
  const bestLabel = scored[0].label;
  const bestRow = rows.find((r) => r.label === bestLabel)!;
  const confidence = getConfidence(scored, body, category);

  // 5. Build alternatives (tight / best / loose)
  const bestIdx = rows.findIndex((r) => r.label === bestLabel);
  const alternatives: { size: string; label: 'tight' | 'best' | 'loose' }[] = [];

  if (bestIdx > 0) {
    alternatives.push({ size: rows[bestIdx - 1].label, label: 'tight' });
  }
  alternatives.push({ size: bestLabel, label: 'best' });
  if (bestIdx < rows.length - 1) {
    alternatives.push({ size: rows[bestIdx + 1].label, label: 'loose' });
  }

  // 6. Breakdown
  const breakdown = buildBreakdown(bestRow, body, category);

  // 7. Note generation
  let note = `Best match: size ${bestLabel}.`;
  if (fitType === 'baggy' || fitType === 'relaxed') {
    note += ` Cut is ${fitType}, giving a relaxed drape.`;
  } else if (fitType === 'skinny' || fitType === 'slim') {
    note += ` Cut is ${fitType}, fitting close to body.`;
  }
  if (stretch) {
    note += ` Fabric has stretch for added comfort.`;
  }

  return {
    size: bestLabel,
    confidence,
    note,
    alternatives,
    breakdown,
    source: {
      brand: (chart as any).brandId?.name || 'Brand',
      chartType: (chart as any).chartType || 'body',
      lastChecked: (chart as any).lastChecked
        ? new Date((chart as any).lastChecked).toISOString().split('T')[0]
        : '2026-11-14',
      url: (chart as any).sourceUrl,
    },
  };
}
