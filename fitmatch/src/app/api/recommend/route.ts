import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { RecommendBodySchema } from '@/lib/validators';
import { computeRecommendation } from '@/lib/engine/recommend';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = RecommendBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { productId, profile, fitPrefOverride } = parsed.data;

    const product = await Product.findById(productId)
      .populate('brandId', 'name slug')
      .lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const result = await computeRecommendation(product, profile as any, fitPrefOverride);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
