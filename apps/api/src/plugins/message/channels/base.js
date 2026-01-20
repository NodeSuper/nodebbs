/**
 * Channel 基类
 * 定义消息发送渠道的统一接口
 */
export class BaseChannel {
  constructor(fastify) {
    this.fastify = fastify;
  }

  /**
   * 发送消息
   * @param {object} options - 发送选项
   * @param {string} options.to - 收件人（邮箱或手机号）
   * @param {string} options.template - 模板名称
   * @param {object} options.data - 模板数据
   * @param {string} [options.provider] - 指定提供商（可选）
   * @returns {Promise<{queued: boolean}>}
   */
  async send(options) {
    throw new Error('send() 方法必须由子类实现');
  }

  /**
   * 获取默认提供商配置
   * @returns {Promise<object|null>}
   */
  async getDefaultProvider() {
    throw new Error('getDefaultProvider() 方法必须由子类实现');
  }

  /**
   * 获取指定提供商配置
   * @param {string} name - 提供商名称
   * @returns {Promise<object|null>}
   */
  async getProvider(name) {
    throw new Error('getProvider() 方法必须由子类实现');
  }

  /**
   * 解析 JSON 配置
   * @param {object} provider - 提供商记录
   * @returns {object} 解析后的配置
   */
  parseConfig(provider) {
    if (!provider) return null;
    try {
      return {
        ...provider,
        config: provider.config ? JSON.parse(provider.config) : {},
      };
    } catch (e) {
      this.fastify.log.error(`解析提供商配置失败: ${e.message}`);
      return { ...provider, config: {} };
    }
  }
}
