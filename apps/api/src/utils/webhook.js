import crypto from 'node:crypto';

/**
 * 禁止 Webhook 请求的私有/内网地址模式
 */
const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '[::1]',
  'metadata.google.internal',
];

const BLOCKED_IP_PREFIXES = [
  '10.',
  '172.16.', '172.17.', '172.18.', '172.19.',
  '172.20.', '172.21.', '172.22.', '172.23.',
  '172.24.', '172.25.', '172.26.', '172.27.',
  '172.28.', '172.29.', '172.30.', '172.31.',
  '192.168.',
  '169.254.',
];

/**
 * 校验 Webhook URL 是否安全（防止 SSRF）
 */
export function validateWebhookUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error('无效的 URL 格式');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Webhook URL 仅支持 http/https 协议');
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTS.includes(hostname)) {
    throw new Error('Webhook URL 不允许指向本地地址');
  }

  if (BLOCKED_IP_PREFIXES.some((prefix) => hostname.startsWith(prefix))) {
    throw new Error('Webhook URL 不允许指向内网地址');
  }

  return parsed;
}

/**
 * 生成 HMAC-SHA256 签名
 */
export function generateSignature(payloadString, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');
}

/**
 * 构建 Webhook 请求头
 */
export function buildWebhookHeaders(event, timestamp, signature) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'NodeBBS-Webhook/1.0',
    'X-Webhook-Event': event,
    'X-Webhook-Timestamp': timestamp,
  };

  if (signature) {
    headers['X-Webhook-Signature'] = signature;
  }

  return headers;
}

/**
 * 发送单次 Webhook 请求
 */
export async function sendWebhookRequest(url, event, data, { secret, timeout = 5000 } = {}) {
  validateWebhookUrl(url);

  const webhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

  const bodyString = JSON.stringify(webhookPayload);
  const signature = secret ? generateSignature(bodyString, secret) : null;
  const headers = buildWebhookHeaders(event, webhookPayload.timestamp, signature);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: bodyString,
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** 重试次数硬上限 */
export const MAX_RETRY_LIMIT = 10;
