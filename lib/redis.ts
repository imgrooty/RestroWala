import { createClient } from 'redis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redisClient = createClient({
  url: redisUrl,
})

redisClient.on('error', (err) => console.error('Redis Client Error', err))

if (process.env.NODE_ENV !== 'production') {
  redisClient.connect().catch(console.error)
}

export default redisClient
