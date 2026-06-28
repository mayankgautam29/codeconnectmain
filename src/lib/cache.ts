import { getRedis } from "./redis";

export const CACHE_TTL = {
  FEED: 60,
  PROFILE: 120,
  SEARCH: 30,
  STATS: 300,
  REQUESTS: 30,
} as const;

const FEED_INDEX_KEY = "feed:index";

export const CACHE_KEYS = {
  feed: (page: number, sort: string) => `feed:p${page}:s${sort}`,
  profile: (id: string) => `profile:${id}`,
  search: (query: string) => `search:${query.toLowerCase().trim()}`,
  stats: () => "stats:platform",
  requestCount: (userId: string) => `requests:count:${userId}`,
} as const;

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const data = await redis.get<T>(key);
    return data ?? null;
  } catch (err) {
    console.error("[cache] get error:", err);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(key, value, { ex: ttlSeconds });
    if (key.startsWith("feed:")) {
      await redis.sadd(FEED_INDEX_KEY, key);
    }
  } catch (err) {
    console.error("[cache] set error:", err);
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  const redis = getRedis();
  if (!redis || keys.length === 0) return;

  try {
    await redis.del(...keys);
  } catch (err) {
    console.error("[cache] del error:", err);
  }
}

export async function invalidateFeedCache(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    const keys = await redis.smembers(FEED_INDEX_KEY);
    if (keys.length > 0) {
      await redis.del(...keys, FEED_INDEX_KEY);
    }
  } catch (err) {
    console.error("[cache] invalidate feed error:", err);
  }
}

export async function invalidateProfileCache(userId: string): Promise<void> {
  await cacheDel(CACHE_KEYS.profile(userId));
}

export async function invalidateStatsCache(): Promise<void> {
  await cacheDel(CACHE_KEYS.stats());
}
