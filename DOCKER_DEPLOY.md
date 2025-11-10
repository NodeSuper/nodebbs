# NodeBBS Docker 部署指南

完整的 Docker 容器化部署文档，包含快速开始、详细配置、故障排查等内容。

## 📋 目录

- [项目结构](#项目结构)
- [系统架构](#系统架构)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [常用命令](#常用命令)
- [数据库操作](#数据库操作)
- [生产环境部署](#生产环境部署)
- [数据持久化与备份](#数据持久化与备份)
- [监控与日志](#监控与日志)
- [故障排查](#故障排查)
- [性能优化](#性能优化)

## 📂 项目结构

### 当前目录结构

```
nodebbs/
├── apps/
│   ├── api/                     # API 服务目录
│   │   ├── Dockerfile           # API Docker 构建文件 ✅
│   │   ├── .dockerignore        # API Docker 忽略文件 ✅
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── src/
│   │       ├── routes/          # API 路由
│   │       ├── plugins/         # Fastify 插件
│   │       ├── db/              # 数据库模式
│   │       └── utils/           # 工具函数
│   └── web/                     # Web 前端目录
│       ├── Dockerfile           # Web Docker 构建文件 ✅
│       ├── .dockerignore        # Web Docker 忽略文件 ✅
│       ├── package.json
│       ├── .env.example
│       └── app/                 # Next.js App Router
├── scripts/
│   └── init-db.sql              # 数据库初始化脚本
├── docker-compose.yml           # Docker Compose 配置（开发/测试）
├── docker-compose.prod.yml      # Docker Compose 配置（生产）
├── .env.docker.example          # 环境变量示例
├── .env                         # 环境变量配置（需要创建）
├── Makefile                     # 简化命令工具
├── deploy.sh                    # 自动部署脚本
├── nginx.conf.example           # Nginx 配置示例
└── DOCKER_DEPLOY.md             # 本文档
```

### 为什么 Dockerfile 放在各服务根目录？

这是 Docker 官方推荐的最佳实践，原因如下：

#### 1. `.dockerignore` 必须在构建上下文根目录

Docker 只在构建上下文的根目录查找 `.dockerignore` 文件：

```bash
# ❌ 错误：.dockerignore 不会生效
docker build -t test ./apps/api -f docker/api/Dockerfile

# ✅ 正确：.dockerignore 正确生效
docker build -t test ./apps/api
```

#### 2. 路径更简洁清晰

```yaml
# docker-compose.yml
services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile        # ✅ 简洁明了
      # dockerfile: ../docker/api/Dockerfile  # ❌ 复杂的相对路径
```

#### 3. 符合 Monorepo 微服务架构标准

每个服务独立管理自己的容器化配置，便于：
- 独立构建和部署
- 版本控制更清晰
- 团队协作更方便
- CI/CD 集成更简单

## 🏗️ 系统架构

本项目采用 Docker Compose 部署，包含以下服务：

```
┌─────────────────────────────┐
│    Nginx (生产环境)          │
│  SSL/HTTPS + 反向代理        │
└─────────────┬───────────────┘
              │
      ┌───────┴────────┐
      │                │
┌─────▼─────┐    ┌────▼────┐
│    Web    │────▶│   API   │
│   :3100   │    │  :7100  │
└───────────┘    └──┬───┬──┘
                    │   │
          ┌─────────┘   └─────────┐
          │                       │
    ┌─────▼──────┐         ┌─────▼─────┐
    │ PostgreSQL │         │   Redis   │
    │   :5432    │         │   :6379   │
    └────────────┘         └───────────┘
```

| 服务 | 技术栈 | 端口 | 说明 |
|------|--------|------|------|
| **postgres** | PostgreSQL 16 | 5432 | 主数据库 |
| **redis** | Redis 7 | 6379 | 缓存服务 |
| **api** | Fastify + Drizzle | 7100 | API 服务 |
| **web** | Next.js 15 | 3100 | 前端应用 |

### 服务依赖关系

```
web (3100) → api (7100) → postgres (5432)
                       → redis (6379)
```

健康检查配置：
- **PostgreSQL**: `pg_isready` (10s 间隔)
- **Redis**: `redis-cli ping` (10s 间隔)
- **API**: HTTP 检查 `/api` (30s 间隔)
- **Web**: HTTP 检查 `/` (30s 间隔)

## 🚀 快速开始

### 前置要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- Make (可选，用于简化命令)

### 方式一：自动部署脚本（推荐）⭐

使用自动化脚本，一键完成所有部署步骤：

```bash
# 运行自动部署脚本
./deploy.sh
```

脚本会自动执行：
1. ✅ 检查 Docker 环境
2. ✅ 初始化 `.env` 文件
3. ✅ 验证配置安全性
4. ✅ 构建 Docker 镜像
5. ✅ 启动所有服务
6. ✅ 等待服务健康
7. ✅ 初始化数据库

**优点**：
- 自动化程度高，适合新手
- 包含配置验证和安全检查
- 交互式引导，减少错误

### 方式二：使用 Makefile

使用 Makefile 提供的便捷命令：

```bash
# 1. 初始化环境
make init

# 2. 编辑 .env 文件（重要！）
vi .env

# 3. 启动服务
make up

# 4. 初始化数据库
make db-push
make seed

# 5. 查看日志
make logs

# 6. 检查健康状态
make health
```

**优点**：
- 命令简洁，易于记忆
- 适合日常开发和运维
- 支持更多操作选项

### 方式三：使用 Docker Compose

直接使用 Docker Compose 命令：

```bash
# 1. 复制环境变量文件
cp .env.docker.example .env

# 2. 修改 .env 配置
vi .env

# 3. 启动服务
docker compose up -d

# 4. 初始化数据库
docker compose exec api npm run db:push:dev
docker compose exec api npm run seed

# 5. 查看状态
docker compose ps
```

**优点**：
- 完全控制，适合高级用户
- 标准 Docker 命令，可移植性强

### 验证部署成功

部署完成后，访问以下地址验证：

- **Web 前端**: http://localhost:3100
- **API 文档**: http://localhost:7100/docs
- **健康检查**: http://localhost:7100/api

```bash
# 或使用命令检查
make health
curl http://localhost:7100/api
```

## ⚙️ 环境配置

### 初始化配置文件

```bash
# 复制环境变量模板
cp .env.docker.example .env

# 或使用 Makefile
make init
```

### 必须修改的配置项 ⚠️

编辑 `.env` 文件，**务必修改**以下配置：

```env
# 数据库密码（必改！）
POSTGRES_PASSWORD=your_secure_postgres_password_here

# Redis 密码（必改！）
REDIS_PASSWORD=your_secure_redis_password_here

# JWT 密钥（必改！使用下面的命令生成）
JWT_SECRET=change-this-to-a-secure-random-string-in-production

# 生产环境需要修改的 URL
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
APP_URL=https://yourdomain.com
```

### 生成安全密钥

```bash
# 生成 JWT 密钥
openssl rand -base64 32

# 生成强密码
openssl rand -base64 24
```

### 完整环境变量说明

#### 数据库配置

```env
POSTGRES_USER=postgres              # PostgreSQL 用户名
POSTGRES_PASSWORD=postgres_password # PostgreSQL 密码（必改）
POSTGRES_DB=nodebbs                # 数据库名称
POSTGRES_PORT=5432                 # 数据库端口
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
```

#### Redis 配置

```env
REDIS_HOST=redis                   # Redis 主机名（容器内使用）
REDIS_PASSWORD=redis_password      # Redis 密码（必改）
REDIS_PORT=6379                    # Redis 端口
```

#### API 配置

```env
API_PORT=7100                      # API 服务端口
USER_CACHE_TTL=120                 # 用户缓存 TTL（秒）
JWT_SECRET=your_secret             # JWT 密钥（必改）
JWT_ACCESS_TOKEN_EXPIRES_IN=1y     # Token 过期时间
CORS_ORIGIN=*                      # CORS 配置（生产环境设置具体域名）
APP_URL=http://localhost:3100      # 应用 URL
```

#### Web 配置

```env
WEB_PORT=3100                      # Web 服务端口
NEXT_PUBLIC_API_URL=http://localhost:7100   # API 地址
NEXT_PUBLIC_APP_URL=http://localhost:3100   # 应用地址
```

#### OAuth 配置（可选）

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

#### 邮件配置（可选）

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

## 📝 常用命令

### 使用 Makefile（推荐）

查看所有可用命令：
```bash
make help
```

#### 容器管理

```bash
make up                # 启动所有服务
make down              # 停止所有服务
make restart           # 重启所有服务
make build             # 重新构建镜像（不使用缓存）
make rebuild           # 重新构建并启动
make ps                # 查看容器状态
make health            # 检查服务健康状态
```

#### 日志管理

```bash
make logs              # 查看所有服务日志
make logs-api          # 查看 API 日志
make logs-web          # 查看 Web 日志
make logs-db           # 查看数据库日志
make logs-redis        # 查看 Redis 日志
```

#### 容器访问

```bash
make exec-api          # 进入 API 容器
make exec-web          # 进入 Web 容器
make exec-db           # 进入数据库（psql）
make exec-redis        # 进入 Redis（redis-cli）
```

#### 清理

```bash
make clean             # 停止并删除所有容器、网络
make clean-all         # 删除所有内容包括数据卷（危险！）
```

### 使用 Docker Compose

#### 基本操作

```bash
# 启动所有服务
docker compose up -d

# 停止所有服务
docker compose down

# 查看日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f api
docker compose logs -f web

# 重启服务
docker compose restart

# 重新构建镜像
docker compose build --no-cache

# 查看服务状态
docker compose ps
```

#### 高级操作

```bash
# 仅启动特定服务
docker compose up -d postgres redis

# 重启单个服务
docker compose restart api

# 查看服务资源使用
docker compose stats

# 清理未使用的资源
docker compose down --volumes --remove-orphans
```

## 🗄️ 数据库操作

### 使用 Makefile

```bash
# 推送数据库 schema（开发环境）
make db-push

# 推送数据库 schema（生产环境）
make db-push-prod

# 生成数据库迁移文件
make db-generate

# 执行数据库迁移
make db-migrate

# 打开 Drizzle Studio（数据库管理界面）
make db-studio

# 初始化种子数据
make seed

# 重置并重新初始化数据（危险！）
make seed-reset
```

### 使用 Docker Compose

```bash
# 推送 schema
docker compose exec api npm run db:push:dev

# 生成迁移
docker compose exec api npm run db:generate

# 执行迁移
docker compose exec api npm run db:migrate

# 初始化数据
docker compose exec api npm run seed

# 列出可用的 seed 命令
docker compose exec api npm run seed:list

# 重置数据
docker compose exec api npm run seed:reset
```

### 直接访问数据库

```bash
# 使用 Makefile
make exec-db

# 使用 Docker Compose
docker compose exec postgres psql -U postgres -d nodebbs

# 在 psql 中常用命令
\dt              # 列出所有表
\d table_name    # 查看表结构
\l               # 列出所有数据库
\du              # 列出所有用户
\q               # 退出
```

## 🚀 生产环境部署

### 1. 准备服务器环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo apt install docker-compose-plugin -y

# 验证安装
docker --version
docker compose version
```

### 2. 配置环境变量

```bash
# 克隆仓库
git clone <repository-url>
cd nodebbs

# 复制环境变量文件
cp .env.docker.example .env

# 编辑生产环境配置
vi .env
```

生产环境 `.env` 配置示例：

```env
# 数据库（使用强密码）
POSTGRES_PASSWORD=StrongPassword123!@#
POSTGRES_DB=nodebbs_prod
POSTGRES_PORT=5432

# Redis（使用强密码）
REDIS_PASSWORD=StrongRedisPassword456!@#
REDIS_PORT=6379

# API
API_PORT=7100
USER_CACHE_TTL=300
JWT_SECRET=your-generated-secure-jwt-secret-here
JWT_ACCESS_TOKEN_EXPIRES_IN=30d
CORS_ORIGIN=https://yourdomain.com
APP_URL=https://yourdomain.com

# Web
WEB_PORT=3100
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. 配置 Nginx 反向代理

复制并修改 Nginx 配置：

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/nodebbs
sudo vi /etc/nginx/sites-available/nodebbs
```

Nginx 配置示例（`nginx.conf.example`）：

```nginx
# API 服务
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:7100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Web 应用
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name api.yourdomain.com yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/nodebbs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. 使用 Let's Encrypt 配置 SSL

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

### 5. 部署应用

```bash
# 使用部署脚本（推荐）
./deploy.sh

# 或使用生产环境配置手动部署
docker compose -f docker-compose.prod.yml up -d

# 初始化数据库
make db-push
make seed

# 查看日志
make logs
```

### 6. 配置防火墙

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 允许 SSH（如果还未配置）
sudo ufw allow 22/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### 7. 设置自动启动

```bash
# Docker 服务自动启动
sudo systemctl enable docker

# 配置容器自动重启（已在 docker-compose.yml 中配置）
# restart: unless-stopped
```

## 💾 数据持久化与备份

### 数据卷说明

Docker Compose 使用以下数据卷：

```yaml
volumes:
  postgres_data:    # PostgreSQL 数据
  redis_data:       # Redis 数据
  api_uploads:      # API 上传文件
```

查看数据卷：

```bash
# 查看所有数据卷
docker volume ls | grep nodebbs

# 查看数据卷详情
docker volume inspect nodebbs_postgres_data

# 查看数据卷使用情况
docker system df -v
```

### 数据库备份

#### 手动备份

```bash
# 备份数据库
docker compose exec postgres pg_dump -U postgres nodebbs > backup_$(date +%Y%m%d_%H%M%S).sql

# 压缩备份
docker compose exec postgres pg_dump -U postgres nodebbs | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# 恢复数据库
docker compose exec -T postgres psql -U postgres nodebbs < backup_20241110_120000.sql

# 恢复压缩备份
gunzip < backup_20241110_120000.sql.gz | docker compose exec -T postgres psql -U postgres nodebbs
```

#### 自动备份脚本

创建 `scripts/backup.sh`：

```bash
#!/bin/bash
# 数据库自动备份脚本

# 配置
BACKUP_DIR="/var/backups/nodebbs"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份数据库
echo "开始备份数据库..."
docker compose exec postgres pg_dump -U postgres nodebbs | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# 备份上传文件
echo "开始备份上传文件..."
docker run --rm \
  -v nodebbs_api_uploads:/uploads \
  -v "$BACKUP_DIR:/backup" \
  alpine tar czf "/backup/uploads_$DATE.tar.gz" /uploads

# 删除旧备份
echo "清理旧备份..."
find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete

echo "备份完成: $DATE"
echo "数据库: $BACKUP_DIR/db_$DATE.sql.gz"
echo "上传文件: $BACKUP_DIR/uploads_$DATE.tar.gz"
```

添加到 crontab：

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /path/to/nodebbs/scripts/backup.sh >> /var/log/nodebbs-backup.log 2>&1
```

### 恢复数据

```bash
# 1. 停止服务
docker compose down

# 2. 恢复数据库
gunzip < backup_20241110_120000.sql.gz | docker compose exec -T postgres psql -U postgres nodebbs

# 3. 恢复上传文件
docker run --rm \
  -v nodebbs_api_uploads:/uploads \
  -v "/path/to/backups:/backup" \
  alpine tar xzf /backup/uploads_20241110_120000.tar.gz -C /

# 4. 重启服务
docker compose up -d
```

## 📊 监控与日志

### 查看日志

```bash
# 实时查看所有日志
make logs
docker compose logs -f

# 查看特定服务日志
make logs-api
docker compose logs -f api

# 查看最近 100 行日志
docker compose logs --tail=100 api

# 查看特定时间段日志
docker compose logs --since 2024-11-10T10:00:00 --until 2024-11-10T12:00:00 api
```

### 日志管理配置

在 `docker-compose.yml` 中配置日志限制：

```yaml
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 监控服务健康

```bash
# 查看服务状态
make health
docker compose ps

# 查看资源使用
docker compose stats

# 检查特定服务健康
docker inspect --format='{{.State.Health.Status}}' nodebbs-api-1
```

### 推荐监控工具

#### Prometheus + Grafana

创建 `docker-compose.monitor.yml`：

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  prometheus_data:
  grafana_data:
```

## 🔍 故障排查

### 1. 服务无法启动

#### 检查步骤

```bash
# 查看服务状态
docker compose ps

# 查看服务日志
docker compose logs -f [service_name]

# 检查容器详情
docker inspect nodebbs-api-1

# 检查端口占用
sudo lsof -i :7100
sudo lsof -i :3100
```

#### 常见问题

**端口被占用**：
```bash
# 查找占用端口的进程
sudo lsof -i :7100
sudo kill -9 <PID>

# 或修改 .env 中的端口配置
```

**内存不足**：
```bash
# 检查系统资源
docker system df
free -h

# 清理未使用的资源
docker system prune -a
```

### 2. 数据库连接失败

```bash
# 检查数据库是否健康
docker compose ps postgres
docker compose logs postgres

# 测试数据库连接
docker compose exec postgres pg_isready -U postgres

# 进入数据库检查
make exec-db
# 或
docker compose exec postgres psql -U postgres -d nodebbs

# 检查连接字符串
docker compose exec api env | grep DATABASE_URL
```

**常见问题**：
- 检查 `.env` 中的密码是否正确
- 确认数据库已完全启动（查看健康状态）
- 检查网络连接

### 3. Redis 连接失败

```bash
# 检查 Redis 状态
docker compose ps redis
docker compose logs redis

# 测试 Redis 连接
docker compose exec redis redis-cli ping

# 使用密码连接
docker compose exec redis redis-cli -a your_redis_password ping

# 检查 Redis 配置
docker compose exec redis redis-cli -a your_redis_password CONFIG GET requirepass
```

### 4. API 服务错误

```bash
# 查看 API 日志
make logs-api
docker compose logs -f api

# 进入 API 容器调试
make exec-api
# 检查环境变量
env | grep -E "DATABASE|REDIS|JWT"

# 检查 API 健康
curl http://localhost:7100/api
```

**常见问题**：
- JWT_SECRET 未设置或格式错误
- 数据库连接字符串错误
- Redis 连接失败
- 端口冲突

### 5. Web 构建失败

```bash
# 查看 Web 日志
make logs-web
docker compose logs -f web

# 重新构建 Web 镜像
docker compose build --no-cache web

# 检查环境变量
docker compose exec web env | grep NEXT_PUBLIC
```

**常见问题**：
- `NEXT_PUBLIC_API_URL` 未正确设置
- 构建过程中网络问题
- 内存不足

### 6. 网络问题

```bash
# 检查 Docker 网络
docker network ls
docker network inspect nodebbs_nodebbs-network

# 测试容器间网络连通性
docker compose exec web ping api
docker compose exec api ping postgres

# 重建网络
docker compose down
docker compose up -d
```

### 7. 数据卷问题

```bash
# 查看数据卷
docker volume ls
docker volume inspect nodebbs_postgres_data

# 清理未使用的数据卷（危险！）
docker volume prune

# 完全重置（删除所有数据）
docker compose down -v
docker compose up -d
```

## ⚡ 性能优化

### 1. Docker 资源限制

在 `docker-compose.yml` 中配置资源限制：

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M

  web:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.25'
          memory: 256M

  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### 2. PostgreSQL 优化

编辑 PostgreSQL 配置（创建 `postgres.conf`）：

```conf
# 内存配置
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB

# 连接配置
max_connections = 100

# WAL 配置
wal_buffers = 16MB
checkpoint_completion_target = 0.9
```

在 docker-compose.yml 中挂载：

```yaml
postgres:
  volumes:
    - ./postgres.conf:/etc/postgresql/postgresql.conf
  command: postgres -c config_file=/etc/postgresql/postgresql.conf
```

### 3. Redis 优化

```yaml
redis:
  command: >
    redis-server
    --maxmemory 512mb
    --maxmemory-policy allkeys-lru
    --save 60 1000
```

### 4. Next.js 优化

确保生产构建使用优化选项：

```dockerfile
# web/Dockerfile
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 使用 standalone 输出
RUN npm run build
```

### 5. Nginx 缓存优化

```nginx
# 添加缓存配置
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 60m;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    add_header X-Cache-Status $upstream_cache_status;

    proxy_pass http://localhost:3100;
}
```

## 🔄 更新与维护

### 应用更新

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建镜像
docker compose build api web

# 3. 滚动更新（零停机）
docker compose up -d --no-deps --build api
docker compose up -d --no-deps --build web

# 4. 检查日志
make logs
```

### 数据库迁移

```bash
# 1. 生成迁移文件
make db-generate

# 2. 查看迁移 SQL
cat migrations/xxxx_migration.sql

# 3. 执行迁移
make db-migrate

# 4. 验证
make exec-db
\dt
```

### 系统维护

```bash
# 清理未使用的镜像
docker image prune -a

# 清理所有未使用资源
docker system prune -a --volumes

# 查看磁盘使用
docker system df
```

## 📚 参考资料

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Fastify 文档](https://fastify.dev/)
- [Next.js 文档](https://nextjs.org/docs)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Redis 文档](https://redis.io/docs/)
- [Nginx 文档](https://nginx.org/en/docs/)

## 🐛 获取帮助

遇到问题时，请提供以下信息：

1. **环境信息**
   ```bash
   docker version
   docker compose version
   uname -a
   ```

2. **服务状态**
   ```bash
   docker compose ps
   make health
   ```

3. **服务日志**
   ```bash
   docker compose logs --tail=100
   ```

4. **配置文件**（注意隐藏敏感信息）
   ```bash
   cat .env | sed 's/PASSWORD=.*/PASSWORD=***hidden***/g'
   ```

在 GitHub 上提交 issue 或查看现有文档以获取更多帮助。

---

**文档版本**: 2.0
**最后更新**: 2024-11-10
**维护者**: NodeBBS Team
