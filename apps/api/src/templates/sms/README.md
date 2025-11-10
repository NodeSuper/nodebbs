# 短信模板系统使用指南

## 概述

短信模板系统提供了常见场景的短信模板，支持变量替换和多种短信服务商。

## 模板分类

### 验证码类（6个）
- `verification` - 通用验证码
- `login-verification` - 登录验证码
- `password-reset` - 密码重置验证码
- `phone-binding` - 手机号绑定验证码
- `phone-change` - 手机号变更验证码
- `register` - 注册验证码

### 通知类（5个）
- `security-alert` - 安全提醒
- `payment-notification` - 支付通知
- `order-status` - 订单状态
- `appointment-reminder` - 预约提醒
- `activity-notification` - 活动通知

## 使用方式

### 基本用法

```javascript
import { getSmsTemplate } from './templates/sms/index.js';

// 获取模板内容
const sms = getSmsTemplate('verification', {
  code: '123456',
  expiresIn: '5分钟',
  appName: '我的应用'
});

console.log(sms.content);
// 输出: 【我的应用】您的验证码是：123456，5分钟内有效，请勿泄露给他人。
```

### 在 Fastify 插件中使用

```javascript
// 创建短信插件 api/src/plugins/sms.js
import { getSmsTemplate } from '../templates/sms/index.js';

fastify.decorate('sendSms', async (options) => {
  const { phone, template, data } = options;
  
  // 渲染模板
  const sms = getSmsTemplate(template, data);
  
  // 调用短信服务商 API
  await sendViaSmsProvider(phone, sms.content);
});

// 使用
await fastify.sendSms({
  phone: '+86 138 0000 0000',
  template: 'verification',
  data: {
    code: '123456',
    expiresIn: '5分钟'
  }
});
```

## 模板详解

### 1. verification - 通用验证码

**适用场景：** 通用的验证码发送

**参数：**
- `code` (string, 必需) - 验证码
- `expiresIn` (string, 可选) - 过期时间，默认 "5分钟"
- `appName` (string, 可选) - 应用名称，默认 "我们的平台"

**示例：**
```javascript
getSmsTemplate('verification', {
  code: '123456',
  expiresIn: '5分钟',
  appName: '我的应用'
});
// 【我的应用】您的验证码是：123456，5分钟内有效，请勿泄露给他人。
```

### 2. login-verification - 登录验证码

**适用场景：** 用户登录时的验证码

**参数：**
- `code` (string, 必需) - 验证码
- `expiresIn` (string, 可选) - 过期时间，默认 "5分钟"
- `appName` (string, 可选) - 应用名称
- `ipAddress` (string, 可选) - 登录 IP 地址

**示例：**
```javascript
getSmsTemplate('login-verification', {
  code: '654321',
  expiresIn: '5分钟',
  ipAddress: '192.168.1.1'
});
// 【我们的平台】您正在登录，验证码：654321，5分钟内有效，登录IP：192.168.1.1。若非本人操作，请忽略。
```

### 3. password-reset - 密码重置验证码

**适用场景：** 用户重置密码

**参数：**
- `code` (string, 必需) - 验证码
- `expiresIn` (string, 可选) - 过期时间，默认 "10分钟"
- `appName` (string, 可选) - 应用名称

**示例：**
```javascript
getSmsTemplate('password-reset', {
  code: '789012',
  expiresIn: '10分钟'
});
// 【我们的平台】您正在重置密码，验证码：789012，10分钟内有效。若非本人操作，请立即修改密码。
```

### 4. phone-binding - 手机号绑定验证码

**适用场景：** 用户绑定手机号

**参数：**
- `code` (string, 必需) - 验证码
- `expiresIn` (string, 可选) - 过期时间，默认 "5分钟"
- `appName` (string, 可选) - 应用名称

**示例：**
```javascript
getSmsTemplate('phone-binding', {
  code: '345678'
});
// 【我们的平台】您正在绑定手机号，验证码：345678，5分钟内有效，请勿泄露。
```

### 5. phone-change - 手机号变更验证码

**适用场景：** 用户更换手机号

**参数：**
- `code` (string, 必需) - 验证码
- `expiresIn` (string, 可选) - 过期时间，默认 "5分钟"
- `appName` (string, 可选) - 应用名称
- `oldPhone` (string, 可选) - 原手机号

**示例：**
```javascript
getSmsTemplate('phone-change', {
  code: '901234',
  oldPhone: '138****0000'
});
// 【我们的平台】您正在更换手机号，原手机号：138****0000，验证码：901234，5分钟内有效。若非本人操作，请立即联系客服。
```

### 6. register - 注册验证码

**适用场景：** 新用户注册

**参数：**
- `code` (string, 必需) - 验证码
- `expiresIn` (string, 可选) - 过期时间，默认 "10分钟"
- `appName` (string, 可选) - 应用名称

**示例：**
```javascript
getSmsTemplate('register', {
  code: '567890',
  expiresIn: '10分钟'
});
// 【我们的平台】欢迎注册！您的验证码是：567890，10分钟内有效，请尽快完成注册。
```

### 7. security-alert - 安全提醒

**适用场景：** 账号安全操作提醒

**参数：**
- `action` (string, 必需) - 操作类型（如"密码修改"、"绑定邮箱"）
- `time` (string, 必需) - 操作时间
- `ipAddress` (string, 可选) - 操作 IP
- `appName` (string, 可选) - 应用名称

**示例：**
```javascript
getSmsTemplate('security-alert', {
  action: '密码修改',
  time: '2024-01-01 12:00',
  ipAddress: '192.168.1.1'
});
// 【我们的平台】您的账号于2024-01-01 12:00进行了密码修改操作，IP：192.168.1.1。若非本人操作，请立即修改密码并联系客服。
```

### 8. payment-notification - 支付通知

**适用场景：** 支付成功通知

**参数：**
- `amount` (string|number, 必需) - 支付金额
- `orderNo` (string, 必需) - 订单号
- `time` (string, 必需) - 支付时间
- `appName` (string, 可选) - 应用名称

**示例：**
```javascript
getSmsTemplate('payment-notification', {
  amount: '99.00',
  orderNo: 'ORD20240101001',
  time: '2024-01-01 12:00'
});
// 【我们的平台】您于2024-01-01 12:00支付99.00元成功，订单号：ORD20240101001。如有疑问请联系客服。
```

### 9. order-status - 订单状态

**适用场景：** 订单状态变更通知

**参数：**
- `orderNo` (string, 必需) - 订单号
- `status` (string, 必需) - 状态代码（paid/shipped/delivered/completed/cancelled/refunded）
- `statusText` (string, 可选) - 自定义状态文本
- `appName` (string, 可选) - 应用名称

**示例：**
```javascript
getSmsTemplate('order-status', {
  orderNo: 'ORD20240101001',
  status: 'shipped'
});
// 【我们的平台】您的订单ORD20240101001已发货。详情请登录查看。

// 自定义状态文本
getSmsTemplate('order-status', {
  orderNo: 'ORD20240101001',
  statusText: '正在配送中'
});
// 【我们的平台】您的订单ORD20240101001正在配送中。详情请登录查看。
```

### 10. appointment-reminder - 预约提醒

**适用场景：** 预约服务提醒

**参数：**
- `service` (string, 必需) - 服务名称
- `time` (string, 必需) - 预约时间
- `location` (string, 可选) - 地点
- `appName` (string, 可选) - 应用名称

**示例：**
```javascript
getSmsTemplate('appointment-reminder', {
  service: '体检服务',
  time: '2024-01-01 09:00',
  location: '北京市朝阳区xxx医院'
});
// 【我们的平台】温馨提醒：您预约的体检服务将于2024-01-01 09:00开始，地点：北京市朝阳区xxx医院，请准时参加。
```

### 11. activity-notification - 活动通知

**适用场景：** 营销活动通知

**参数：**
- `activityName` (string, 必需) - 活动名称
- `time` (string, 必需) - 活动时间
- `link` (string, 可选) - 活动链接
- `appName` (string, 可选) - 应用名称

**示例：**
```javascript
getSmsTemplate('activity-notification', {
  activityName: '双11大促',
  time: '2024-11-11 00:00',
  link: 'https://example.com/sale'
});
// 【我们的平台】双11大促将于2024-11-11 00:00开始，详情：https://example.com/sale，期待您的参与！退订回T
```

## 创建新模板

### 步骤 1: 创建模板文件

在 `api/src/templates/sms/` 目录下创建新文件：

```javascript
// my-template.js
export default function myTemplate({ param1, param2, appName = '我们的平台' }) {
  return {
    content: `【${appName}】您的消息：${param1}，${param2}。`,
    signature: appName,
    variables: {
      param1,
      param2,
    },
  };
}
```

### 步骤 2: 注册模板

在 `api/src/templates/sms/index.js` 中导入并注册：

```javascript
import myTemplate from './my-template.js';

const templates = {
  // ... 其他模板
  'my-template': myTemplate,
};
```

## 短信服务商集成

### 阿里云短信

```javascript
import Core from '@alicloud/pop-core';

async function sendViaAliyun(phone, content, templateCode, templateParam) {
  const client = new Core({
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
  });

  const params = {
    PhoneNumbers: phone,
    SignName: '签名',
    TemplateCode: templateCode,
    TemplateParam: JSON.stringify(templateParam)
  };

  return await client.request('SendSms', params, { method: 'POST' });
}
```

### 腾讯云短信

```javascript
import tencentcloud from 'tencentcloud-sdk-nodejs';

async function sendViaTencent(phone, content, templateId, templateParam) {
  const SmsClient = tencentcloud.sms.v20210111.Client;
  
  const client = new SmsClient({
    credential: {
      secretId: process.env.TENCENT_SECRET_ID,
      secretKey: process.env.TENCENT_SECRET_KEY,
    },
    region: 'ap-guangzhou',
  });

  const params = {
    PhoneNumberSet: [phone],
    SmsSdkAppId: process.env.TENCENT_SMS_APP_ID,
    SignName: '签名',
    TemplateId: templateId,
    TemplateParamSet: templateParam,
  };

  return await client.SendSms(params);
}
```

### Twilio（国际短信）

```javascript
import twilio from 'twilio';

async function sendViaTwilio(phone, content) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  return await client.messages.create({
    body: content,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
}
```

## 最佳实践

### 1. 字数限制

- 中文短信：70字以内（含签名）
- 超过70字会按多条计费
- 建议控制在60字以内

### 2. 签名规范

- 签名必须在【】内
- 签名通常放在开头
- 签名需要在服务商后台申请

### 3. 验证码规范

- 验证码长度：4-6位
- 有效期：5-10分钟
- 明确告知用户不要泄露

### 4. 发送频率限制

```javascript
// 实现发送频率限制
const smsRateLimit = new Map();

async function checkRateLimit(phone) {
  const key = `sms:${phone}`;
  const lastSent = smsRateLimit.get(key);
  
  if (lastSent && Date.now() - lastSent < 60000) {
    throw new Error('发送过于频繁，请1分钟后再试');
  }
  
  smsRateLimit.set(key, Date.now());
}
```

### 5. 错误处理

```javascript
try {
  await fastify.sendSms({
    phone: '+86 138 0000 0000',
    template: 'verification',
    data: { code: '123456' }
  });
} catch (error) {
  fastify.log.error(`短信发送失败: ${error.message}`);
  // 不要向用户暴露详细错误信息
  throw new Error('短信发送失败，请稍后重试');
}
```

### 6. 营销短信注意事项

- 必须提供退订方式（如"退订回T"）
- 不要在夜间（22:00-8:00）发送
- 需要用户明确同意接收
- 遵守《反垃圾短信规定》

## 测试

### 开发环境

```javascript
// 在开发环境中，可以只打印短信内容而不实际发送
if (process.env.NODE_ENV === 'development') {
  console.log(`[短信] 发送至 ${phone}:`);
  console.log(sms.content);
  return { success: true, messageId: 'dev-test' };
}
```

### 单元测试

```javascript
import { getSmsTemplate } from './templates/sms/index.js';
import { describe, it, expect } from 'vitest';

describe('SMS Templates', () => {
  it('should render verification template', () => {
    const sms = getSmsTemplate('verification', {
      code: '123456',
      appName: '测试应用'
    });
    
    expect(sms.content).toContain('123456');
    expect(sms.content).toContain('测试应用');
  });
});
```

## 常见问题

### Q: 短信发送失败怎么办？

A: 检查以下几点：
1. 手机号格式是否正确（需要包含国家代码）
2. 短信服务商配置是否正确
3. 账户余额是否充足
4. 签名和模板是否已审核通过
5. 是否触发了频率限制

### Q: 如何防止短信轰炸？

A: 实施以下措施：
1. IP 限制：同一 IP 每天最多发送 N 条
2. 手机号限制：同一手机号每天最多发送 M 条
3. 图形验证码：发送前需要先通过图形验证
4. 时间间隔：两次发送间隔至少 60 秒

### Q: 验证码被拦截怎么办？

A: 可能的原因：
1. 签名未报备或不规范
2. 内容包含敏感词
3. 用户手机设置了拦截
4. 运营商拦截（高峰期）

建议：使用正规服务商，完善签名和模板审核。

## 相关文件

- 模板文件：`api/src/templates/sms/*.js`
- 模板索引：`api/src/templates/sms/index.js`
- 短信插件：`api/src/plugins/sms.js`（需要创建）
