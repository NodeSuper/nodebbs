/**
 * 阿里云短信提供商
 * 使用阿里云 SMS API 发送短信
 * https://help.aliyun.com/product/44282.html
 */

/**
 * 通过阿里云发送短信
 * @param {object} providerConfig - 提供商配置
 * @param {string} providerConfig.accessKeyId - AccessKey ID
 * @param {string} providerConfig.accessKeySecret - AccessKey Secret
 * @param {string} providerConfig.signName - 短信签名
 * @param {string} [providerConfig.region] - 区域（默认 cn-hangzhou）
 * @param {object} options - 发送选项
 * @param {string} options.to - 手机号
 * @param {string} options.templateCode - 模板代码
 * @param {object} options.templateParams - 模板参数
 * @returns {Promise<{success: boolean, messageId: string}>}
 */
export async function sendViaAliyun(providerConfig, { to, templateCode, templateParams }) {
  const { accessKeyId, accessKeySecret, signName, region = 'cn-hangzhou' } = providerConfig;

  // 动态导入阿里云 SDK
  // 需要安装依赖: npm install @alicloud/dysmsapi20170525 @alicloud/openapi-client
  const { default: Dysmsapi20170525 } = await import('@alicloud/dysmsapi20170525');
  const { default: OpenApi } = await import('@alicloud/openapi-client');

  const config = new OpenApi.Config({
    accessKeyId,
    accessKeySecret,
    endpoint: `dysmsapi.aliyuncs.com`,
    regionId: region,
  });

  const client = new Dysmsapi20170525.default(config);

  const request = new Dysmsapi20170525.SendSmsRequest({
    phoneNumbers: to,
    signName: signName,
    templateCode: templateCode,
    templateParam: JSON.stringify(templateParams),
  });

  const response = await client.sendSms(request);

  if (response.body.code !== 'OK') {
    throw new Error(`阿里云短信发送失败: ${response.body.message}`);
  }

  return { success: true, messageId: response.body.bizId };
}
