/**
 * 密码重置邮件模板
 */
export default function passwordResetTemplate({ username, resetLink, expiresIn = '1小时' }) {
  return {
    subject: '密码重置请求',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>密码重置</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #333; font-size: 28px; font-weight: 600;">
                密码重置请求
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0 0 20px; color: #666; font-size: 16px; line-height: 1.6;">
                你好 <strong style="color: #333;">${username}</strong>，
              </p>
              <p style="margin: 0 0 20px; color: #666; font-size: 16px; line-height: 1.6;">
                我们收到了你的密码重置请求。点击下方按钮设置新密码：
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" 
                       style="display: inline-block; padding: 14px 40px; background-color: #dc3545; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                      重置密码
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; color: #999; font-size: 14px; line-height: 1.6;">
                如果按钮无法点击，请复制以下链接到浏览器打开：<br>
                <a href="${resetLink}" style="color: #dc3545; word-break: break-all;">${resetLink}</a>
              </p>
              
              <p style="margin: 20px 0 0; color: #999; font-size: 14px; line-height: 1.6;">
                此链接将在 <strong>${expiresIn}</strong> 后过期。
              </p>
              
              <!-- Warning -->
              <div style="margin: 30px 0 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  <strong>安全提示：</strong>如果你没有请求重置密码，请忽略此邮件。你的密码不会被更改。
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.6; text-align: center;">
                为了账号安全，请勿将此邮件转发给他人。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
密码重置请求

你好 ${username}，

我们收到了你的密码重置请求。请访问以下链接设置新密码：

${resetLink}

此链接将在 ${expiresIn} 后过期。

安全提示：如果你没有请求重置密码，请忽略此邮件。你的密码不会被更改。

为了账号安全，请勿将此邮件转发给他人。
    `.trim(),
  };
}
