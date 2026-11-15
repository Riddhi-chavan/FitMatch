import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SizeChart from '@/lib/models/SizeChart';
import Brand from '@/lib/models/Brand';
import { measurementsFromReference, mergeReferences, SizeRow } from '@/lib/engine';
import { z } from 'zod';

const RequestSchema = z.object({
  gender: z.enum(['men', 'women']).default('men'),
  references: z.array(
    z.object({
      brandId: z.string(),
      category: z.enum(['jeans', 'tshirt', 'shirt']),
      size: z.string(),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { gender, references } = parsed.data;
    const estimatedList: Record<string, number>[] = [];

    for (const ref of references) {
      let brandDoc = await Brand.findOne({
        $or: [
          { slug: ref.brandId.toLowerCase() },
          { name: { $regex: new RegExp(`^${ref.brandId}$`, 'i') } },
        ],
      }).lean();

      if (!brandDoc && ref.brandId.match(/^[0-9a-fA-F]{24}$/)) {
        brandDoc = await Brand.findById(ref.brandId).lean();
      }

      if (!brandDoc) continue;

      const chart = await SizeChart.findOne({
        brandId: (brandDoc as any)._id,
        category: ref.category,
        gender,
      }).lean();

      if (!chart || !chart.rows) continue;

      const matchedRow = (chart.rows as any[]).find(
        (r) => r.label.toLowerCase() === ref.size.toLowerCase()
      );

      if (matchedRow) {
        // Convert Map or object ranges to standard format
        const rangesObj: Record<string, { min: number; max: number }> = {};
        const rawRanges = matchedRow.ranges instanceof Map ? Object.fromEntries(matchedRow.ranges) : matchedRow.ranges;
        for (const [k, v] of Object.entries(rawRanges || {})) {
          rangesObj[k] = v as { min: number; max: number };
        }
        const row: SizeRow = { label: matchedRow.label, ranges: rangesObj };
        estimatedList.push(measurementsFromReference(row));
      }
    }

    if (estimatedList.length === 0) {
      return NextResponse.json(
        { error: 'Could not resolve measurements for provided references' },
        { status: 404 }
      );
    }

    const { merged, farApart } = mergeReferences(estimatedList);

    return NextResponse.json({
      measurements: merged,
      farApart,
      referencesCount: estimatedList.length,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
