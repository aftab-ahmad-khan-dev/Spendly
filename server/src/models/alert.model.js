import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['near_limit', 'exceeded', 'unusual'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['info', 'warning', 'danger'], default: 'info' },
    isRead: { type: Boolean, default: false },
    dedupeKey: { type: String, index: true },
  },
  { timestamps: true }
);

alertSchema.index({ userId: 1, createdAt: -1 });

alertSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const Alert = mongoose.model('Alert', alertSchema);
