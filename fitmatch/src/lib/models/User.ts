import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: String,
    image: String,
    encryptedProfile: {
      iv: String,
      tag: String,
      data: String,
    },
    saveProfile: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.User || model('User', UserSchema);

