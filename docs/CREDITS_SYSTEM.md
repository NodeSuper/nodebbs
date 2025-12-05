  🎯 积分系统完整分析报告

  一、现有系统架构分析

  基于代码探索，当前系统具备以下基础：

  技术栈：
  - 后端：Node.js + Fastify + Drizzle ORM + PostgreSQL
  - 前端：Next.js 14 (App Router) + React
  - 数据库：已有完善的用户、帖子、分类等表结构

  关键优势：
  - ✅ 已有 systemSettings 表，可动态配置系统参数
  - ✅ 已有 invitationRules 表含 pointsCost 字段，说明已预留积分概念
  - ✅ 完善的权限系统（admin/moderator/vip/user）
  - ✅ 已有点赞系统（likes 表）可作为积分触发源
  - ✅ 管理后台设置页面采用 Tabs 模式，易于扩展

  ---
  二、积分系统核心功能设计

  2.1 积分流通模型

  ┌─────────────────────────────────────────┐
  │           积分生态系统                    │
  ├─────────────────────────────────────────┤
  │                                         │
  │  获取途径              消耗途径          │
  │  ├─ 每日签到           ├─ 帖子打赏       │
  │  ├─ 发布话题           ├─ 购买头像框     │
  │  ├─ 发布回复           ├─ 购买勋章       │
  │  ├─ 获得点赞           ├─ 生成邀请码     │
  │  ├─ 邀请新用户         ├─ 置顶话题       │
  │  └─ 管理员发放         └─ 自定义扩展     │
  │                                         │
  └─────────────────────────────────────────┘

  ---
  三、数据库表设计方案

  3.1 核心表结构

  1. 用户积分账户表 (user_credits)
  export const userCredits = pgTable('user_credits', {
    ...$defaults,
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
    balance: integer('balance').notNull().default(0), // 当前余额
    totalEarned: integer('total_earned').notNull().default(0), // 累计获得
    totalSpent: integer('total_spent').notNull().default(0), // 累计消费
    lastCheckInDate: timestamp('last_check_in_date'), // 最后签到日期
    checkInStreak: integer('check_in_streak').notNull().default(0), // 连续签到天数
  }, (table) => [
    index('user_credits_user_idx').on(table.userId),
    index('user_credits_balance_idx').on(table.balance),
  ]);

  2. 积分交易记录表 (credit_transactions)
  export const creditTransactions = pgTable('credit_transactions', {
    ...$defaults,
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(), // 正数=获得，负数=消费
    balance: integer('balance').notNull(), // 交易后余额
    type: varchar('type', { length: 50 }).notNull(), // 交易类型
    // 类型：'check_in', 'post_topic', 'post_reply', 'receive_like', 
    //      'reward_post', 'buy_avatar_frame', 'buy_badge', 'invite_user',
    //      'admin_grant', 'admin_deduct'

    relatedUserId: integer('related_user_id').references(() => users.id), // 关联用户（如打赏对象）
    relatedTopicId: integer('related_topic_id').references(() => topics.id), // 关联话题
    relatedPostId: integer('related_post_id').references(() => posts.id), // 关联帖子
    relatedItemId: integer('related_item_id'), // 关联商品ID（头像框/勋章）

    description: text('description'), // 交易描述
    metadata: text('metadata'), // JSON格式的额外数据
  }, (table) => [
    index('credit_transactions_user_idx').on(table.userId),
    index('credit_transactions_type_idx').on(table.type),
    index('credit_transactions_created_at_idx').on(table.createdAt),
  ]);

  3. 帖子打赏记录表 (post_rewards)
  export const postRewards = pgTable('post_rewards', {
    ...$defaults,
    postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    fromUserId: integer('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    toUserId: integer('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(), // 打赏金额
    message: text('message'), // 打赏留言
  }, (table) => [
    index('post_rewards_post_idx').on(table.postId),
    index('post_rewards_from_user_idx').on(table.fromUserId),
    index('post_rewards_to_user_idx').on(table.toUserId),
  ]);

  4. 商城商品表 (shop_items)
  export const shopItems = pgTable('shop_items', {
    ...$defaults,
    type: varchar('type', { length: 20 }).notNull(), // 'avatar_frame', 'badge', 'custom'
    name: varchar('name', { length: 100 }).notNull(), // 商品名称
    description: text('description'), // 商品描述
    price: integer('price').notNull(), // 价格（积分）
    imageUrl: varchar('image_url', { length: 500 }), // 商品图片
    stock: integer('stock'), // 库存（null=无限）
    isActive: boolean('is_active').notNull().default(true), // 是否上架
    metadata: text('metadata'), // JSON格式的商品数据（如CSS样式）
    displayOrder: integer('display_order').notNull().default(0), // 排序
  }, (table) => [
    index('shop_items_type_idx').on(table.type),
    index('shop_items_is_active_idx').on(table.isActive),
  ]);

  5. 用户商品拥有表 (user_items)
  export const userItems = pgTable('user_items', {
    ...$defaults,
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    itemId: integer('item_id').notNull().references(() => shopItems.id, { onDelete: 'cascade' }),
    isEquipped: boolean('is_equipped').notNull().default(false), // 是否装备中
    expiresAt: timestamp('expires_at'), // 过期时间（null=永久）
  }, (table) => [
    index('user_items_user_idx').on(table.userId),
    index('user_items_item_idx').on(table.itemId),
  ]);

  6. 积分系统配置表 (credit_system_config)
  export const creditSystemConfig = pgTable('credit_system_config', {
    ...$defaults,
    key: varchar('key', { length: 100 }).notNull().unique(),
    // 配置项：
    // - 'system_enabled': 是否启用积分系统
    // - 'check_in_base_amount': 签到基础积分
    // - 'check_in_streak_bonus': 连续签到额外奖励
    // - 'post_topic_amount': 发布话题奖励
    // - 'post_reply_amount': 发布回复奖励
    // - 'receive_like_amount': 获得点赞奖励
    // - 'reward_min_amount': 打赏最小金额
    // - 'reward_max_amount': 打赏最大金额

    value: text('value').notNull(),
    valueType: varchar('value_type', { length: 20 }).notNull(), // 'number', 'boolean'
    description: text('description'),
    category: varchar('category', { length: 50 }).notNull(), // 'earning', 'spending', 'general'
  }, (table) => [
    index('credit_system_config_key_idx').on(table.key),
    index('credit_system_config_category_idx').on(table.category),
  ]);

  ---
  四、API 接口设计

  4.1 积分管理接口 (apps/api/src/routes/credits/index.js)

  // 用户接口
  GET    /api/credits/balance          // 查询当前用户积分余额
  GET    /api/credits/transactions     // 查询积分交易记录
  POST   /api/credits/check-in         // 每日签到
  POST   /api/credits/reward           // 打赏帖子
  GET    /api/credits/rank             // 积分排行榜

  // 商城接口
  GET    /api/shop/items               // 获取商城商品列表
  POST   /api/shop/buy/:itemId         // 购买商品
  GET    /api/shop/my-items            // 查询我的商品
  POST   /api/shop/equip/:itemId       // 装备商品
  POST   /api/shop/unequip/:itemId     // 卸下商品

  // 管理员接口
  GET    /api/admin/credits/stats      // 积分系统统计
  POST   /api/admin/credits/grant      // 发放积分
  POST   /api/admin/credits/deduct     // 扣除积分
  GET    /api/admin/credits/config     // 获取配置
  PUT    /api/admin/credits/config     // 更新配置
  CRUD   /api/admin/shop/items         // 商品管理

  4.2 核心接口实现示例

  签到接口：
  fastify.post('/check-in', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['credits'],
      description: '每日签到获取积分',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            balance: { type: 'number' },
            checkInStreak: { type: 'number' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    // 1. 检查系统是否启用
    // 2. 检查今天是否已签到
    // 3. 计算签到奖励（基础+连续签到奖励）
    // 4. 更新用户积分和签到记录
    // 5. 创建交易记录
    // 6. 返回结果
  });

  打赏接口：
  fastify.post('/reward', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['postId', 'amount'],
        properties: {
          postId: { type: 'number' },
          amount: { type: 'number', minimum: 1 },
          message: { type: 'string', maxLength: 200 }
        }
      }
    }
  }, async (request, reply) => {
    // 1. 验证帖子存在且未删除
    // 2. 验证不能打赏自己
    // 3. 检查打赏金额限制
    // 4. 检查用户余额
    // 5. 扣除打赏者积分
    // 6. 增加作者积分
    // 7. 创建打赏记录和交易记录
    // 8. 发送通知
  });

  ---
  五、前端页面设计

  5.1 用户个人中心 (apps/web/src/app/profile/)

  新增页面：

  1. 积分中心 (/profile/credits/page.js)
  - 积分余额展示（卡片式设计）
  - 签到按钮（显示连续签到天数）
  - 积分历史记录（分页表格）
  - 积分获取/消费统计图表
  - 积分排行榜入口

  2. 商城页面 (/profile/shop/page.js)
  - 商品分类Tab（头像框/勋章/其他）
  - 商品卡片网格布局
  - 商品详情弹窗
  - 购买确认对话框
  - 我的道具页面

  3. 我的道具 (/profile/items/page.js)
  - 已拥有的头像框/勋章列表
  - 装备/卸下按钮
  - 道具预览功能

  5.2 话题/帖子页面增强

  在 apps/web/src/app/topics/[slug]/page.js 中：

  // 每个帖子增加打赏按钮
  <PostCard>
    <PostContent />
    <PostActions>
      <LikeButton />
      <ReplyButton />
      <RewardButton />  {/* 新增 */}
    </PostActions>
    <RewardList />  {/* 显示打赏列表 */}
  </PostCard>

  5.3 用户资料卡片增强

  <UserProfileCard>
    <Avatar>
      {/* 显示装备的头像框 */}
      <AvatarFrame src={user.equippedFrame} />
    </Avatar>
    <Badges>
      {/* 显示装备的勋章 */}
      {user.equippedBadges.map(badge => <Badge key={badge.id} />)}
    </Badges>
    <CreditInfo>
      <CoinIcon /> {user.credits}
    </CreditInfo>
  </UserProfileCard>

  ---
  六、管理后台功能

  在 apps/web/src/app/dashboard/settings/page.js 中新增 Tab：

  6.1 积分系统配置 Tab

  <TabsContent value='credit-system'>
    <Card>
      <CardHeader>
        <CardTitle>积分系统</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 系统开关 */}
        <Switch 
          label="启用积分系统" 
          checked={settings.credit_system_enabled}
        />

        {/* 获取规则配置 */}
        <Section title="获取规则">
          <NumberInput label="签到基础积分" key="check_in_base_amount" />
          <NumberInput label="连续签到奖励" key="check_in_streak_bonus" />
          <NumberInput label="发布话题奖励" key="post_topic_amount" />
          <NumberInput label="发布回复奖励" key="post_reply_amount" />
          <NumberInput label="获得点赞奖励" key="receive_like_amount" />
        </Section>

        {/* 消费规则配置 */}
        <Section title="消费规则">
          <NumberInput label="打赏最小金额" key="reward_min_amount" />
          <NumberInput label="打赏最大金额" key="reward_max_amount" />
        </Section>
      </CardContent>
    </Card>
  </TabsContent>

  6.2 商城管理页面 (/dashboard/shop/page.js)

  <ShopManagement>
    {/* 商品列表 */}
    <DataTable
      columns={['商品名称', '类型', '价格', '库存', '状态', '操作']}
      data={shopItems}
    />

    {/* 新增/编辑商品弹窗 */}
    <ItemDialog>
      <Input label="商品名称" />
      <Select label="商品类型" options={['头像框', '勋章', '自定义']} />
      <NumberInput label="价格" />
      <NumberInput label="库存" placeholder="留空表示无限" />
      <ImageUpload label="商品图片" />
      <TextArea label="商品描述" />
      {type === 'avatar_frame' && <CodeEditor label="CSS样式" />}
    </ItemDialog>
  </ShopManagement>

  6.3 积分管理页面 (/dashboard/credits/page.js)

  <CreditsManagement>
    {/* 统计数据 */}
    <StatsCards>
      <StatCard title="总流通积分" value={totalCirculation} />
      <StatCard title="今日发放" value={todayEarned} />
      <StatCard title="今日消费" value={todaySpent} />
    </StatsCards>

    {/* 用户积分查询 */}
    <UserCreditSearch>
      <Input placeholder="搜索用户" />
      <Button>手动发放积分</Button>
      <Button variant="destructive">扣除积分</Button>
    </UserCreditSearch>

    {/* 交易记录 */}
    <TransactionHistory />
  </CreditsManagement>

  ---
  七、关键业务逻辑

  7.1 积分自动发放触发器

  需要在现有的帖子发布、点赞等接口中集成积分发放逻辑：

  在 apps/api/src/routes/posts/index.js 中：

  // 发布帖子后触发
  fastify.post('/', async (request, reply) => {
    // ... 原有逻辑 ...

    // 积分系统集成
    const { grantCredits } = await import('../../services/creditService.js');
    await grantCredits({
      userId: request.user.id,
      amount: await getCreditConfig('post_reply_amount'),
      type: 'post_reply',
      relatedPostId: newPost.id,
      description: '发布回复奖励'
    });
  });

  在点赞接口中：

  // 点赞后触发
  fastify.post('/:postId/like', async (request, reply) => {
    // ... 原有逻辑 ...

    // 给被点赞者发放积分
    await grantCredits({
      userId: post.userId,
      amount: await getCreditConfig('receive_like_amount'),
      type: 'receive_like',
      relatedUserId: request.user.id,
      relatedPostId: post.id,
      description: '获得点赞奖励'
    });
  });

  7.2 积分服务模块 (apps/api/src/services/creditService.js)

  export async function grantCredits({
    userId, 
    amount, 
    type, 
    relatedUserId = null,
    relatedTopicId = null,
    relatedPostId = null,
    description
  }) {
    // 1. 检查积分系统是否启用
    // 2. 事务处理：更新用户余额 + 创建交易记录
    // 3. 返回结果
  }

  export async function deductCredits({ userId, amount, type, ... }) {
    // 1. 检查余额是否足够
    // 2. 事务处理：扣除余额 + 创建交易记录
    // 3. 返回结果
  }

  export async function transferCredits({ fromUserId, toUserId, amount, type, ... }) {
    // 打赏等场景的转账操作
    // 使用数据库事务确保原子性
  }

  ---
  八、扩展性设计

  8.1 积分类型扩展

  通过在 creditTransactions 表的 type 字段添加新类型即可扩展：

  // 现有类型
  'check_in', 'post_topic', 'post_reply', 'receive_like',
  'reward_post', 'buy_avatar_frame', 'buy_badge', 'admin_grant'

  // 未来可扩展类型
  'daily_quest',        // 每日任务
  'achievement',        // 成就奖励
  'contest_win',        // 比赛获胜
  'subscription',       // 订阅服务
  'vip_upgrade',        // VIP升级
  'topic_featured',     // 话题精选
  'answer_accepted',    // 回答被采纳

  8.2 商品类型扩展

  通过在 shopItems 表的 metadata 字段存储商品特定数据：

  // 头像框商品
  {
    type: 'avatar_frame',
    metadata: {
      cssClass: 'frame-golden',
      borderStyle: 'solid 3px gold',
      animation: 'rotate 2s infinite'
    }
  }

  // 勋章商品
  {
    type: 'badge',
    metadata: {
      icon: 'trophy',
      color: '#FFD700',
      position: 'top-right'
    }
  }

  // 自定义商品（如特殊权限）
  {
    type: 'custom',
    metadata: {
      feature: 'pin_topic',
      duration: 7, // 7天
      maxUses: 3
    }
  }

  ---
  九、实现优先级建议

  Phase 1: 核心基础（1-2周）

  1. ✅ 数据库表迁移
  2. ✅ 用户积分账户创建
  3. ✅ 基础积分服务模块
  4. ✅ 签到功能
  5. ✅ 积分查询接口
  6. ✅ 个人中心积分页面

  Phase 2: 积分流通（1-2周）

  7. ✅ 发帖/回复积分奖励
  8. ✅ 点赞积分奖励
  9. ✅ 帖子打赏功能
  10. ✅ 交易记录查询
  11. ✅ 打赏列表展示

  Phase 3: 商城系统（2-3周）

  12. ✅ 商城商品管理后台
  13. ✅ 商品购买接口
  14. ✅ 商城前端页面
  15. ✅ 头像框/勋章系统
  16. ✅ 我的道具页面

  Phase 4: 管理与优化（1周）

  17. ✅ 管理后台配置页面
  18. ✅ 积分统计报表
  19. ✅ 管理员手动操作
  20. ✅ 积分排行榜

  ---
  十、技术注意事项

  1. 并发安全：积分交易需使用数据库事务确保余额一致性
  await db.transaction(async (tx) => {
    // 更新余额 + 创建记录
  });
  2. 性能优化：
    - 用户积分余额使用 Redis 缓存
    - 交易记录表建立分区（按月份）
    - 排行榜使用 Redis Sorted Set
  3. 防刷机制：
    - 签到检查IP和时间戳
    - 发帖/回复设置获取上限
    - 打赏设置单日限额
  4. 数据一致性：
    - 定期任务校验 balance = totalEarned - totalSpent
    - 异常交易告警
  5. 审计追踪：
    - 所有积分变动必须有对应交易记录
    - 管理员操作记录到 moderationLogs

  ---
  十一、文件结构预览

  project/
  ├── apps/
  │   ├── api/
  │   │   └── src/
  │   │       ├── db/
  │   │       │   └── schema.js              // 新增表定义
  │   │       ├── routes/
  │   │       │   └── credits/
  │   │       │       └── index.js           // 积分接口
  │   │       ├── services/
  │   │       │   └── creditService.js       // 积分服务
  │   │       └── utils/
  │   │           └── creditHelpers.js       // 积分工具函数
  │   └── web/
  │       └── src/
  │           └── app/
  │               ├── profile/
  │               │   ├── credits/
  │               │   │   └── page.js        // 积分中心
  │               │   ├── shop/
  │               │   │   └── page.js        // 商城页面
  │               │   └── items/
  │               │       └── page.js        // 我的道具
  │               └── dashboard/
  │                   ├── credits/
  │                   │   └── page.js        // 积分管理
  │                   └── shop/
  │                       └── page.js        // 商品管理

  ---
  总结

  这个积分系统设计：
  - ✅ 可扩展：通过配置表和类型字段支持灵活扩展
  - ✅ 可追溯：完整的交易记录和审计日志
  - ✅ 易管理：管理后台可视化配置和操作
  - ✅ 高性能：Redis缓存 + 数据库索引优化
  - ✅ 安全可靠：事务保证、防刷机制、权限控制

  完全融合到现有系统架构中，无需大规模重构，可按阶段逐步实现。建议从 Phase 1
  开始，每个阶段完成后进行测试和用户反馈收集，再进入下一阶段。