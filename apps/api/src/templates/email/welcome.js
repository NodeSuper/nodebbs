/**
 * 欢迎邮件模板
 */
export default function welcomeTemplate({ username, verificationLink }) {
  return {
    subject: '欢迎注册 - 请验证您的邮箱',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>欢迎注册</title>
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
                欢迎加入我们！
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
                感谢你注册我们的平台！为了确保账号安全，请点击下方按钮验证你的邮箱地址。
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationLink}" 
                       style="display: inline-block; padding: 14px 40px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                      验证邮箱
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; color: #999; font-size: 14px; line-height: 1.6;">
                如果按钮无法点击，请复制以下链接到浏览器打开：<br>
                <a href="${verificationLink}" style="color: #007bff; word-break: break-all;">${verificationLink}</a>
              </p>
              
              <p style="margin: 20px 0 0; color: #999; font-size: 14px; line-height: 1.6;">
                此链接将在 7 天后过期。
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.6; text-align: center;">
                如果你没有注册此账号，请忽略此邮件。
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
欢迎加入我们！

你好 ${username}，

感谢你注册我们的平台！为了确保账号安全，请访问以下链接验证你的邮箱地址：

${verificationLink}

此链接将在 7 天后过期。

如果你没有注册此账号，请忽略此邮件。
    `.trim(),
  };
}
