import { z } from 'zod';

export const MeasurementsSchema = z.object({
  height:   z.number().min(100).max(250).optional(),
  weight:   z.number().min(30).max(300).optional(),
  waist:    z.number().min(50).max(160).optional(),
  hip:      z.number().min(60).max(180).optional(),
  inseam:   z.number().min(40).max(110).optional(),
  chest:    z.number().min(60).max(180).optional(),
  shoulder: z.number().min(30).max(70).optional(),
  neck:     z.number().min(30).max(60).optional(),
  sleeve:   z.number().min(50).max(100).optional(),
});

export const ProfileSchema = z.object({
  gender:      z.enum(['men', 'women']),
  fitPref:     z.enum(['snug', 'regular', 'roomy']),
  measurements: MeasurementsSchema,
  references: z.array(z.object({
    brandId:  z.string(),
    category: z.enum(['jeans', 'tshirt', 'shirt']),
    size:     z.string(),
  })).optional(),
});

export const RecommendBodySchema = z.object({
  productId:   z.string().min(1),
  profile:     ProfileSchema,
  fitPrefOverride: z.enum(['snug', 'regular', 'roomy']).optional(),
});

export const FeedbackSchema = z.object({
  productId:  z.string().min(1),
  sizeBought: z.string().min(1),
  result:     z.enum(['too_small', 'perfect', 'too_big']),
});

