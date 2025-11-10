import db from '../../db/index.js';
import { categories, topics } from '../../db/schema.js';
import { eq, sql, desc, isNull, like, and, or } from 'drizzle-orm';
import slugify from 'slug'

export default async function categoryRoutes(fastify, options) {
  // Get all categories
  fastify.get('/', {
    preHandler: [fastify.optionalAuth],
    schema: {
      tags: ['categories'],
      description: '获取所有分类',
      querystring: {
        type: 'object',
        properties: {
          includeSubcategories: { type: 'boolean', default: true },
          search: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { includeSubcategories = true, search } = request.query;
    const { user } = request;

    // 构建查询条件
    let query = db.select().from(categories);

    // 添加搜索条件
    if (search && search.trim()) {
      query = query.where(
        or(
          like(categories.name, `%${search.trim()}%`),
          like(categories.description, `%${search.trim()}%`)
        )
      );
    }

    // 排序：精选优先，然后按 position，最后按名称
    let allCategories = await query.orderBy(
      desc(categories.isFeatured),
      categories.position,
      categories.name
    );

    // 检查分类是否私有（包括继承的私有属性）
    const isPrivateCategory = (category, allCats) => {
      if (category.isPrivate) return true;
      
      // 检查父分类是否私有
      if (category.parentId) {
        const parent = allCats.find(c => c.id === category.parentId);
        if (parent) {
          return isPrivateCategory(parent, allCats);
        }
      }
      
      return false;
    };

    // 过滤私有分类（只有管理员和版主可以看到）
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      allCategories = allCategories.filter(cat => !isPrivateCategory(cat, allCategories));
    }

    if (includeSubcategories) {
      // Get topic counts and stats for each category
      const categoriesWithStats = await Promise.all(
        allCategories.map(async (category) => {
          // 获取话题数量
          const [topicCount] = await db
            .select({ count: sql`count(*)` })
            .from(topics)
            .where(and(
              eq(topics.categoryId, category.id),
              eq(topics.isDeleted, false)
            ));

          // 获取总回复数和总浏览数
          const [stats] = await db
            .select({
              postCount: sql`COALESCE(SUM(${topics.postCount}), 0)`,
              viewCount: sql`COALESCE(SUM(${topics.viewCount}), 0)`
            })
            .from(topics)
            .where(and(
              eq(topics.categoryId, category.id),
              eq(topics.isDeleted, false)
            ));

          // 获取最新话题
          const [latestTopic] = await db
            .select({
              id: topics.id,
              title: topics.title,
              slug: topics.slug,
              createdAt: topics.createdAt,
              updatedAt: topics.updatedAt
            })
            .from(topics)
            .where(and(
              eq(topics.categoryId, category.id),
              eq(topics.isDeleted, false)
            ))
            .orderBy(desc(topics.updatedAt))
            .limit(1);

          return {
            ...category,
            topicCount: Number(topicCount.count),
            postCount: Number(stats.postCount),
            viewCount: Number(stats.viewCount),
            latestTopic: latestTopic || null
          };
        })
      );

      // Organize into hierarchy
      const categoryMap = new Map();
      const rootCategories = [];

      categoriesWithStats.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, subcategories: [] });
      });

      categoriesWithStats.forEach(cat => {
        if (cat.parentId) {
          const parent = categoryMap.get(cat.parentId);
          if (parent) {
            parent.subcategories.push(categoryMap.get(cat.id));
          }
        } else {
          rootCategories.push(categoryMap.get(cat.id));
        }
      });

      return rootCategories;
    } else {
      // Only root categories
      const rootCategories = allCategories.filter(cat => !cat.parentId);
      return rootCategories;
    }
  });

  // Get single category
  fastify.get('/:slug', {
    preHandler: [fastify.optionalAuth],
    schema: {
      tags: ['categories'],
      description: '根据标识获取分类',
      params: {
        type: 'object',
        required: ['slug'],
        properties: {
          slug: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { slug } = request.params;
    const { user } = request;

    const [category] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);

    if (!category) {
      return reply.code(404).send({ error: '分类不存在' });
    }

    // 检查分类是否私有（包括继承的私有属性）
    const checkPrivate = async (cat) => {
      if (cat.isPrivate) return true;
      
      if (cat.parentId) {
        const [parent] = await db
          .select()
          .from(categories)
          .where(eq(categories.id, cat.parentId))
          .limit(1);
        
        if (parent) {
          return await checkPrivate(parent);
        }
      }
      
      return false;
    };

    const isPrivate = await checkPrivate(category);
    
    // 如果是私有分类，检查权限
    if (isPrivate && (!user || !['admin', 'moderator'].includes(user.role))) {
      return reply.code(403).send({ error: '无权访问此分类' });
    }

    // Get topic count
    const [topicCount] = await db
      .select({ count: sql`count(*)` })
      .from(topics)
      .where(eq(topics.categoryId, category.id));

    // Get subcategories
    const subcategories = await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, category.id))
      .orderBy(
        desc(categories.isFeatured),
        categories.position,
        categories.name
      );

    return {
      ...category,
      topicCount: Number(topicCount.count),
      subcategories
    };
  });

  // Create category (admin only)
  fastify.post('/', {
    preHandler: [fastify.requireAdmin],
    schema: {
      tags: ['categories'],
      description: '创建新分类（仅管理员）',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', maxLength: 100 },
          slug: { type: 'string', maxLength: 100 },
          description: { type: 'string' },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          icon: { type: 'string', maxLength: 50 },
          parentId: { type: ['number', 'null'] },
          position: { type: 'number' },
          isPrivate: { type: 'boolean' },
          isFeatured: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    const { name, description, color, icon, parentId, position, isPrivate, isFeatured } = request.body;
    let { slug } = request.body;

    // Generate slug if not provided
    if (!slug) {
      slug = slugify(name);
    }

    // Check if slug exists
    const [existing] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (existing) {
      return reply.code(400).send({ error: '该标识的分类已存在' });
    }

    // Verify parent exists if provided
    if (parentId) {
      const [parent] = await db.select().from(categories).where(eq(categories.id, parentId)).limit(1);
      if (!parent) {
        return reply.code(404).send({ error: '父分类不存在' });
      }
    }

    const [newCategory] = await db.insert(categories).values({
      name,
      slug,
      description,
      color: color || '#000000',
      icon,
      parentId,
      position: position !== undefined ? position : 0,
      isPrivate: isPrivate || false,
      isFeatured: isFeatured || false
    }).returning();

    return newCategory;
  });

  // Update category (admin only)
  fastify.patch('/:id', {
    preHandler: [fastify.requireAdmin],
    schema: {
      tags: ['categories'],
      description: '更新分类（仅管理员）',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 100 },
          slug: { type: 'string', maxLength: 100 },
          description: { type: 'string' },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          icon: { type: 'string', maxLength: 50 },
          parentId: { type: ['number', 'null'] },
          position: { type: 'number' },
          isPrivate: { type: 'boolean' },
          isFeatured: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;

    const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);

    if (!category) {
      return reply.code(404).send({ error: '分类不存在' });
    }

    // Check slug uniqueness if changed
    if (request.body.slug && request.body.slug !== category.slug) {
      const [existing] = await db.select().from(categories).where(eq(categories.slug, request.body.slug)).limit(1);
      if (existing) {
        return reply.code(400).send({ error: '该标识的分类已存在' });
      }
    }

    const updates = { ...request.body, updatedAt: new Date() };

    const [updatedCategory] = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();

    return updatedCategory;
  });

  // Delete category (admin only)
  fastify.delete('/:id', {
    preHandler: [fastify.requireAdmin],
    schema: {
      tags: ['categories'],
      description: '删除分类（仅管理员）',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;

    const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);

    if (!category) {
      return reply.code(404).send({ error: '分类不存在' });
    }

    // Check if category has topics
    const [topicCount] = await db.select({ count: sql`count(*)` }).from(topics).where(eq(topics.categoryId, id));

    if (Number(topicCount.count) > 0) {
      return reply.code(400).send({ error: '无法删除包含话题的分类' });
    }

    await db.delete(categories).where(eq(categories.id, id));

    return { message: '分类删除成功' };
  });
}
