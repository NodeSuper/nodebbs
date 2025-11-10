import fp from 'fastify-plugin';
import cors from '@fastify/cors';

async function securityPlugin(fastify, opts) {
  // Register CORS https://github.com/fastify/fastify-cors?tab=readme-ov-file#options
  await fastify.register(cors, {
    origin:
      process.env.CORS_ORIGIN === 'false'
        ? false
        : process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
}

export default fp(securityPlugin);
