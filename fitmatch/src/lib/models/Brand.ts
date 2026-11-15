import { Schema, model, models } from 'mongoose';

const BrandSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String },
    region: { type: String, default: 'global' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Brand || model('Brand', BrandSchema);

