import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { ProfileSchema } from '@/lib/validators';
import { computeRecommendation } from '@/lib/engine/recommend';
import { z } from 'zod';

const BatchRecommendSchema = z.object({
  productIds: z.array(z.string()).max(50),
  profile: ProfileSchema,
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = BatchRecommendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { productIds, profile } = parsed.data;

    if (productIds.length === 0) {
      return NextResponse.json({});
    }

    const products = await Product.find({ _id: { $in: productIds } })
      .populate('brandId', 'name slug')
      .lean();

    const results: Record<string, { size: string; confidence: string } | { error: string }> = {};

    for (const prod of products) {
      try {
        const rec = await computeRecommendation(prod, profile as any);
        results[(prod as any)._id.toString()] = {
          size: rec.size,
          confidence: rec.confidence,
        };
      } catch (e: any) {
        results[(prod as any)._id.toString()] = { error: e.message };
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
