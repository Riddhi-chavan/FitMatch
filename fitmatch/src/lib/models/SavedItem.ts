import { Schema, model, models } from 'mongoose';

const SavedItemSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    recommendedSize: { type: String, required: true },
    confidence: { type: String, enum: ['high', 'medium', 'low'] },
  },
  { timestamps: true }
);

SavedItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default models.SavedItem || model('SavedItem', SavedItemSchema);

