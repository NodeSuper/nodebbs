import { userEnricher } from '../../services/userEnricher.js';
import db from '../../db/index.js';
import { users, accounts } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function userRoute(fastify, options) {
  const { permissionService } = fastify;
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
              },
              // RBAC 权限数据
              userRoles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    slug: { type: 'string' },
                    name: { type: 'string' },
                    color: { type: 'string' },
                    icon: { type: 'string' },
                    priority: { type: 'number' },
                    isDisplayed: { type: 'boolean' },
                  },
                },
              },
              permissions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    slug: { type: 'string' },
                    conditions: { 
                      type: ['object', 'null'],
                      additionalProperties: true,  // 允许任意属性通过序列化
                    },
                  },
                },
                description: '用户权限列表，包含权限标识和条件',
              },
              displayRole: {
                type: ['object', 'null'],
                properties: {
                  slug: { type: 'string' },
                  name: { type: 'string' },
                  color: { type: 'string' },
                  icon: { type: 'string' },
                },
              },
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

        // 并行获取用户丰富信息、OAuth 账号、密码状态和 RBAC 权限
        const [userAccounts, pwdResult, userRoles, userPermissions] = await Promise.all([
          db.select().from(accounts).where(eq(accounts.userId, user.id)),
          db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1),
          permissionService.getUserRoles(userId),
          permissionService.getUserPermissions(userId),
        ]);

        // 丰富用户信息（徽章、头像框等）
        await userEnricher.enrich(user);

        const oauthProviders = userAccounts.map(acc => acc.provider);
        const userHasPassword = !!(pwdResult[0]?.passwordHash);

        // 获取展示角色（最高优先级且允许展示的角色）
        const displayRole = userRoles
          .filter(r => r.isDisplayed)
          .sort((a, b) => b.priority - a.priority)[0] || null;

        return {
          ...user,
          hasPassword: userHasPassword,
          oauthProviders,
          // RBAC 权限数据
          userRoles,
          permissions: userPermissions.map(p => ({
            slug: p.slug,
            conditions: p.conditions || null,
          })),
          displayRole: displayRole ? {
            slug: displayRole.slug,
            name: displayRole.name,
            color: displayRole.color,
            icon: displayRole.icon,
          } : null,
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
