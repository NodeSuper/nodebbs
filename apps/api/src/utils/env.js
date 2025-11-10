export const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('当前环境: ', NODE_ENV);

export const isDev = NODE_ENV === 'development';
export const isProd = NODE_ENV === 'production';
