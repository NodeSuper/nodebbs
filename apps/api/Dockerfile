# 多阶段构建 - API 服务
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
WORKDIR /app

# 复制依赖文件
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# 安装依赖
# RUN \
#   if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
#   elif [ -f package-lock.json ]; then npm ci; \
#   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
#   else echo "无法找到锁文件，使用 npm install" && npm install; \
#   fi

# 直接使用 pnpm 安装依赖
RUN corepack enable pnpm \
    && pnpm install --no-frozen-lockfile --network-concurrency=1

# 生产环境构建
FROM base AS runner
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=7100

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# 复制依赖
COPY --from=deps --chown=fastify:nodejs /app/node_modules ./node_modules

# 复制应用代码
COPY --chown=fastify:nodejs . .

# 创建上传目录
RUN mkdir -p /app/uploads && chown -R fastify:nodejs /app/uploads

# 切换到非 root 用户
USER fastify

# 暴露端口
EXPOSE 7100

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:7100/api', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动命令
CMD ["node", "src/app.js"]
