import fp from 'fastify-plugin'
import fastifyRedis from '@fastify/redis'

export default fp(async (fastify) => {
  fastify.register(fastifyRedis, {
    url: process.env.REDIS_URL,
    // 可选：配置 ioredis 原生选项
    connectTimeout: 5000,
    maxRetriesPerRequest: 3,
  })

  // 可选：在 ready 阶段进行连接测试
  fastify.addHook('onReady', async () => {
    try {
      await fastify.redis.ping()
      fastify.log.info('✅ Redis connected successfully')
    } catch (err) {
      fastify.log.error('❌ Redis connection failed:', err)
    }
  })
})
