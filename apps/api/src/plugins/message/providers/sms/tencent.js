/**
 * 腾讯云短信提供商
 * 使用腾讯云 SMS API 发送短信
 * https://cloud.tencent.com/product/sms
 */

/**
 * 通过腾讯云发送短信
 * @param {object} providerConfig - 提供商配置
 * @param {string} providerConfig.secretId - SecretId
 * @param {string} providerConfig.secretKey - SecretKey
 * @param {string} providerConfig.appId - 应用 ID（SmsSdkAppId）
 * @param {string} providerConfig.signName - 短信签名
 * @param {string} [providerConfig.region] - 区域（默认 ap-guangzhou）
 * @param {object} options - 发送选项
 * @param {string} options.to - 手机号（需要带国际区号，如 +8613800138000）
 * @param {string} options.templateId - 模板 ID
 * @param {string[]} options.templateParams - 模板参数数组
 * @returns {Promise<{success: boolean, messageId: string}>}
 */
export async function sendViaTencent(providerConfig, { to, templateId, templateParams }) {
  const { secretId, secretKey, appId, signName, region = 'ap-guangzhou' } = providerConfig;

  // 动态导入腾讯云 SDK
  // 需要安装依赖: npm install tencentcloud-sdk-nodejs
  const tencentcloud = await import('tencentcloud-sdk-nodejs');
  const SmsClient = tencentcloud.sms.v20210111.Client;

  const client = new SmsClient({
    credential: {
      secretId,
      secretKey,
    },
    region: region,
    profile: {
      httpProfile: {
        endpoint: 'sms.tencentcloudapi.com',
      },
    },
  });

  // 格式化手机号（腾讯云需要 +86 前缀）
  const formattedPhone = to.startsWith('+') ? to : `+86${to}`;

  const params = {
    PhoneNumberSet: [formattedPhone],
    SmsSdkAppId: appId,
    SignName: signName,
    TemplateId: templateId,
    TemplateParamSet: templateParams || [],
  };

  const response = await client.SendSms(params);

  if (response.SendStatusSet?.[0]?.Code !== 'Ok') {
    const errorMsg = response.SendStatusSet?.[0]?.Message || '未知错误';
    throw new Error(`腾讯云短信发送失败: ${errorMsg}`);
  }

  return { 
    success: true, 
    messageId: response.SendStatusSet?.[0]?.SerialNo || response.RequestId 
  };
}
