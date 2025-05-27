import Redis from "ioredis"

let redis: Redis | null = null

function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL!, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    })

    redis.on("error", (error) => {
      console.error("Redis connection error:", error)
    })

    redis.on("connect", () => {
      console.log("Connected to Redis")
    })
  }

  return redis
}

export async function cacheSet(key: string, value: any, ttl = 3600): Promise<void> {
  try {
    const client = getRedisClient()
    await client.setex(key, ttl, JSON.stringify(value))
  } catch (error) {
    console.error("Redis cache set error:", error)
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient()
    const value = await client.get(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error("Redis cache get error:", error)
    return null
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    const client = getRedisClient()
    await client.del(key)
  } catch (error) {
    console.error("Redis cache delete error:", error)
  }
}

export async function cacheExists(key: string): Promise<boolean> {
  try {
    const client = getRedisClient()
    const exists = await client.exists(key)
    return exists === 1
  } catch (error) {
    console.error("Redis cache exists error:", error)
    return false
  }
}

export { getRedisClient as redis }
