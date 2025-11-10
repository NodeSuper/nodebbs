import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

async function docsPlugin(fastify, opts) {
  // Register Swagger
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: '论坛 API',
        description:
          '基于 Fastify、Drizzle ORM 和 PostgreSQL 构建的完整论坛 API',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:7100',
          description: '开发服务器',
        },
      ],
      tags: [
        { name: 'auth', description: '认证端点' },
        { name: 'users', description: '用户管理' },
        { name: 'categories', description: '分类管理' },
        { name: 'topics', description: '话题操作' },
        { name: 'posts', description: '帖子操作' },
        { name: 'tags', description: '标签管理' },
        { name: 'notifications', description: '通知系统' },
        { name: 'moderation', description: '审核工具' },
        { name: 'system', description: '通用' },
        { name: 'blocked-users', description: '拉黑用户' },
        { name: 'messages', description: '站内信' },
        { name: 'search', description: '搜索功能' },
        { name: 'settings', description: '系统设置' },
        { name: 'oauth', description: 'OAuth 认证' },
        { name: 'email', description: '邮件服务' },
        { name: 'invitations', description: '邀请码管理' },
        { name: 'admin', description: '管理员专用接口' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          // 通用错误响应
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string', description: '错误信息' },
              statusCode: { type: 'number', description: 'HTTP 状态码' },
              message: { type: 'string', description: '详细错误描述' },
            },
            required: ['error'],
          },
          // 分页元数据
          PaginationMeta: {
            type: 'object',
            properties: {
              page: { type: 'number', description: '当前页码', minimum: 1 },
              limit: {
                type: 'number',
                description: '每页条数',
                minimum: 1,
                maximum: 100,
              },
              total: { type: 'number', description: '总记录数', minimum: 0 },
            },
            required: ['page', 'limit', 'total'],
          },
          // 用户基础信息
          UserBase: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '用户ID' },
              username: { type: 'string', description: '用户名' },
              name: { type: 'string', description: '显示名称' },
              avatar: { type: 'string', nullable: true, description: '头像URL' },
              role: {
                type: 'string',
                enum: ['user', 'moderator', 'admin'],
                description: '用户角色',
              },
              isBanned: { type: 'boolean', description: '是否被封禁' },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: '创建时间',
              },
            },
          },
          // 话题基础信息
          TopicBase: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '话题ID' },
              title: { type: 'string', description: '话题标题' },
              slug: { type: 'string', description: '话题标识' },
              categoryId: { type: 'number', description: '分类ID' },
              categoryName: { type: 'string', description: '分类名称' },
              categorySlug: { type: 'string', description: '分类标识' },
              userId: { type: 'number', description: '作者ID' },
              username: { type: 'string', description: '作者用户名' },
              viewCount: { type: 'number', description: '浏览次数' },
              postCount: { type: 'number', description: '回复数量' },
              isPinned: { type: 'boolean', description: '是否置顶' },
              isClosed: { type: 'boolean', description: '是否关闭' },
              lastPostAt: {
                type: 'string',
                format: 'date-time',
                description: '最后回复时间',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: '创建时间',
              },
            },
          },
          // 帖子基础信息
          PostBase: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '帖子ID' },
              topicId: { type: 'number', description: '话题ID' },
              userId: { type: 'number', description: '作者ID' },
              username: { type: 'string', description: '作者用户名' },
              content: { type: 'string', description: '帖子内容' },
              postNumber: { type: 'number', description: '帖子序号' },
              likeCount: { type: 'number', description: '点赞数' },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: '创建时间',
              },
              editedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                description: '编辑时间',
              },
            },
          },
          // 分类基础信息
          CategoryBase: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '分类ID' },
              name: { type: 'string', description: '分类名称' },
              slug: { type: 'string', description: '分类标识' },
              description: {
                type: 'string',
                nullable: true,
                description: '分类描述',
              },
              color: { type: 'string', description: '分类颜色' },
              icon: {
                type: 'string',
                nullable: true,
                description: '分类图标',
              },
              parentId: {
                type: 'number',
                nullable: true,
                description: '父分类ID',
              },
              position: { type: 'number', description: '排序位置' },
              isPrivate: { type: 'boolean', description: '是否私有' },
              isFeatured: { type: 'boolean', description: '是否精选' },
            },
          },
          // 通知基础信息
          NotificationBase: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '通知ID' },
              type: {
                type: 'string',
                description: '通知类型',
                enum: ['reply', 'like', 'mention', 'topic_reply', 'message'],
              },
              message: { type: 'string', description: '通知消息' },
              isRead: { type: 'boolean', description: '是否已读' },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: '创建时间',
              },
            },
          },
        },
        responses: {
          // 400 错误响应
          BadRequest: {
            description: '请求参数错误',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                examples: {
                  invalidParam: {
                    value: {
                      error: '请求参数无效',
                      statusCode: 400,
                    },
                  },
                },
              },
            },
          },
          // 401 未认证响应
          Unauthorized: {
            description: '未认证或认证失败',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                examples: {
                  notAuth: {
                    value: {
                      error: '需要登录',
                      statusCode: 401,
                    },
                  },
                },
              },
            },
          },
          // 403 无权限响应
          Forbidden: {
            description: '无权限访问',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                examples: {
                  noPermission: {
                    value: {
                      error: '无权限执行此操作',
                      statusCode: 403,
                    },
                  },
                },
              },
            },
          },
          // 404 未找到响应
          NotFound: {
            description: '资源未找到',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                examples: {
                  notFound: {
                    value: {
                      error: '请求的资源不存在',
                      statusCode: 404,
                    },
                  },
                },
              },
            },
          },
          // 500 服务器错误响应
          InternalServerError: {
            description: '服务器内部错误',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                examples: {
                  serverError: {
                    value: {
                      error: '服务器内部错误',
                      statusCode: 500,
                    },
                  },
                },
              },
            },
          },
        },
        parameters: {
          // 分页参数 - 页码
          PageParam: {
            name: 'page',
            in: 'query',
            description: '页码',
            required: false,
            schema: {
              type: 'number',
              minimum: 1,
              default: 1,
            },
          },
          // 分页参数 - 每页数量
          LimitParam: {
            name: 'limit',
            in: 'query',
            description: '每页数量',
            required: false,
            schema: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 20,
            },
          },
          // 搜索参数
          SearchParam: {
            name: 'search',
            in: 'query',
            description: '搜索关键词',
            required: false,
            schema: {
              type: 'string',
            },
          },
          // ID 路径参数
          IdParam: {
            name: 'id',
            in: 'path',
            description: '资源ID',
            required: true,
            schema: {
              type: 'number',
            },
          },
        },
      },
    },
  });

  // Register Swagger UI
  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'none',
      deepLinking: true,
    },
    staticCSP: true,
  });
}

export default fp(docsPlugin);
