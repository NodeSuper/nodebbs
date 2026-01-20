/**
 * Resend 邮件提供商
 * 使用 Resend REST API 发送邮件
 * https://resend.com/docs/send-with-nodejs
 */

/**
 * 通过 Resend 发送邮件
 * @param {object} providerConfig - 提供商配置
 * @param {object} options - 发送选项
 * @returns {Promise<{success: boolean, messageId: string}>}
 */
export async function sendViaResend(providerConfig, { to, subject, html, text }) {
  const { apiKey, apiEndpoint, fromEmail, fromName } = providerConfig;

  const endpoint = apiEndpoint || 'https://api.resend.com/emails';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html: html || text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend 发送失败: ${error.message || JSON.stringify(error)}`);
  }

  const result = await response.json();
  return { success: true, messageId: result.id };
}
