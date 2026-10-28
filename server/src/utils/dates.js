export const toISODate = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
};

export const startOfMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), 1);

export const endOfMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0);

export const startOfLastMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth() - 1, 1);

export const endOfLastMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), 0);

export const subDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() - n);
  return x;
};

export const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const parseRelativeDate = (token) => {
  if (!token) return null;
  const t = String(token).toLowerCase().trim();
  const d = new Date();
  if (t === 'today') return toISODate(d);
  if (t === 'yesterday') { d.setDate(d.getDate() - 1); return toISODate(d); }
  if (t === 'tomorrow') { d.setDate(d.getDate() + 1); return toISODate(d); }
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  return null;
};
