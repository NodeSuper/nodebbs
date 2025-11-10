import db from '../../db/index.js';
import { emailProviders } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * 邮件服务配置路由
 */
export default async function emailRoutes(fastify, options) {
  // ============= 邮件服务配置管理 =============

  /**
   * 获取邮件服务提供商配置
   * 公开接口：只返回已启用的提供商（不含敏感信息）
   * 管理员：返回所有提供商（含完整配置）
   */
  fastify.get(
    '/providers',
    {
      schema: {
        tags: ['email'],
        description: '获取邮件服务提供商配置',
        response: {
          200: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    provider: { type: 'string' },
                    isEnabled: { type: 'boolean' },
                    isDefault: { type: 'boolean' },
                    smtpHost: { type: ['string', 'null'] },
                    smtpPort: { type: ['number', 'null'] },
                    smtpSecure: { type: ['boolean', 'null'] },
                    smtpUser: { type: ['string', 'null'] },
                    smtpPassword: { type: ['string', 'null'] },
                    fromEmail: { type: ['string', 'null'] },
                    fromName: { type: ['string', 'null'] },
                    apiKey: { type: ['string', 'null'] },
                    apiEndpoint: { type: ['string', 'null'] },
                    additionalConfig: { type: ['string', 'null'] },
                    displayName: { type: ['string', 'null'] },
                    displayOrder: { type: 'number' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const isAdmin =
          request.user && ['admin', 'moderator'].includes(request.user.role);

        let items;

        if (isAdmin) {
          // 管理员：返回所有提供商的完整信息
          items = await db
            .select()
            .from(emailProviders)
            .orderBy(emailProviders.displayOrder);
        } else {
          // 公开：只返回已启用的提供商，不含敏感信息
          items = await db
            .select({
              provider: emailProviders.provider,
              isEnabled: emailProviders.isEnabled,
              displayName: emailProviders.displayName,
              displayOrder: emailProviders.displayOrder,
            })
            .from(emailProviders)
            .where(eq(emailProviders.isEnabled, true))
            .orderBy(emailProviders.displayOrder);
        }

        return {
          items,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: '获取邮件服务配置失败' });
      }
    }
  );

  /**
   * 更新邮件服务提供商配置（管理员）
   */
  fastify.patch(
    '/providers/:provider',
    {
      preHandler: [fastify.authenticate, fastify.requireAdmin],
      schema: {
        tags: ['email'],
        description: '更新邮件服务提供商配置',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            provider: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            isEnabled: { type: 'boolean' },
            isDefault: { type: 'boolean' },
            smtpHost: { type: 'string' },
            smtpPort: { type: 'number' },
            smtpSecure: { type: 'boolean' },
            smtpUser: { type: 'string' },
            smtpPassword: { type: 'string' },
            fromEmail: { type: 'string' },
            fromName: { type: 'string' },
            apiKey: { type: 'string' },
            apiEndpoint: { type: 'string' },
            additionalConfig: { type: 'string' },
            displayName: { type: 'string' },
            displayOrder: { type: 'number' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              provider: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  provider: { type: 'string' },
                  isEnabled: { type: 'boolean' },
                  isDefault: { type: 'boolean' },
                  displayName: { type: ['string', 'null'] },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { provider } = request.params;
      const updateData = request.body;

      try {
        // 检查提供商是否存在
        const existing = await db
          .select()
          .from(emailProviders)
          .where(eq(emailProviders.provider, provider))
          .limit(1);

        if (existing.length === 0) {
          return reply.code(404).send({ error: '邮件服务提供商不存在' });
        }

        // 如果设置为默认提供商，先取消其他提供商的默认状态
        if (updateData.isDefault === true) {
          await db
            .update(emailProviders)
            .set({ isDefault: false })
            .where(eq(emailProviders.isDefault, true));
        }

        // 更新配置
        const updated = await db
          .update(emailProviders)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(emailProviders.provider, provider))
          .returning();

        fastify.log.info(`Email provider ${provider} configuration updated`);

        return {
          message: '邮件服务配置已更新',
          provider: updated[0],
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: '更新邮件服务配置失败' });
      }
    }
  );

  /**
   * 测试邮件服务配置（管理员）
   */
  fastify.post(
    '/providers/:provider/test',
    {
      preHandler: [fastify.authenticate, fastify.requireAdmin],
      schema: {
        tags: ['email'],
        description: '测试邮件服务提供商配置',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            provider: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            testEmail: { type: 'string', format: 'email' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { provider } = request.params;
      const { testEmail } = request.body;

      try {
        // 获取配置
        const config = await db
          .select()
          .from(emailProviders)
          .where(eq(emailProviders.provider, provider))
          .limit(1);

        if (config.length === 0) {
          return reply.code(404).send({ error: '邮件服务提供商不存在' });
        }

        const providerConfig = config[0];

        // 检查必要的配置是否存在
        if (!providerConfig.fromEmail) {
          return {
            success: false,
            message: '缺少发件人邮箱配置',
          };
        }

        // 根据提供商类型检查配置
        if (provider === 'smtp' || provider === 'aliyun') {
          if (!providerConfig.smtpHost || !providerConfig.smtpUser || !providerConfig.smtpPassword) {
            return {
              success: false,
              message: '缺少 SMTP 配置信息',
            };
          }
        } else if (provider === 'sendgrid' || provider === 'resend') {
          if (!providerConfig.apiKey) {
            return {
              success: false,
              message: '缺少 API Key 配置',
            };
          }
        }

        // 发送测试邮件
        if (testEmail) {
          try {
            await fastify.sendEmail({
              to: testEmail,
              subject: '邮件服务测试',
              html: `
                <h2>邮件服务测试</h2>
                <p>这是一封来自 ${providerConfig.displayName} 的测试邮件。</p>
                <p>如果您收到这封邮件，说明邮件服务配置正确。</p>
                <hr>
                <p style="color: #666; font-size: 12px;">发送时间: ${new Date().toLocaleString('zh-CN')}</p>
              `,
              text: `邮件服务测试\n\n这是一封来自 ${providerConfig.displayName} 的测试邮件。\n如果您收到这封邮件，说明邮件服务配置正确。`,
              provider: provider,
            });

            return {
              success: true,
              message: `测试邮件已发送到 ${testEmail}`,
            };
          } catch (error) {
            fastify.log.error('Test email failed:', error);
            return {
              success: false,
              message: `发送测试邮件失败: ${error.message}`,
            };
          }
        }

        return {
          success: true,
          message: '邮件服务配置验证通过',
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: '测试邮件服务配置失败' });
      }
    }
  );

  /**
   * 发送邮件验证码（公开接口，有限速）
   */
  fastify.post(
    '/send-verification',
    {
      schema: {
        tags: ['email'],
        description: '发送邮箱验证码',
        body: {
          type: 'object',
          required: ['email', 'type'],
          properties: {
            email: { type: 'string', format: 'email' },
            type: { type: 'string', enum: ['register', 'login', 'reset-password'] },
          },
        },
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
      const { email, type } = request.body;

      try {
        // 生成 6 位验证码
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // TODO: 将验证码存储到 Redis 或数据库，设置过期时间（如 10 分钟）
        // 这里暂时只是演示发送邮件的功能

        let subject, html, text;

        switch (type) {
          case 'register':
            subject = '注册验证码';
            html = `
              <h2>欢迎注册</h2>
              <p>您的注册验证码是：<strong style="font-size: 24px; color: #007bff;">${code}</strong></p>
              <p>验证码有效期为 10 分钟，请尽快完成验证。</p>
            `;
            text = `欢迎注册\n\n您的注册验证码是：${code}\n\n验证码有效期为 10 分钟，请尽快完成验证。`;
            break;
          case 'login':
            subject = '登录验证码';
            html = `
              <h2>登录验证</h2>
              <p>您的登录验证码是：<strong style="font-size: 24px; color: #007bff;">${code}</strong></p>
              <p>验证码有效期为 10 分钟，请尽快完成验证。</p>
            `;
            text = `登录验证\n\n您的登录验证码是：${code}\n\n验证码有效期为 10 分钟，请尽快完成验证。`;
            break;
          case 'reset-password':
            subject = '密码重置验证码';
            html = `
              <h2>密码重置</h2>
              <p>您的密码重置验证码是：<strong style="font-size: 24px; color: #007bff;">${code}</strong></p>
              <p>验证码有效期为 10 分钟，请尽快完成验证。</p>
              <p style="color: #dc3545;">如果这不是您的操作，请忽略此邮件。</p>
            `;
            text = `密码重置\n\n您的密码重置验证码是：${code}\n\n验证码有效期为 10 分钟，请尽快完成验证。\n\n如果这不是您的操作，请忽略此邮件。`;
            break;
        }

        await fastify.sendEmail({
          to: email,
          subject,
          html,
          text,
        });

        fastify.log.info(`Verification code sent to ${email}: ${code}`);

        return {
          message: '验证码已发送，请查收邮件',
        };
      } catch (error) {
        fastify.log.error('Send verification email failed:', error);
        return reply.code(500).send({ error: '发送验证码失败' });
      }
    }
  );
}
