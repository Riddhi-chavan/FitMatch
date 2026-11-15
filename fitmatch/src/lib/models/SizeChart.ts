import { Schema, model, models } from 'mongoose';

const RangeSchema = new Schema({ min: Number, max: Number }, { _id: false });

const SizeChartSchema = new Schema(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    category: { type: String, enum: ['jeans', 'tshirt', 'shirt'], required: true },
    gender: { type: String, enum: ['men', 'women'], required: true },
    fitType: { type: String, default: 'regular' },
    chartType: { type: String, enum: ['body', 'garment'], required: true },
    ease: { type: Map, of: Number, default: {} },
    rows: [
      {
        label: String,
        ranges: { type: Map, of: RangeSchema },
      },
    ],
    sourceUrl: String,
    lastChecked: Date,
  },
  { timestamps: true }
);

SizeChartSchema.index(
  { brandId: 1, category: 1, gender: 1, fitType: 1 },
  { unique: true }
);

export default models.SizeChart || model('SizeChart', SizeChartSchema);

