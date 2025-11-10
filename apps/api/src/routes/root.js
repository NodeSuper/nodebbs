import db from '../db/index.js';
import { topics, posts, users } from '../db/schema.js';
import { sql, gte, eq } from 'drizzle-orm';

export default async function rootRoutes(fastify, options) {
  // Health check
  fastify.get(
    '/',
    {
      schema: {
        tags: ['system'],
        description: '健康检查端点',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              service: { type: 'string' },
              version: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return {
        status: 'ok',
        service: 'Nodebbs API',
        timestamp: new Date().toISOString(),
      };
    }
  );

  // Forum statistics
  fastify.get(
    '/stats',
    {
      schema: {
        tags: ['system'],
        description: '获取论坛统计',
        response: {
          200: {
            type: 'object',
            properties: {
              totalTopics: { type: 'number' },
              totalPosts: { type: 'number' },
              totalUsers: { type: 'number' },
            },
            additionalProperties: true,
          },
        },
      },
    },
    async (request, reply) => {
      // Get total topics count (excluding deleted)
      const [{ count: totalTopics }] = await db
        .select({ count: sql`count(*)` })
        .from(topics)
        .where(eq(topics.isDeleted, false));

      // Get total posts count (excluding deleted)
      const [{ count: totalPosts }] = await db
        .select({ count: sql`count(*)` })
        .from(posts)
        .where(eq(posts.isDeleted, false));

      // Get total users count (excluding banned)
      const [{ count: totalUsers }] = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(eq(users.isBanned, false));

      // Get online users from tracking plugin (if available)
      const onlineStats = await fastify.getOnlineStats();

      return {
        totalTopics: Number(totalTopics),
        totalPosts: Number(totalPosts),
        totalUsers: Number(totalUsers),
        online: onlineStats,
      };
    }
  );
}
