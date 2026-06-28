import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";

const limiters = new Map<string, Ratelimit>();

function getLimiter(name: string, requests: number, window: `${number} s` | `${number} m`) {
  const existing = limiters.get(name);
  if (existing) return existing;

  const redis = getRedis();
  if (!redis) return null;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ratelimit:${name}`,
  });

  limiters.set(name, limiter);
  return limiter;
}

export async function rateLimit(
  identifier: string,
  name: string,
  requests = 20,
  window: `${number} s` | `${number} m` = "60 s"
): Promise<{ success: boolean; remaining: number }> {
  const limiter = getLimiter(name, requests, window);
  if (!limiter) return { success: true, remaining: requests };

  const { success, remaining } = await limiter.limit(identifier);
  return { success, remaining };
}
