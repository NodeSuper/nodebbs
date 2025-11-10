import db from '../../db/index.js';
import { topics, posts, users, categories } from '../../db/schema.js';
import { eq, sql, desc, and, or, like, ilike } from 'drizzle-orm';
import { isDev } from '../../utils/env.js';

export default async function searchRoutes(fastify, options) {
  // Global search
  fastify.get('/', {
    preHandler: [fastify.optionalAuth],
    schema: {
      tags: ['search'],
      description: '搜索话题、帖子和用户',
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string', minLength: 2 },
          type: { type: 'string', enum: ['all', 'topics', 'posts', 'users'], default: 'all' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20, maximum: 100 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { q, type = 'all', page = 1, limit = 20 } = request.query;
      const offset = (page - 1) * limit;
      const searchPattern = `%${q}%`;

      const results = {
        query: q,
        type,
        topics: {
          items: [],
          page,
          limit,
          total: 0
        },
        posts: {
          items: [],
          page,
          limit,
          total: 0
        },
        users: {
          items: [],
          page,
          limit,
          total: 0
        }
      };

    // Search topics
    if (type === 'all' || type === 'topics') {
      try {
        // 获取总数
        const [countResult] = await db
          .select({ count: sql`count(*)::int` })
          .from(topics)
          .where(and(
            eq(topics.isDeleted, false),
            ilike(topics.title, searchPattern)
          ));
        
        const topicsTotal = countResult?.count || 0;

        // 获取数据 - 分步构建查询
        const topicsData = await db
          .select()
          .from(topics)
          .innerJoin(categories, eq(topics.categoryId, categories.id))
          .innerJoin(users, eq(topics.userId, users.id))
          .where(and(
            eq(topics.isDeleted, false),
            ilike(topics.title, searchPattern)
          ))
          .orderBy(desc(topics.createdAt))
          .limit(limit)
          .offset(offset);

        // 格式化数据
        results.topics.items = topicsData.map(row => ({
          id: row.topics.id,
          title: row.topics.title,
          slug: row.topics.slug,
          categoryId: row.topics.categoryId,
          categoryName: row.categories.name,
          categorySlug: row.categories.slug,
          userId: row.topics.userId,
          username: row.users.username,
          userAvatar: row.users.avatar,
          viewCount: row.topics.viewCount,
          postCount: row.topics.postCount,
          isPinned: row.topics.isPinned,
          isClosed: row.topics.isClosed,
          tags: row.topics.tags || [],
          lastPostAt: row.topics.lastPostAt,
          createdAt: row.topics.createdAt
        }));
        results.topics.total = topicsTotal;
      } catch (error) {
        request.log.error({ err: error, msg: 'Topics search failed' });
        // 保持空结果
      }
    }

    // Search posts (排除话题内容，即 postNumber = 1 的帖子)
    if (type === 'all' || type === 'posts') {
      try {
        // 获取总数
        const [countResult] = await db
          .select({ count: sql`count(*)::int` })
          .from(posts)
          .innerJoin(topics, eq(posts.topicId, topics.id))
          .where(and(
            eq(posts.isDeleted, false),
            eq(topics.isDeleted, false),
            sql`${posts.postNumber} > 1`,  // 排除话题内容
            ilike(posts.content, searchPattern)
          ));
        
        const postsTotal = countResult?.count || 0;

        // 获取数据
        const postsData = await db
          .select()
          .from(posts)
          .innerJoin(topics, eq(posts.topicId, topics.id))
          .innerJoin(users, eq(posts.userId, users.id))
          .where(and(
            eq(posts.isDeleted, false),
            eq(topics.isDeleted, false),
            sql`${posts.postNumber} > 1`,  // 排除话题内容
            ilike(posts.content, searchPattern)
          ))
          .orderBy(desc(posts.createdAt))
          .limit(limit)
          .offset(offset);

        // 格式化数据并截取内容
        results.posts.items = postsData.map(row => ({
          id: row.posts.id,
          content: (row.posts.content || '').substring(0, 200),
          topicId: row.posts.topicId,
          topicTitle: row.topics.title,
          username: row.users.username,
          postNumber: row.posts.postNumber,
          createdAt: row.posts.createdAt
        }));
        results.posts.total = postsTotal;
      } catch (error) {
        request.log.error({ err: error, msg: 'Posts search failed' });
        // 保持空结果
      }
    }

    // Search users
    if (type === 'all' || type === 'users') {
      // 获取总数
      const [countResult] = await db
        .select({ count: sql`count(*)::int` })
        .from(users)
        .where(
          or(
            ilike(users.username, searchPattern),
            ilike(users.name, searchPattern)
          )
        );
      
      const usersTotal = countResult?.count || 0;

      // 获取数据
      const usersData = await db
        .select({
          id: users.id,
          username: users.username,
          name: users.name,
          avatar: users.avatar,
          bio: users.bio
        })
        .from(users)
        .where(
          or(
            ilike(users.username, searchPattern),
            ilike(users.name, searchPattern)
          )
        )
        .limit(limit)
        .offset(offset);

      results.users.items = usersData;
      results.users.total = usersTotal;
    }

    return results;
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: error.message,
        details: isDev ? error.stack : undefined
      });
    }
  });
}
