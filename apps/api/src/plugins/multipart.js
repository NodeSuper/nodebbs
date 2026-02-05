import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';
import { MAX_UPLOAD_SIZE_GLOBAL_BYTES } from '../constants/upload.js';

/**
 * 文件上传插件
 * 支持 multipart/form-data 格式
 */
async function multipartPlugin(fastify, options) {
  fastify.register(multipart, {
    limits: {
      fileSize: MAX_UPLOAD_SIZE_GLOBAL_BYTES, // 全局上限 100MB，具体的业务限制由 RBAC 动态控制
    },
  });
}

export default fp(multipartPlugin, {
  name: 'multipart',
  dependencies: [],
});
