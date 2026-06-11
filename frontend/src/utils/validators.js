export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidEmail(value) {
  if (!isNonEmptyString(value)) return false;
  // Basic email check (good enough for client-side validation)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidVietnamPhone(value) {
  if (!isNonEmptyString(value)) return false;
  const v = value.trim();
  // Accept 10 digits starting with 0 (e.g. 090..., 03..., 07..., 08...)
  return /^0\d{9}$/.test(v);
}

export function isValidIdCard(value) {
  if (!isNonEmptyString(value)) return false;
  const v = value.trim();
  // CCCD usually 12 digits; allow 9–12 digits for demo data
  return /^\d{9,12}$/.test(v);
}

export function isValidISODate(value) {
  if (!isNonEmptyString(value)) return false;
  // YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return false;
  const d = new Date(value.trim() + 'T00:00:00');
  return !Number.isNaN(d.getTime());
}

export function isDateInFuture(value) {
  if (!isValidISODate(value)) return false;
  const d = new Date(value.trim() + 'T00:00:00');
  const now = new Date();
  d.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return d.getTime() > now.getTime();
}

export function isPositiveInteger(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

