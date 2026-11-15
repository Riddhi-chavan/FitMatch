import { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['jeans', 'tshirt', 'shirt'], required: true },
    gender: { type: String, enum: ['men', 'women'], required: true },
    fitType: {
      type: String,
      enum: ['skinny', 'slim', 'straight', 'relaxed', 'baggy'],
      required: true,
    },
    stretch: { type: Boolean, default: false },
    images: [String],
    tryOnImage: String,
    externalUrl: String,
    active: { type: Boolean, default: true },
    chartOverrides: { type: Map, of: Schema.Types.Mixed, default: {} },
    tryOnWidthFactor: { type: Number, default: 1.5 },
    tryOnVerticalOffset: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ brandId: 1, category: 1, gender: 1 });
ProductSchema.index({ fitType: 1 });

export default models.Product || model('Product', ProductSchema);

