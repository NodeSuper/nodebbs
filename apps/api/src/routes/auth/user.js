import { userEnricher } from '../../services/userEnricher.js';
import db from '../../db/index.js';
import { users, accounts } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function userRoute(fastify, options) {
  // 获取当前登录用户
  fastify.get(
    '/me',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['auth'],
        description: '获取当前认证用户',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              username: { type: 'string' },
              email: { type: 'string' },
              hasPassword: { type: 'boolean' },
              oauthProviders: { 
                type: 'array',
                items: { type: 'string' }
              },
              name: { type: 'string' },
              bio: { type: 'string' },
              avatar: { type: 'string' },
              role: { type: 'string' },
              isEmailVerified: { type: 'boolean' },
              isBanned: { type: 'boolean' },
              createdAt: { type: 'string' },
              lastSeenAt: { type: 'string' },
              messagePermission: { type: 'string' },
              contentVisibility: { type: 'string' },
              usernameChangeCount: { type: 'number' },
              usernameChangedAt: { type: ['string', 'null'] },
              avatarFrame: {
                type: ['object', 'null'],
                properties: {
                  id: { type: 'number' },
                  itemType: { type: 'string' },
                  itemName: { type: 'string' },
                  itemMetadata: { type: ['string', 'null'] },
                  imageUrl: { type: ['string', 'null'] }
                }
              },
              badges: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    isDisplayed: { type: 'boolean' },
                    earnedAt: { type: ['string', 'null'] },
                    badge: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        iconUrl: { type: 'string' },
                        description: { type: ['string', 'null'] },
                        metadata: { type: ['string', 'null'] },
                        unlockCondition: { type: ['string', 'null'] }
                      }
                    }
                  }
                }
              }
            },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.id;
      const cacheKey = `user:full:${userId}`;

      const USER_CACHE_TTL = parseInt(process.env.USER_CACHE_TTL || '120', 10);
      return await fastify.cache.remember(cacheKey, USER_CACHE_TTL, async () => {
        // 使用 request.user (由 authenticate 中间件提供)，避免重复查询数据库
        // 注意：需要浅拷贝一份，避免修改 request.user 影响后续处理（虽然在此处是最后一步）
        const user = { ...request.user };

        if (!user) {
          // 理论上 authenticate 已处理，但保留作为保险
          return reply.code(404).send({ error: '用户不存在' });
        }

        // 丰富用户信息（徽章、头像框等）
        await userEnricher.enrich(user);

        // 获取关联的 OAuth 账号
        const userAccounts = await db
          .select()
          .from(accounts)
          .where(eq(accounts.userId, user.id));
        
        const oauthProviders = userAccounts.map(acc => acc.provider);

        // 检查用户是否设置了密码
        // 注意：authenticate 中间件已经移除了 passwordHash，所以我们需要单独查询一次
        let userHasPassword = false;
        const [pwdResult] = await db
            .select({ passwordHash: users.passwordHash })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
            
        if (pwdResult && pwdResult.passwordHash) {
            userHasPassword = true;
        }
        
        return {
          ...user,
          hasPassword: userHasPassword,
          oauthProviders,
        };
      });
    }
  );

  // 用户登出
  fastify.post(
    '/logout',
    {
      schema: {
        tags: ['auth'],
        description: '用户登出',
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // 清除 Cookie
      reply.clearCookie('auth_token', { path: '/', domain: process.env.COOKIE_DOMAIN || undefined });
      return { message: '登出成功' };
    }
  );
}
