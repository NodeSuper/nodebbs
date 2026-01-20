/**
 * SendGrid 邮件提供商
 * 使用 SendGrid REST API 发送邮件
 * https://www.twilio.com/docs/sendgrid/for-developers/sending-email/quickstart-nodejs
 */

/**
 * 通过 SendGrid 发送邮件
 * @param {object} providerConfig - 提供商配置
 * @param {object} options - 发送选项
 * @returns {Promise<{success: boolean, messageId: string}>}
 */
export async function sendViaSendGrid(providerConfig, { to, subject, html, text }) {
  const { apiKey, apiEndpoint, fromEmail, fromName } = providerConfig;

  const endpoint = apiEndpoint || 'https://api.sendgrid.com/v3/mail/send';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail, name: fromName },
      subject,
      content: [
        { type: 'text/plain', value: text || '' },
        { type: 'text/html', value: html || '' },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid 发送失败: ${error}`);
  }

  return { success: true, messageId: response.headers.get('x-message-id') };
}
