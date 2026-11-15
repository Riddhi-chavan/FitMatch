import { Schema, model, models } from 'mongoose';

const FitFeedbackSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sizeBought: { type: String, required: true },
    result: {
      type: String,
      enum: ['too_small', 'perfect', 'too_big'],
      required: true,
    },
    profileHash: String,
  },
  { timestamps: true }
);

export default models.FitFeedback || model('FitFeedback', FitFeedbackSchema);

