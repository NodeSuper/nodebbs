# 技术论坛 - GitHub Issue 风格的讨论社区

## 项目技术栈

- **框架**: Next.js 16 (App Router + Turbopack)
- **样式**: Tailwind CSS 4
- **组件库**: shadcn/ui (基于 Radix UI)
- **图标**: Lucide React
- **表单**: React Hook Form
- **Markdown**: React Markdown + Remark GFM
- **主题**: Next Themes
- **提示**: Sonner
- **UI 工具**: class-variance-authority, clsx, tailwind-merge
- **日期处理**: Day.js

## 开发

1. **安装依赖**
```bash
pnpm install
```

2. **配置环境变量**
```bash
# 在 .env.local 文件中配置 API 地址等信息
```

3. **启动开发服务器**
```bash
pnpm run dev
```

4. **访问应用**
打开浏览器访问 [http://localhost:3100](http://localhost:3100)

## 部署

### Vercel 部署（推荐）
1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署完成

### PM2 部署
1. **构建生产版本**
```bash
pnpm run build
```

2. **配置生产环境变量**
```bash
# 在 .env 文件中配置
```

3. **启动生产环境**
```bash
pnpm run prod
```

使用 PM2 进行进程管理，配置文件：`ecosystem.config.cjs`
