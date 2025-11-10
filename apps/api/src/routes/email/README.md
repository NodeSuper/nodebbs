# 邮件服务 API

## 概述

邮件服务 API 提供了邮件发送服务的配置和管理功能，支持多种邮件服务提供商。

## API 端点

### 1. 获取邮件服务提供商列表

```http
GET /api/email/providers
```

**响应示例**（公开访问）：
```json
{
  "items": [
    {
      "provider": "smtp",
      "isEnabled": true,
      "displayName": "SMTP",
      "displayOrder": 1
    }
  ]
}
```

**响应示例**（管理员）：
```json
{
  "items": [
    {
      "id": 1,
      "provider": "smtp",
      "isEnabled": true,
      "isDefault": true,
      "smtpHost": "smtp.example.com",
      "smtpPort": 587,
      "smtpSecure": true,
      "smtpUser": "user@example.com",
      "smtpPassword": "encrypted_password",
      "fromEmail": "noreply@example.com",
      "fromName": "我的论坛",
      "displayName": "SMTP",
      "displayOrder": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. 更新邮件服务提供商配置

```http
PATCH /api/email/providers/:provider
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**请求体**：
```json
{
  "isEnabled": true,
  "isDefault": true,
  "smtpHost": "smtp.example.com",
  "smtpPort": 587,
  "smtpSecure": true,
  "smtpUser": "user@example.com",
  "smtpPassword": "password",
  "fromEmail": "noreply@example.com",
  "fromName": "我的论坛"
}
```

**响应**：
```json
{
  "message": "邮件服务配置已更新",
  "provider": {
    "id": 1,
    "provider": "smtp",
    "isEnabled": true,
    "isDefault": true,
    "displayName": "SMTP"
  }
}
```

### 3. 测试邮件服务配置

```http
POST /api/email/providers/:provider/test
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**请求体**：
```json
{
  "testEmail": "test@example.com"
}
```

**响应**：
```json
{
  "success": true,
  "message": "测试邮件已发送到 test@example.com"
}
```

### 4. 发送邮箱验证码

```http
POST /api/email/send-verification
Content-Type: application/json
```

**请求体**：
```json
{
  "email": "user@example.com",
  "type": "register"
}
```

**类型说明**：
- `register` - 注册验证码
- `login` - 登录验证码
- `reset-password` - 密码重置验证码

**响应**：
```json
{
  "message": "验证码已发送，请查收邮件"
}
```

## 使用示例

### JavaScript/Node.js

```javascript
// 获取邮件服务提供商列表
const response = await fetch('http://localhost:7100/api/email/providers');
const data = await response.json();
console.log(data.items);

// 更新配置（管理员）
const updateResponse = await fetch('http://localhost:7100/api/email/providers/smtp', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    isEnabled: true,
    isDefault: true,
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpSecure: true,
    smtpUser: 'user@example.com',
    smtpPassword: 'password',
    fromEmail: 'noreply@example.com',
    fromName: '我的论坛',
  }),
});

// 发送验证码
const verifyResponse = await fetch('http://localhost:7100/api/email/send-verification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    type: 'register',
  }),
});
```

### cURL

```bash
# 获取邮件服务提供商列表
curl http://localhost:7100/api/email/providers

# 更新配置（管理员）
curl -X PATCH http://localhost:7100/api/email/providers/smtp \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isEnabled": true,
    "isDefault": true,
    "smtpHost": "smtp.example.com",
    "smtpPort": 587,
    "smtpSecure": true,
    "smtpUser": "user@example.com",
    "smtpPassword": "password",
    "fromEmail": "noreply@example.com",
    "fromName": "我的论坛"
  }'

# 测试配置
curl -X POST http://localhost:7100/api/email/providers/smtp/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "test@example.com"}'

# 发送验证码
curl -X POST http://localhost:7100/api/email/send-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "type": "register"
  }'
```

## 错误处理

### 常见错误码

- `400` - 请求参数错误
- `401` - 未授权（需要登录）
- `403` - 权限不足（需要管理员权限）
- `404` - 邮件服务提供商不存在
- `500` - 服务器内部错误

### 错误响应示例

```json
{
  "error": "邮件服务提供商不存在"
}
```

## 权限说明

- **公开接口**：
  - `GET /api/email/providers` - 只返回已启用的提供商（不含敏感信息）
  - `POST /api/email/send-verification` - 发送验证码（有限速）

- **管理员接口**：
  - `GET /api/email/providers` - 返回所有提供商的完整配置
  - `PATCH /api/email/providers/:provider` - 更新配置
  - `POST /api/email/providers/:provider/test` - 测试配置

## 注意事项

1. **敏感信息**：密码和 API Key 应该妥善保管，不要泄露
2. **限速保护**：发送验证码接口应该有限速保护，防止滥用
3. **测试环境**：在生产环境使用前，请先在测试环境充分测试
4. **邮件服务商限制**：注意各邮件服务商的发送限制和配额

## 相关文档

- [邮件服务配置文档](../../../docs/EMAIL_SERVICE_CONFIGURATION.md)
- [快速开始指南](../../../docs/EMAIL_SERVICE_QUICK_START.md)
- [实现总结](../../../docs/EMAIL_SERVICE_IMPLEMENTATION_SUMMARY.md)
