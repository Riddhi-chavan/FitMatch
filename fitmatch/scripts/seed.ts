// scripts/seed.ts — run with: npx tsx scripts/seed.ts
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import Brand from '../src/lib/models/Brand';
import SizeChart from '../src/lib/models/SizeChart';
import Product from '../src/lib/models/Product';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✅ Connected to MongoDB');

  await Promise.all([Brand.deleteMany({}), SizeChart.deleteMany({}), Product.deleteMany({})]);
  console.log('🗑  Cleared existing data');

  // ── BRANDS ────────────────────────────────────────────────
  const [hm, zara] = await Brand.insertMany([
    { name: 'H&M', slug: 'hm', region: 'global', active: true },
    { name: 'Zara', slug: 'zara', region: 'global', active: true },
  ]);
  console.log('✅ Brands: H&M, Zara');

  // ── SIZE CHARTS: MEN ──────────────────────────────────────
  // H&M Men's Jeans
  await SizeChart.create({
    brandId: hm._id,
    category: 'jeans',
    gender: 'men',
    fitType: 'regular',
    chartType: 'body',
    rows: [
      { label: '28', ranges: { waist: { min: 71, max: 74 }, hip: { min: 86, max: 89 }, inseam: { min: 78, max: 82 } } },
      { label: '30', ranges: { waist: { min: 76, max: 79 }, hip: { min: 91, max: 94 }, inseam: { min: 78, max: 82 } } },
      { label: '32', ranges: { waist: { min: 81, max: 84 }, hip: { min: 96, max: 99 }, inseam: { min: 78, max: 82 } } },
      { label: '34', ranges: { waist: { min: 86, max: 89 }, hip: { min: 101, max: 104 }, inseam: { min: 78, max: 82 } } },
      { label: '36', ranges: { waist: { min: 91, max: 94 }, hip: { min: 106, max: 109 }, inseam: { min: 78, max: 82 } } },
    ],
    sourceUrl: 'https://www2.hm.com/en_in/customer-service/sizeguide/man/trousers.html',
    lastChecked: new Date('2026-11-14'),
  });

  // H&M Men's T-shirt
  await SizeChart.create({
    brandId: hm._id,
    category: 'tshirt',
    gender: 'men',
    fitType: 'regular',
    chartType: 'body',
    rows: [
      { label: 'XS', ranges: { chest: { min: 82, max: 86 }, shoulder: { min: 42, max: 44 }, length: { min: 68, max: 70 } } },
      { label: 'S', ranges: { chest: { min: 86, max: 90 }, shoulder: { min: 44, max: 46 }, length: { min: 70, max: 72 } } },
      { label: 'M', ranges: { chest: { min: 90, max: 96 }, shoulder: { min: 46, max: 48 }, length: { min: 72, max: 74 } } },
      { label: 'L', ranges: { chest: { min: 96, max: 102 }, shoulder: { min: 48, max: 50 }, length: { min: 74, max: 76 } } },
      { label: 'XL', ranges: { chest: { min: 102, max: 108 }, shoulder: { min: 50, max: 52 }, length: { min: 76, max: 78 } } },
      { label: 'XXL', ranges: { chest: { min: 108, max: 116 }, shoulder: { min: 52, max: 55 }, length: { min: 78, max: 80 } } },
    ],
    sourceUrl: 'https://www2.hm.com/en_in/customer-service/sizeguide/man/tops.html',
    lastChecked: new Date('2026-11-14'),
  });

  // Zara Men's Jeans
  await SizeChart.create({
    brandId: zara._id,
    category: 'jeans',
    gender: 'men',
    fitType: 'regular',
    chartType: 'body',
    rows: [
      { label: '28', ranges: { waist: { min: 70, max: 73 }, hip: { min: 86, max: 89 }, inseam: { min: 78, max: 82 } } },
      { label: '30', ranges: { waist: { min: 75, max: 78 }, hip: { min: 91, max: 94 }, inseam: { min: 78, max: 82 } } },
      { label: '32', ranges: { waist: { min: 80, max: 83 }, hip: { min: 96, max: 99 }, inseam: { min: 78, max: 82 } } },
      { label: '34', ranges: { waist: { min: 85, max: 88 }, hip: { min: 101, max: 104 }, inseam: { min: 78, max: 82 } } },
      { label: '36', ranges: { waist: { min: 90, max: 93 }, hip: { min: 106, max: 109 }, inseam: { min: 78, max: 82 } } },
    ],
    sourceUrl: 'https://www.zara.com/in/en/size-guide-l1491.html',
    lastChecked: new Date('2026-11-14'),
  });

  // Zara Men's T-shirt
  await SizeChart.create({
    brandId: zara._id,
    category: 'tshirt',
    gender: 'men',
    fitType: 'regular',
    chartType: 'body',
    rows: [
      { label: 'XS', ranges: { chest: { min: 80, max: 84 }, shoulder: { min: 41, max: 43 }, length: { min: 67, max: 69 } } },
      { label: 'S', ranges: { chest: { min: 84, max: 88 }, shoulder: { min: 43, max: 45 }, length: { min: 69, max: 71 } } },
      { label: 'M', ranges: { chest: { min: 88, max: 94 }, shoulder: { min: 45, max: 47 }, length: { min: 71, max: 73 } } },
      { label: 'L', ranges: { chest: { min: 94, max: 100 }, shoulder: { min: 47, max: 49 }, length: { min: 73, max: 75 } } },
      { label: 'XL', ranges: { chest: { min: 100, max: 106 }, shoulder: { min: 49, max: 51 }, length: { min: 75, max: 77 } } },
      { label: 'XXL', ranges: { chest: { min: 106, max: 114 }, shoulder: { min: 51, max: 54 }, length: { min: 77, max: 79 } } },
    ],
    sourceUrl: 'https://www.zara.com/in/en/size-guide-l1491.html',
    lastChecked: new Date('2026-11-14'),
  });

  // ── SIZE CHARTS: WOMEN ────────────────────────────────────
  // H&M Women's Jeans
  await SizeChart.create({
    brandId: hm._id,
    category: 'jeans',
    gender: 'women',
    fitType: 'regular',
    chartType: 'body',
    rows: [
      { label: '24', ranges: { waist: { min: 60, max: 63 }, hip: { min: 85, max: 88 }, inseam: { min: 76, max: 80 } } },
      { label: '26', ranges: { waist: { min: 64, max: 67 }, hip: { min: 89, max: 92 }, inseam: { min: 76, max: 80 } } },
      { label: '28', ranges: { waist: { min: 68, max: 71 }, hip: { min: 93, max: 96 }, inseam: { min: 76, max: 80 } } },
      { label: '30', ranges: { waist: { min: 72, max: 75 }, hip: { min: 97, max: 100 }, inseam: { min: 76, max: 80 } } },
      { label: '32', ranges: { waist: { min: 76, max: 80 }, hip: { min: 101, max: 105 }, inseam: { min: 76, max: 80 } } },
      { label: '34', ranges: { waist: { min: 81, max: 85 }, hip: { min: 106, max: 110 }, inseam: { min: 76, max: 80 } } },
    ],
    sourceUrl: 'https://www2.hm.com/en_in/customer-service/sizeguide/ladies/trousers.html',
    lastChecked: new Date('2026-11-14'),
  });

  // H&M Women's T-shirt
  await SizeChart.create({
    brandId: hm._id,
    category: 'tshirt',
    gender: 'women',
    fitType: 'regular',
    chartType: 'body',
    rows: [
      { label: 'XS', ranges: { chest: { min: 78, max: 82 }, shoulder: { min: 37, max: 39 }, length: { min: 60, max: 62 } } },
      { label: 'S', ranges: { chest: { min: 82, max: 88 }, shoulder: { min: 39, max: 41 }, length: { min: 62, max: 64 } } },
      { label: 'M', ranges: { chest: { min: 88, max: 94 }, shoulder: { min: 41, max: 43 }, length: { min: 64, max: 66 } } },
      { label: 'L', ranges: { chest: { min: 94, max: 102 }, shoulder: { min: 43, max: 45 }, length: { min: 66, max: 68 } } },
      { label: 'XL', ranges: { chest: { min: 102, max: 110 }, shoulder: { min: 45, max: 47 }, length: { min: 68, max: 70 } } },
    ],
    sourceUrl: 'https://www2.hm.com/en_in/customer-service/sizeguide/ladies/tops.html',
    lastChecked: new Date('2026-11-14'),
  });

  // Zara Women's Jeans
  await SizeChart.create({
    brandId: zara._id,
    category: 'jeans',
    gender: 'women',
    fitType: 'regular',
    chartType: 'body',
    rows: [
      { label: '24', ranges: { waist: { min: 59, max: 62 }, hip: { min: 85, max: 88 }, inseam: { min: 76, max: 80 } } },
      { label: '26', ranges: { waist: { min: 63, max: 66 }, hip: { min: 89, max: 92 }, inseam: { min: 76, max: 80 } } },
      { label: '28', ranges: { waist: { min: 67, max: 70 }, hip: { min: 93, max: 96 }, inseam: { min: 76, max: 80 } } },
      { label: '30', ranges: { waist: { min: 71, max: 74 }, hip: { min: 97, max: 100 }, inseam: { min: 76, max: 80 } } },
      { label: '32', ranges: { waist: { min: 75, max: 79 }, hip: { min: 101, max: 105 }, inseam: { min: 76, max: 80 } } },
      { label: '34', ranges: { waist: { min: 80, max: 84 }, hip: { min: 106, max: 110 }, inseam: { min: 76, max: 80 } } },
    ],
    sourceUrl: 'https://www.zara.com/in/en/size-guide-w.html',
    lastChecked: new Date('2026-11-14'),
  });

  // Zara Women's T-shirt
  await SizeChart.create({
    brandId: zara._id,
    category: 'tshirt',
    gender: 'women',
    fitType: 'regular',
    chartType: 'body',
    rows: [
      { label: 'XS', ranges: { chest: { min: 76, max: 80 }, shoulder: { min: 36, max: 38 }, length: { min: 59, max: 61 } } },
      { label: 'S', ranges: { chest: { min: 80, max: 86 }, shoulder: { min: 38, max: 40 }, length: { min: 61, max: 63 } } },
      { label: 'M', ranges: { chest: { min: 86, max: 92 }, shoulder: { min: 40, max: 42 }, length: { min: 63, max: 65 } } },
      { label: 'L', ranges: { chest: { min: 92, max: 100 }, shoulder: { min: 42, max: 44 }, length: { min: 65, max: 67 } } },
      { label: 'XL', ranges: { chest: { min: 100, max: 108 }, shoulder: { min: 44, max: 46 }, length: { min: 67, max: 69 } } },
    ],
    sourceUrl: 'https://www.zara.com/in/en/size-guide-w.html',
    lastChecked: new Date('2026-11-14'),
  });

  console.log('✅ Size charts: H&M + Zara (Men + Women, jeans & tshirt)');

  // ── PRODUCTS: MEN + WOMEN WITH REAL EDITORIAL IMAGES ───────
  await Product.insertMany([
    // H&M Men's Jeans
    {
      brandId: hm._id,
      name: 'Slim Fit Jeans',
      category: 'jeans',
      gender: 'men',
      fitType: 'slim',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: hm._id,
      name: 'Relaxed Fit Jeans',
      category: 'jeans',
      gender: 'men',
      fitType: 'relaxed',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: hm._id,
      name: 'Skinny Stretch Jeans',
      category: 'jeans',
      gender: 'men',
      fitType: 'skinny',
      stretch: true,
      images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },

    // H&M Men's T-Shirts
    {
      brandId: hm._id,
      name: 'Regular Fit T-shirt',
      category: 'tshirt',
      gender: 'men',
      fitType: 'straight',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: hm._id,
      name: 'Slim Fit T-shirt',
      category: 'tshirt',
      gender: 'men',
      fitType: 'slim',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: hm._id,
      name: 'Oversized T-shirt',
      category: 'tshirt',
      gender: 'men',
      fitType: 'relaxed',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },

    // Zara Men's Jeans
    {
      brandId: zara._id,
      name: 'Slim Fit Jeans Z01',
      category: 'jeans',
      gender: 'men',
      fitType: 'slim',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: zara._id,
      name: 'Baggy Jeans Z02',
      category: 'jeans',
      gender: 'men',
      fitType: 'baggy',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1555689502-c4b22d76c56f?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: zara._id,
      name: 'Straight Leg Jeans Z03',
      category: 'jeans',
      gender: 'men',
      fitType: 'straight',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },

    // Zara Men's T-Shirts
    {
      brandId: zara._id,
      name: 'Basic Slim T-shirt',
      category: 'tshirt',
      gender: 'men',
      fitType: 'slim',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: zara._id,
      name: 'Essential White Tee',
      category: 'tshirt',
      gender: 'men',
      fitType: 'straight',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: zara._id,
      name: 'Relaxed Graphic Tee',
      category: 'tshirt',
      gender: 'men',
      fitType: 'relaxed',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },

    // H&M Women's Jeans
    {
      brandId: hm._id,
      name: 'Wide High Jeans',
      category: 'jeans',
      gender: 'women',
      fitType: 'relaxed',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: hm._id,
      name: 'Skinny High Waist Jeans',
      category: 'jeans',
      gender: 'women',
      fitType: 'skinny',
      stretch: true,
      images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: hm._id,
      name: 'Straight Ankle Jeans',
      category: 'jeans',
      gender: 'women',
      fitType: 'straight',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },

    // H&M Women's T-Shirts
    {
      brandId: hm._id,
      name: 'Fitted Cotton Tee',
      category: 'tshirt',
      gender: 'women',
      fitType: 'slim',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: hm._id,
      name: 'Boxy Crewneck Tee',
      category: 'tshirt',
      gender: 'women',
      fitType: 'relaxed',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },

    // Zara Women's Jeans
    {
      brandId: zara._id,
      name: 'Z1975 High-Rise Straight Jeans',
      category: 'jeans',
      gender: 'women',
      fitType: 'straight',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: zara._id,
      name: 'Wide Leg Cropped Jeans',
      category: 'jeans',
      gender: 'women',
      fitType: 'baggy',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: zara._id,
      name: 'Slim Fit Flare Jeans',
      category: 'jeans',
      gender: 'women',
      fitType: 'slim',
      stretch: true,
      images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },

    // Zara Women's T-Shirts
    {
      brandId: zara._id,
      name: 'Classic Ribbed T-shirt',
      category: 'tshirt',
      gender: 'women',
      fitType: 'slim',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
    {
      brandId: zara._id,
      name: 'Oversized Vintage Washed Tee',
      category: 'tshirt',
      gender: 'women',
      fitType: 'relaxed',
      stretch: false,
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80'],
      active: true,
    },
  ]);

  console.log('✅ 22 seed products created with real editorial images (Men + Women)');
  console.log('\n🎉 Seed complete!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
