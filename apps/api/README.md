# API 后台项目

这是一个基于 Fastify + Drizzle + PostgreSQL 的 REST API。

## 开发

1. 启动应用 

```shell
pnpm run dev
```

2. 正式环境

```shell
pnpm run prod
```

### 1. 安全配置

```bash
# 生成强随机密钥
openssl rand -base64 32  # 用于 JWT_SECRET
```