import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import Brand from '@/lib/models/Brand';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const gender = searchParams.get('gender');
    const fit = searchParams.get('fit');
    const q = searchParams.get('q');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const filter: Record<string, any> = { active: true };

    if (category) filter.category = category;
    if (gender) filter.gender = gender;

    if (brand) {
      let brandDoc = await Brand.findOne({ slug: brand.toLowerCase() }).lean();
      if (!brandDoc && brand.match(/^[0-9a-fA-F]{24}$/)) {
        brandDoc = await Brand.findById(brand).lean();
      }
      if (brandDoc) {
        filter.brandId = (brandDoc as any)._id;
      }
    }

    if (fit) {
      const fits = fit.split(',').map((f) => f.trim().toLowerCase());
      filter.fitType = { $in: fits };
    }

    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('brandId', 'name slug logo')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
