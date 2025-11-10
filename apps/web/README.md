# 技术论坛 - GitHub Issue 风格的讨论社区

一个基于 Next.js + Tailwind CSS + shadcn/ui 构建的现代化论坛系统，采用 GitHub Issue 风格设计，功能类似 Discourse。

## 功能特性

- 🎨 **现代化设计** - 采用 GitHub Issue 风格的清爽界面
- 📱 **响应式布局** - 完美适配桌面端和移动端
- 🏷️ **分类管理** - 支持话题分类和标签系统
- 💬 **讨论功能** - 话题发布、回复、点赞等交互功能
- 🔍 **搜索筛选** - 支持话题搜索和多维度筛选
- 👤 **用户系统** - 用户头像、个人信息展示
- 📊 **统计信息** - 论坛数据统计和活跃度展示

## 技术栈

- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS 4
- **组件库**: shadcn/ui
- **图标**: Lucide React
- **字体**: Geist Sans & Geist Mono

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── categories/[id]/     # 分类页面
│   ├── topic/[id]/        # 话题详情页
│   ├── create/            # 发布话题页
│   ├── layout.js          # 根布局
│   ├── page.js            # 首页
│   └── not-found.js       # 404 页面
├── components/
│   ├── forum/             # 论坛相关组件
│   │   ├── Header.jsx     # 顶部导航
│   │   ├── Sidebar.jsx    # 侧边栏
│   │   └── TopicCard.jsx  # 话题卡片
│   └── ui/                # shadcn/ui 组件
└── lib/
    ├── mock-data.js       # 模拟数据
    └── utils.js           # 工具函数
```

## 快速开始

1. **安装依赖**
```bash
pnpm i
```

2. **启动开发服务器**
```bash
pnpm run dev
```

3. **访问应用**
打开浏览器访问 [http://localhost:3100](http://localhost:3100)

## 页面说明

### 首页 (/)
- 显示所有话题列表
- 支持分类筛选和排序
- 侧边栏显示分类和统计信息

### 话题详情 (/topic/[id])
- 显示话题完整内容
- 展示所有回复
- 支持点赞、分享、举报等操作

### 发布话题 (/create)
- 话题标题和内容编辑
- 分类选择
- 标签添加

### 分类页面 (/categories/[id])
- 显示特定分类下的话题
- 分类统计信息

### 所有分类页面 (/categories)
- 显示所有分类的概览
- 网格和列表两种视图模式
- 每个分类的详细统计信息

## 数据结构

项目使用 Mock 数据模拟真实的论坛数据，包括：

- **用户数据**: 用户名、头像、邮箱等
- **分类数据**: 分类名称、颜色标识
- **话题数据**: 标题、内容、作者、分类、标签、统计信息
- **回复数据**: 回复内容、作者、时间

## 自定义配置

### 添加新分类
在 `src/lib/mock-data.js` 中的 `categories` 数组添加新分类：

```javascript
{
  id: 6,
  name: "新分类",
  color: "bg-indigo-100 text-indigo-800"
}
```

### 修改主题色彩
在 `src/app/globals.css` 中修改 CSS 变量来自定义主题色彩。

## 部署

### Vercel 部署
1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 自动部署完成

### 其他平台
```bash
npm run build
npm start
```

## 开发计划

- [ ] 用户认证系统
- [ ] 实时通知功能
- [ ] 富文本编辑器
- [ ] 文件上传功能
- [ ] 搜索功能优化
- [ ] 数据持久化
- [ ] API 接口开发

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 许可证

MIT License