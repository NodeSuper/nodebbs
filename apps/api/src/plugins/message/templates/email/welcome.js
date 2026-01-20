/**
 * 欢迎邮件模板
 */
export default function welcomeTemplate({ username }) {
  return {
    subject: '欢迎加入我们',
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
                🎉 欢迎加入我们！
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
                感谢你注册我们的平台！你已经成功创建了账号，现在可以开始探索我们的社区了。
              </p>

              <!-- Features -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                <h2 style="margin: 0 0 15px; color: #333; font-size: 18px; font-weight: 600;">
                  你可以做的事情：
                </h2>
                <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 15px; line-height: 1.8;">
                  <li>浏览和参与热门话题讨论</li>
                  <li>发表你的想法和见解</li>
                  <li>关注感兴趣的用户和话题</li>
                  <li>收藏喜欢的内容</li>
                  <li>自定义你的个人资料</li>
                </ul>
              </div>

              <p style="margin: 20px 0 0; color: #666; font-size: 16px; line-height: 1.6;">
                如果你有任何问题或建议，欢迎随时与我们联系。祝你在这里度过愉快的时光！
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

感谢你注册我们的平台！你已经成功创建了账号，现在可以开始探索我们的社区了。

你可以做的事情：
- 浏览和参与热门话题讨论
- 发表你的想法和见解
- 关注感兴趣的用户和话题
- 收藏喜欢的内容
- 自定义你的个人资料

如果你有任何问题或建议，欢迎随时与我们联系。祝你在这里度过愉快的时光！

如果你没有注册此账号，请忽略此邮件。
    `.trim(),
  };
}
