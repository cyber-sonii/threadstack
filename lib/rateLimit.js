const rateLimitStore = new Map();

// key = identifier like "login:email@example.com" or "post:userId"
export function checkRateLimit(key, maxAttempts, windowMs) {
  const now = Date.now();

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }

  const timestamps = rateLimitStore.get(key);

  // remove expired timestamps
  const recentTimestamps = timestamps.filter(
    (timestamp) => now - timestamp < windowMs
  );

  if (recentTimestamps.length >= maxAttempts) {
    rateLimitStore.set(key, recentTimestamps);
    return false;
  }

  recentTimestamps.push(now);
  rateLimitStore.set(key, recentTimestamps);

  return true;
}