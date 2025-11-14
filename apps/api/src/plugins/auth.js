import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import bcrypt from 'bcryptjs';
import db from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

async function authPlugin(fastify) {
  // Register JWT plugin
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    sign: {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '7d'
    }
  });

  // 用户信息缓存 TTL（秒）- 默认 2 分钟
  const USER_CACHE_TTL = parseInt(process.env.USER_CACHE_TTL || '120', 10);
  
  // 获取用户信息（带缓存）
  async function getUserInfo(userId) {
    const cacheKey = `user:${userId}`;
    
    // 尝试从 Redis 获取缓存
    if (fastify.redis) {
      try {
        const cached = await fastify.redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        fastify.log.warn(`Redis 获取失败: ${err.message}`);
        // Redis 失败不影响功能，继续从数据库查询
      }
    }
    
    // 从数据库查询
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        bio: users.bio,
        avatar: users.avatar,
        role: users.role,
        isBanned: users.isBanned,
        isEmailVerified: users.isEmailVerified,
        isDeleted: users.isDeleted,
        messagePermission: users.messagePermission,
        contentVisibility: users.contentVisibility,
        usernameChangeCount: users.usernameChangeCount,
        usernameChangedAt: users.usernameChangedAt,
        createdAt: users.createdAt,
        lastSeenAt: users.lastSeenAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      return null;
    }
    
    // 存入 Redis 缓存
    if (fastify.redis) {
      try {
        await fastify.redis.setex(cacheKey, USER_CACHE_TTL, JSON.stringify(user));
      } catch (err) {
        fastify.log.warn(`Redis 存储失败: ${err.message}`);
        // Redis 失败不影响功能
      }
    }
    
    return user;
  }
  
  // 清除用户缓存（当用户信息更新时调用）
  fastify.decorate('clearUserCache', async function(userId) {
    const cacheKey = `user:${userId}`;
    if (fastify.redis) {
      try {
        await fastify.redis.del(cacheKey);
        fastify.log.info(`已清除用户 ${userId} 的缓存`);
      } catch (err) {
        fastify.log.warn(`清除缓存失败: ${err.message}`);
      }
    }
  });

  // Decorate fastify with auth utilities
  fastify.decorate('authenticate', async function(request, reply) {
    try {
      await request.jwtVerify();
      
      // 从缓存或数据库获取最新的用户信息
      const user = await getUserInfo(request.user.id);
      
      if (!user) {
        return reply.code(401).send({ error: '未授权', message: '用户不存在' });
      }
      
      // 检查用户是否已被删除
      if (user.isDeleted) {
        return reply.code(403).send({ error: '访问被拒绝', message: '该账号已被删除' });
      }
      
      // 更新 request.user 为最新的用户信息
      request.user = user;
    } catch (err) {
      reply.code(401).send({ error: '未授权', message: '令牌无效或已过期' });
    }
  });

  // Check if user is banned (use after authenticate)
  // 注意：authenticate 已经会检查封禁状态，这个装饰器保留用于向后兼容
  fastify.decorate('checkBanned', async function(request, reply) {
    // Ensure user is authenticated first
    if (!request.user || !request.user.id) {
      return reply.code(401).send({ error: '未授权', message: '请先登录' });
    }

    // authenticate 已经从数据库获取了最新的 isBanned 状态
    if (request.user.isBanned) {
      return reply.code(403).send({
        error: '访问被拒绝',
        message: '你的账号已被封禁',
      });
    }
  });

  // Check if user is admin
  fastify.decorate('requireAdmin', async function(request, reply) {
    try {
      await request.jwtVerify();
      
      // 从缓存或数据库获取最新的用户信息
      const user = await getUserInfo(request.user.id);
      
      if (!user) {
        return reply.code(401).send({ error: '未授权', message: '用户不存在' });
      }
      
      if (user.isDeleted) {
        return reply.code(403).send({ error: '访问被拒绝', message: '该账号已被删除' });
      }
      
      if (user.isBanned) {
        return reply.code(403).send({ error: '访问被拒绝', message: '你的账号已被封禁' });
      }
      
      if (user.role !== 'admin') {
        return reply.code(403).send({ error: '禁止访问', message: '需要管理员权限' });
      }
      
      // 更新 request.user 为最新的用户信息
      request.user = user;
    } catch (err) {
      reply.code(401).send({ error: '未授权', message: '令牌无效或已过期' });
    }
  });

  // Check if user is moderator or admin
  fastify.decorate('requireModerator', async function(request, reply) {
    try {
      await request.jwtVerify();
      
      // 从缓存或数据库获取最新的用户信息
      const user = await getUserInfo(request.user.id);
      
      if (!user) {
        return reply.code(401).send({ error: '未授权', message: '用户不存在' });
      }
      
      if (user.isDeleted) {
        return reply.code(403).send({ error: '访问被拒绝', message: '该账号已被删除' });
      }
      
      if (user.isBanned) {
        return reply.code(403).send({ error: '访问被拒绝', message: '你的账号已被封禁' });
      }
      
      if (!['moderator', 'admin'].includes(user.role)) {
        return reply.code(403).send({ error: '禁止访问', message: '需要版主或管理员权限' });
      }
      
      // 更新 request.user 为最新的用户信息
      request.user = user;
    } catch (err) {
      reply.code(401).send({ error: '未授权', message: '令牌无效或已过期' });
    }
  });

  // Optional authentication (doesn't fail if no token)
  fastify.decorate('optionalAuth', async function(request) {
    try {
      await request.jwtVerify();
      
      // 从缓存或数据库获取最新的用户信息
      const user = await getUserInfo(request.user.id);
      
      if (user) {
        // 更新 request.user 为最新的用户信息
        request.user = user;
      } else {
        request.user = null;
      }
    } catch (err) {
      // Ignore error, make user undefined
      request.user = null;
    }
  });

  // Hash password utility
  fastify.decorate('hashPassword', async function(password) {
    return await bcrypt.hash(password, 10);
  });

  // Verify password utility
  fastify.decorate('verifyPassword', async function(password, hash) {
    return await bcrypt.compare(password, hash);
  });
}

export default fp(authPlugin);
