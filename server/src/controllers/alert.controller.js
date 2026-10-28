import { Alert } from '../models/alert.model.js';
import { ApiError } from '../utils/ApiError.js';

export const listAlerts = async (req, res) => {
  const rows = await Alert.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(rows);
};

export const markAlertRead = async (req, res) => {
  const doc = await Alert.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: { isRead: true } },
    { new: true }
  );
  if (!doc) throw new ApiError(404, 'Alert not found');
  res.json(doc);
};

export const markAllRead = async (req, res) => {
  await Alert.updateMany({ userId: req.userId, isRead: false }, { $set: { isRead: true } });
  res.json({ ok: true });
};
