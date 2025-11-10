/**
 * 短信模板使用示例
 */
import { getSmsTemplate, getAvailableSmsTemplates, getSmsTemplatesByCategory } from './index.js';

// ============ 示例 1: 发送验证码 ============
function example1_verification() {
  const sms = getSmsTemplate('verification', {
    code: '123456',
    expiresIn: '5分钟',
    appName: '我的应用'
  });
  
  console.log('验证码短信:');
  console.log(sms.content);
  // 输出: 【我的应用】您的验证码是：123456，5分钟内有效，请勿泄露给他人。
}

// ============ 示例 2: 登录验证码（带IP） ============
function example2_loginVerification() {
  const sms = getSmsTemplate('login-verification', {
    code: '654321',
    expiresIn: '5分钟',
    ipAddress: '192.168.1.1',
    appName: '我的应用'
  });
  
  console.log('登录验证码:');
  console.log(sms.content);
  // 输出: 【我的应用】您正在登录，验证码：654321，5分钟内有效，登录IP：192.168.1.1。若非本人操作，请忽略。
}

// ============ 示例 3: 密码重置 ============
function example3_passwordReset() {
  const sms = getSmsTemplate('password-reset', {
    code: '789012',
    expiresIn: '10分钟'
  });
  
  console.log('密码重置:');
  console.log(sms.content);
  // 输出: 【我们的平台】您正在重置密码，验证码：789012，10分钟内有效。若非本人操作，请立即修改密码。
}

// ============ 示例 4: 手机号绑定 ============
function example4_phoneBinding() {
  const sms = getSmsTemplate('phone-binding', {
    code: '345678'
  });
  
  console.log('手机号绑定:');
  console.log(sms.content);
}

// ============ 示例 5: 手机号变更 ============
function example5_phoneChange() {
  const sms = getSmsTemplate('phone-change', {
    code: '901234',
    oldPhone: '138****0000'
  });
  
  console.log('手机号变更:');
  console.log(sms.content);
}

// ============ 示例 6: 注册验证码 ============
function example6_register() {
  const sms = getSmsTemplate('register', {
    code: '567890',
    expiresIn: '10分钟'
  });
  
  console.log('注册验证码:');
  console.log(sms.content);
}

// ============ 示例 7: 安全提醒 ============
function example7_securityAlert() {
  const sms = getSmsTemplate('security-alert', {
    action: '密码修改',
    time: '2024-01-01 12:00',
    ipAddress: '192.168.1.1'
  });
  
  console.log('安全提醒:');
  console.log(sms.content);
}

// ============ 示例 8: 支付通知 ============
function example8_paymentNotification() {
  const sms = getSmsTemplate('payment-notification', {
    amount: '99.00',
    orderNo: 'ORD20240101001',
    time: '2024-01-01 12:00'
  });
  
  console.log('支付通知:');
  console.log(sms.content);
}

// ============ 示例 9: 订单状态 ============
function example9_orderStatus() {
  // 使用预定义状态
  const sms1 = getSmsTemplate('order-status', {
    orderNo: 'ORD20240101001',
    status: 'shipped'
  });
  
  console.log('订单状态（预定义）:');
  console.log(sms1.content);
  
  // 使用自定义状态文本
  const sms2 = getSmsTemplate('order-status', {
    orderNo: 'ORD20240101002',
    status: 'custom',
    statusText: '正在配送中'
  });
  
  console.log('订单状态（自定义）:');
  console.log(sms2.content);
}

// ============ 示例 10: 预约提醒 ============
function example10_appointmentReminder() {
  const sms = getSmsTemplate('appointment-reminder', {
    service: '体检服务',
    time: '2024-01-01 09:00',
    location: '北京市朝阳区xxx医院'
  });
  
  console.log('预约提醒:');
  console.log(sms.content);
}

// ============ 示例 11: 活动通知 ============
function example11_activityNotification() {
  const sms = getSmsTemplate('activity-notification', {
    activityName: '双11大促',
    time: '2024-11-11 00:00',
    link: 'https://example.com/sale'
  });
  
  console.log('活动通知:');
  console.log(sms.content);
}

// ============ 示例 12: 获取所有可用模板 ============
function example12_listTemplates() {
  const templates = getAvailableSmsTemplates();
  console.log('所有可用模板:', templates);
  
  const categories = getSmsTemplatesByCategory();
  console.log('按类别分组:', categories);
}

// ============ 示例 13: 在 Fastify 路由中使用 ============
async function example13_inRoute(fastify) {
  fastify.post('/send-verification-code', async (request, reply) => {
    const { phone } = request.body;
    
    // 生成验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 获取短信内容
    const sms = getSmsTemplate('verification', {
      code,
      expiresIn: '5分钟',
      appName: '我的应用'
    });
    
    // 发送短信（需要实现 sendSms 方法）
    try {
      await fastify.sendSms({
        phone,
        content: sms.content
      });
      
      return { success: true, message: '验证码已发送' };
    } catch (error) {
      fastify.log.error(`短信发送失败: ${error.message}`);
      return reply.code(500).send({ error: '短信发送失败' });
    }
  });
}

// ============ 示例 14: 结合 verification 工具 ============
async function example14_withVerification(fastify) {
  const { createPhoneVerification } = await import('../../utils/verification.js');
  
  fastify.post('/phone/send-code', async (request, reply) => {
    const { phone } = request.body;
    
    // 创建验证码记录（6位数字）
    const code = await createPhoneVerification(phone);
    
    // 获取短信模板
    const sms = getSmsTemplate('verification', {
      code,
      expiresIn: '5分钟'
    });
    
    // 发送短信
    await fastify.sendSms({
      phone,
      content: sms.content
    });
    
    return { success: true, message: '验证码已发送' };
  });
}

// ============ 示例 15: 批量发送（营销短信） ============
async function example15_bulkSend(fastify) {
  const phones = ['+86 138 0000 0001', '+86 138 0000 0002', '+86 138 0000 0003'];
  
  const sms = getSmsTemplate('activity-notification', {
    activityName: '双11大促',
    time: '2024-11-11 00:00',
    link: 'https://example.com/sale'
  });
  
  // 使用 Promise.all 并发发送
  const results = await Promise.allSettled(
    phones.map(phone => 
      fastify.sendSms({
        phone,
        content: sms.content
      })
    )
  );
  
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  console.log(`成功发送 ${successCount}/${phones.length} 条短信`);
}

// 运行所有示例
export function runAllExamples() {
  console.log('='.repeat(50));
  example1_verification();
  console.log('='.repeat(50));
  example2_loginVerification();
  console.log('='.repeat(50));
  example3_passwordReset();
  console.log('='.repeat(50));
  example4_phoneBinding();
  console.log('='.repeat(50));
  example5_phoneChange();
  console.log('='.repeat(50));
  example6_register();
  console.log('='.repeat(50));
  example7_securityAlert();
  console.log('='.repeat(50));
  example8_paymentNotification();
  console.log('='.repeat(50));
  example9_orderStatus();
  console.log('='.repeat(50));
  example10_appointmentReminder();
  console.log('='.repeat(50));
  example11_activityNotification();
  console.log('='.repeat(50));
  example12_listTemplates();
  console.log('='.repeat(50));
}

// 如果直接运行此文件，执行所有示例
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

export {
  example1_verification,
  example2_loginVerification,
  example3_passwordReset,
  example4_phoneBinding,
  example5_phoneChange,
  example6_register,
  example7_securityAlert,
  example8_paymentNotification,
  example9_orderStatus,
  example10_appointmentReminder,
  example11_activityNotification,
  example12_listTemplates,
  example13_inRoute,
  example14_withVerification,
  example15_bulkSend,
};
