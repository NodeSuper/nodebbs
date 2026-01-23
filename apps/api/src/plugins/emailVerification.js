import fp from 'fastify-plugin';

/**
 * 中间件：检查是否需要邮箱验证
 * 如果系统设置要求邮箱验证，且用户邮箱未验证，则拒绝请求
 */
export async function requireEmailVerification(request, reply) {
  // 检查是否启用邮箱验证要求
  // 使用 request.server.settings 访问配置插件
  const emailVerificationRequired = await request.server.settings.get(
    'email_verification_required',
    false
  );

  // 如果未启用，直接通过
  if (!emailVerificationRequired) {
    return;
  }

  // 检查用户是否已验证邮箱
  if (!request.user.isEmailVerified) {
    return reply.code(403).send({
      error: '需要验证邮箱',
      message: '请先验证您的邮箱后再进行此操作',
      code: 'EMAIL_VERIFICATION_REQUIRED',
    });
  }
}

/**
 * Fastify 插件：注册邮箱验证中间件
 */
export default fp(async function (fastify, opts) {
  fastify.decorate('requireEmailVerification', requireEmailVerification);
});
