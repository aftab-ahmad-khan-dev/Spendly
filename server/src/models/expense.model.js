import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    note: { type: String, default: null },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });

expenseSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const Expense = mongoose.model('Expense', expenseSchema);
