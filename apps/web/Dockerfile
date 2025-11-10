# 多阶段构建 - Next.js 应用
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
WORKDIR /app

# 复制依赖文件
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# 安装依赖
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
  else echo "无法找到锁文件，使用 npm install" && npm install; \
  fi

# 构建阶段
FROM base AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
# 复制源代码
COPY . .

# 设置环境变量（构建时）
ENV NEXT_TELEMETRY_DISABLED=1

# 构建应用
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm build; \
  else npm run build; \
  fi

# 生产环境运行
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3100

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要的文件
COPY --from=builder /app/public ./public

# 设置正确的权限
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 自动利用 Next.js standalone 输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3100

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3100', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动命令
CMD ["node", "server.js"]
