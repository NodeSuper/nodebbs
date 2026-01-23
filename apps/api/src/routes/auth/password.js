import db from '../../db/index.js';
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { normalizeEmail } from '../../utils/normalization.js';
import {
  verifyCode,
  deleteVerificationCode,
} from '../../plugins/message/utils/verificationCode.js';
import { VerificationCodeType } from '../../plugins/message/config/verificationCode.js';

export default async function passwordRoute(fastify, options) {
  // 使用验证码重置密码
  fastify.post(
    '/reset-password',
    {
      schema: {
        tags: ['auth'],
        description: '使用验证码重置密码',
        body: {
          type: 'object',
          required: ['email', 'code', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            code: { type: 'string', description: '6位验证码' },
            password: { type: 'string', minLength: 6 },
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
      let { email } = request.body;
      const { code, password } = request.body;

      // 规范化邮箱
      email = normalizeEmail(email);

      // 验证验证码
      const result = await verifyCode(
        email,
        code,
        VerificationCodeType.EMAIL_PASSWORD_RESET
      );

      if (!result.valid) {
        return reply.code(400).send({
          error: result.error || '验证码错误或已过期'
        });
      }

      // 查找用户
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return reply.code(404).send({ error: '用户不存在' });
      }

      // 更新密码
      const passwordHash = await fastify.hashPassword(password);
      await db
        .update(users)
        .set({ passwordHash })
        .where(eq(users.id, user.id));

      // 删除已使用的验证码
      await deleteVerificationCode(email, VerificationCodeType.EMAIL_PASSWORD_RESET);

      // 清除用户缓存
      await fastify.clearUserCache(user.id);

      fastify.log.info(`[密码重置] 用户 ${email} 使用验证码重置密码成功`);

      return { message: '密码重置成功' };
    }
  );
}
