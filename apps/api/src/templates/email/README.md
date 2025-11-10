# 邮件模板系统使用指南

## 概述

邮件模板系统支持两种发送方式：
1. **使用模板**（推荐）- 使用预定义的模板和数据
2. **直接发送** - 直接传入 HTML/文本内容

## 使用方式

### 方式 1: 使用模板（推荐）

```javascript
await fastify.sendEmail({
  to: 'user@example.com',
  template: 'welcome',  // 模板名称
  data: {               // 模板数据
    username: 'John',
    verificationLink: 'https://example.com/verify?token=xxx'
  }
});
```

### 方式 2: 直接发送内容

```javascript
await fastify.sendEmail({
  to: 'user@example.com',
  subject: '自定义主题',
  html: '<h1>Hello</h1>',
  text: 'Hello'
});
```

### 方式 3: 混合使用（覆盖模板的主题）

```javascript
await fastify.sendEmail({
  to: 'user@example.com',
  template: 'welcome',
  subject: '自定义主题（覆盖模板默认主题）',
  data: {
    username: 'John',
    verificationLink: 'https://example.com/verify?token=xxx'
  }
});
```

## 可用模板

### 1. `welcome` - 欢迎邮件

用于新用户注册时发送。

**数据参数：**
- `username` (string) - 用户名
- `verificationLink` (string) - 邮箱验证链接

**示例：**
```javascript
await fastify.sendEmail({
  to: email,
  template: 'welcome',
  data: {
    username: 'John',
    verificationLink: 'https://example.com/verify-email?token=abc123'
  }
});
```

### 2. `password-reset` - 密码重置

用于用户请求密码重置时发送。

**数据参数：**
- `username` (string) - 用户名
- `resetLink` (string) - 密码重置链接
- `expiresIn` (string, 可选) - 过期时间，默认 "1小时"

**示例：**
```javascript
await fastify.sendEmail({
  to: email,
  template: 'password-reset',
  data: {
    username: 'John',
    resetLink: 'https://example.com/reset-password?token=xyz789',
    expiresIn: '1小时'
  }
});
```

### 3. `email-verification` - 邮箱验证

用于重新发送邮箱验证时。

**数据参数：**
- `username` (string) - 用户名
- `verificationLink` (string) - 邮箱验证链接

**示例：**
```javascript
await fastify.sendEmail({
  to: email,
  template: 'email-verification',
  data: {
    username: 'John',
    verificationLink: 'https://example.com/verify-email?token=def456'
  }
});
```

## 创建新模板

### 步骤 1: 创建模板文件

在 `api/src/templates/email/` 目录下创建新文件，例如 `my-template.js`：

```javascript
/**
 * 我的自定义模板
 */
export default function myTemplate({ name, message }) {
  return {
    subject: '自定义邮件主题',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>自定义邮件</title>
</head>
<body>
  <h1>你好 ${name}</h1>
  <p>${message}</p>
</body>
</html>
    `,
    text: `
你好 ${name}

${message}
    `.trim(),
  };
}
```

### 步骤 2: 注册模板

在 `api/src/templates/email/index.js` 中导入并注册：

```javascript
import myTemplate from './my-template.js';

const templates = {
  welcome: welcomeTemplate,
  'password-reset': passwordResetTemplate,
  'email-verification': emailVerificationTemplate,
  'my-template': myTemplate,  // 添加新模板
};
```

### 步骤 3: 使用新模板

```javascript
await fastify.sendEmail({
  to: 'user@example.com',
  template: 'my-template',
  data: {
    name: 'John',
    message: 'This is a custom message'
  }
});
```

## 模板设计建议

### HTML 邮件最佳实践

1. **使用表格布局** - 邮件客户端对 CSS 支持有限，使用 `<table>` 布局最可靠
2. **内联样式** - 所有样式都应该使用内联 `style` 属性
3. **避免复杂 CSS** - 不要使用 flexbox、grid 等现代布局
4. **提供纯文本版本** - 始终提供 `text` 版本作为备选
5. **测试多个客户端** - 在 Gmail、Outlook、Apple Mail 等客户端测试

### 响应式设计

```html
<!-- 使用媒体查询适配移动设备 -->
<style>
  @media only screen and (max-width: 600px) {
    .container {
      width: 100% !important;
    }
  }
</style>
```

### 安全注意事项

1. **转义用户输入** - 防止 XSS 攻击
2. **验证链接** - 确保链接指向正确的域名
3. **不要在邮件中包含敏感信息** - 如密码、完整的信用卡号等

## 错误处理

邮件发送失败不应阻止业务流程：

```javascript
try {
  await fastify.sendEmail({
    to: email,
    template: 'welcome',
    data: { username, verificationLink }
  });
  fastify.log.info(`邮件已发送至 ${email}`);
} catch (error) {
  // 记录错误但不抛出异常
  fastify.log.error(`发送邮件失败: ${error.message}`);
  // 可以在开发环境显示链接
  if (process.env.NODE_ENV === 'development') {
    fastify.log.info(`验证链接: ${verificationLink}`);
  }
}
```

## 测试邮件

### 开发环境

在开发环境中，如果邮件服务未配置，可以：
1. 查看日志中的验证链接
2. 使用 [Mailtrap](https://mailtrap.io/) 等测试服务
3. 使用 [MailHog](https://github.com/mailhog/MailHog) 本地邮件服务器

### 生产环境

建议使用以下邮件服务：
- **Resend** - 现代化 API，开发者友好
- **SendGrid** - 功能强大，免费额度高
- **阿里云邮件推送** - 国内速度快
- **SMTP** - 通用方案，兼容性好

## 常见问题

### Q: 邮件发送失败怎么办？

A: 检查以下几点：
1. 邮件服务是否已在数据库中配置并启用
2. API 密钥或 SMTP 凭据是否正确
3. 发件人邮箱是否已验证（某些服务需要）
4. 查看日志中的详细错误信息

### Q: 如何自定义邮件样式？

A: 修改对应的模板文件，调整 HTML 和 CSS。建议使用在线工具如 [MJML](https://mjml.io/) 来设计响应式邮件。

### Q: 可以发送附件吗？

A: 当前版本不支持附件。如需此功能，需要扩展 `sendEmail` 方法。

### Q: 如何批量发送邮件？

A: 使用循环或队列系统（如 Bull）来批量发送，避免阻塞主线程：

```javascript
import Queue from 'bull';

const emailQueue = new Queue('email');

emailQueue.process(async (job) => {
  await fastify.sendEmail(job.data);
});

// 添加到队列
await emailQueue.add({
  to: 'user@example.com',
  template: 'welcome',
  data: { username: 'John' }
});
```

## 相关文件

- 模板文件：`api/src/templates/email/*.js`
- 模板索引：`api/src/templates/email/index.js`
- 邮件插件：`api/src/plugins/email.js`
- 使用示例：`api/src/routes/auth/index.js`
