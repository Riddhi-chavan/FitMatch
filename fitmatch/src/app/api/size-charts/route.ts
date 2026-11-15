import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SizeChart from '@/lib/models/SizeChart';
import Brand from '@/lib/models/Brand';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    const gender = searchParams.get('gender') || 'men';

    if (!brand || !category) {
      return NextResponse.json(
        { error: 'Missing required query parameters: brand, category' },
        { status: 400 }
      );
    }

    // Lookup brand by slug, name or ObjectId
    let brandDoc = await Brand.findOne({
      $or: [
        { slug: brand.toLowerCase() },
        { name: { $regex: new RegExp(`^${brand}$`, 'i') } },
      ],
    }).lean();
    if (!brandDoc && brand.match(/^[0-9a-fA-F]{24}$/)) {
      brandDoc = await Brand.findById(brand).lean();
    }

    if (!brandDoc) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const chart = await SizeChart.findOne({
      brandId: (brandDoc as any)._id,
      category,
      gender,
    }).populate('brandId', 'name slug logo').lean();

    if (!chart) {
      return NextResponse.json({ error: 'Size chart not found' }, { status: 404 });
    }

    return NextResponse.json(chart);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
