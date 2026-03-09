const buckets = new Map<string, { count: number; ts: number }>();

export function checkRateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const item = buckets.get(key);
  if (!item || now - item.ts > windowMs) {
    buckets.set(key, { count: 1, ts: now });
    return true;
  }
  if (item.count >= limit) return false;
  item.count += 1;
  return true;
}
