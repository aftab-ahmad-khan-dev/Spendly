import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    amount: { type: Number, required: true, min: 0 },
    period: { type: String, enum: ['monthly'], default: 'monthly' },
  },
  { timestamps: true }
);

budgetSchema.index(
  { userId: 1, categoryId: 1 },
  { unique: true, partialFilterExpression: { categoryId: { $type: 'objectId' } } }
);

budgetSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const Budget = mongoose.model('Budget', budgetSchema);
