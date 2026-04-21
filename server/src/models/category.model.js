import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: 'Tag' },
    color: { type: String, default: '#4f46e5' },
    isCustom: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categorySchema.index({ userId: 1, name: 1 }, { unique: true });

categorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const Category = mongoose.model('Category', categorySchema);
