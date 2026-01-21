# NodeBBS API RESTful 重构计划文档

**生成日期**: 2026-01-21  
**目标**: 将 API 路由重构为符合 RESTful 规范的统一资源路径架构

---

## 📋 目录

1. [项目背景](#项目背景)
2. [四大规范说明](#四大规范说明)
3. [当前状态分析](#当前状态分析)
4. [路由映射对照表](#路由映射对照表)
5. [详细变更方案](#详细变更方案)
6. [实施步骤](#实施步骤)
7. [风险与缓解](#风险与缓解)
8. [验收标准](#验收标准)

---

## 项目背景

### 现状问题

NodeBBS 项目当前在 API 设计中存在以下问题：

1. **资源路径重复**: 同一资源有公共和管理员两套端点（如 `GET /api/shop/items` 和 `GET /api/shop/admin/items`）
2. **URL 暴露角色信息**: 通过 `/admin` 前缀将角色信息暴露在 URL 中，不符合 RESTful 最佳实践
3. **管理操作与资源管理混在一起**: 部分 CRUD 操作使用了 `/admin` 前缀，而有些纯管理操作没有明确区分

### 业界最佳实践参考

根据对 Google API、Spring Security、NestJS、Symfony API Platform 等业界标准的研究：

- **Google Workspace API**: 使用 `?showDeleted=true` 参数而非独立端点
- **Spring Security**: 同一 URL 不同 HTTP 方法配置不同权限
- **NestJS**: 使用 `@UseGuards(RolesGuard)` + `@Roles()` 在同一端点进行角色检查
- **SQLPad**: 根据 `req.user.role` 返回不同 DTO 结构

---

## 四大规范说明

### 规范一：同路径，异视图

**原则**: 不要拆分 `GET /api/users` 和 `GET /api/admin/users`，使用同一个路径，内部根据角色返回不同数据

**实现方式**:
```javascript
// 在 Controller 内部，根据 request.user.role 决定 DTO 的形状
if (request.user.role === 'admin') {
  // 返回 AdminUserDTO (包含 email, IP, 封禁记录)
  return { ...user, email, ipAddress, banHistory };
} else {
  // 返回 PublicUserDTO (无 email, 无 IP)
  return { id, username, name, avatar, role };
}
```

### 规范二：Query 参数切换管理模式

**原则**: 不要建立 `/api/admin/topics/deleted` 这样的路由，使用 `GET /api/topics?include_deleted=true`

**实现方式**:
```javascript
// 请求 GET /api/topics?include_deleted=true
// 鉴权逻辑：普通用户传此参数时，忽略该参数或返回 403
if (request.query.include_deleted && request.user?.role !== 'admin') {
  return reply.code(403).send({ error: 'Forbidden' });
}

const includeInactive = request.user?.role === 'admin' && request.query.include_deleted === 'true';
```

### 规范三：HTTP 方法级权限控制

**原则**: 复用 `/api/shop/items` 资源路径，不同 HTTP 方法有不同权限

**实现方式**:
```javascript
// GET /api/shop/items: Public (所有人可见上架商品)
// POST /api/shop/items: Admin Only (创建商品)
// PATCH /api/shop/items/:id: Admin Only (修改价格/库存)
// DELETE /api/shop/items/:id: Admin Only (下架)
```

### 规范四：仅"纯管理资源"使用 /admin 前缀

**原则**: 只保留无法映射到公共资源概念的管理操作

**保留的 /admin 端点**:
- `/api/admin/dashboard/stats` - 管理面板统计
- `/api/admin/system/logs` - 系统日志
- `/api/admin/system/settings` - 系统设置
- `/api/badges/admin/grant` - 授予勋章（管理动作）
- `/api/badges/admin/revoke` - 撤销勋章（管理动作）
- `/api/rewards/admin/grant` - 发放积分（管理动作）
- `/api/rewards/admin/deduct` - 扣除积分（管理动作）
- `/api/ledger/admin/operation` - 货币操作（管理动作）

---

## 当前状态分析

### Extensions 中的 /admin 路由统计

| 扩展 | /admin 路由数量 | 需要重构 | 保留 |
|------|----------------|-----------|------|
| **Ads** | 10 (slots + ads) | ✅ 10 | 0 |
| **Badges** | 6 | ✅ 4 (CRUD) | 2 (grant/revoke) |
| **Shop** | 4 | ✅ 4 | 0 |
| **Rewards** | 2 | 0 | 2 (grant/deduct) |
| **Ledger** | 1 | 0 | 1 (operation) |
| **总计** | 23 | **18** | **5** |

### 前端 API 调用统计

| 扩展 | 涉及文件 | /admin 调用次数 |
|------|----------|---------------|
| **Ads** | `api/index.js`, `AdminAdsPage.jsx` | 8 |
| **Badges** | `api/index.js`, `AdminBadgesPage.jsx`, `BadgeAssignmentDialog.jsx` | 6 |
| **Shop** | `api/index.js`, `AdminShopPage.jsx` | 4 |
| **Ledger** | `api/index.js`, `LedgerCurrencies.jsx` | 2 |
| **总计** | 8 | **20** |

---

## 路由映射对照表

### Ads (广告系统)

| 当前路由 | 方法 | 新路由 | 使用的规范 |
|---------|------|--------|-----------|
| `/ads/admin/slots` | GET | `/ads/slots` | 规范二 |
| `/ads/admin/slots` | POST | `/ads/slots` | 规范三 |
| `/ads/admin/slots/:id` | GET | `/ads/slots/:id` | 规范一 |
| `/ads/admin/slots/:id` | PATCH | `/ads/slots/:id` | 规范三 |
| `/ads/admin/slots/:id` | DELETE | `/ads/slots/:id` | 规范三 |
| `/ads/admin/ads` | GET | `/ads?include_inactive=true` | 规范二 |
| `/ads/admin/ads` | POST | `/ads` | 规范三 |
| `/ads/admin/ads/:id` | GET | `/ads/:id` | 规范一 |
| `/ads/admin/ads/:id` | PATCH | `/ads/:id` | 规范三 |
| `/ads/admin/ads/:id` | DELETE | `/ads/:id` | 规范三 |

### Badges (勋章系统)

| 当前路由 | 方法 | 新路由 | 使用的规范 |
|---------|------|--------|-----------|
| `/badges/admin` | GET | `/badges?include_inactive=true` | 规范二 |
| `/badges/admin` | POST | `/badges` | 规范三 |
| `/badges/admin/:id` | PATCH | `/badges/:id` | 规范三 |
| `/badges/admin/:id` | DELETE | `/badges/:id` | 规范三 |
| `/badges/admin/grant` | POST | (保留) `/badges/admin/grant` | 规范四 |
| `/badges/admin/revoke` | POST | (保留) `/badges/admin/revoke` | 规范四 |

### Shop (商城系统)

| 当前路由 | 方法 | 新路由 | 使用的规范 |
|---------|------|--------|-----------|
| `/shop/admin/items` | GET | `/shop/items?include_inactive=true` | 规范二 |
| `/shop/admin/items` | POST | `/shop/items` | 规范三 |
| `/shop/admin/items/:itemId` | PATCH | `/shop/items/:itemId` | 规范三 |
| `/shop/admin/items/:itemId` | DELETE | `/shop/items/:itemId` | 规范三 |

### Ledger (账本系统)

| 当前路由 | 方法 | 新路由 | 使用的规范 |
|---------|------|--------|-----------|
| `/ledger/currencies` | GET | `/ledger/currencies` | 规范三 (GET 公开) |
| `/ledger/currencies` | POST | `/ledger/currencies` | 规范三 |
| `/ledger/admin/operation` | POST | (保留) `/ledger/admin/operation` | 规范四 |

### Rewards (奖励系统)

| 当前路由 | 方法 | 新路由 | 使用的规范 |
|---------|------|--------|-----------|
| `/rewards/admin/grant` | POST | (保留) `/rewards/admin/grant` | 规范四 |
| `/rewards/admin/deduct` | POST | (保留) `/rewards/admin/deduct` | 规范四 |

---

## 详细变更方案

### 1. Ads 扩展重构

#### 1.1 后端路由 (`apps/api/src/extensions/ads/routes/index.js`)

**变更前:**
```javascript
// 获取所有广告位（管理员）
fastify.get('/admin/slots', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: { tags: ['ads', 'admin'] }
}, async (request, reply) => {
  const slots = await getAdSlots({ includeInactive: true });
  return slots;
});
```

**变更后:**
```javascript
// 获取广告位列表（规范二：Query 参数切换管理模式）
fastify.get('/slots', {
  schema: { tags: ['ads'] }
}, async (request, reply) => {
  const { include_inactive } = request.query;
  
  // 非管理员忽略 include_inactive 参数
  const isAdmin = request.user?.role === 'admin';
  const includeInactive = isAdmin && include_inactive === 'true';
  
  const slots = await getAdSlots({ includeInactive });
  return slots;
});

// 获取单个广告位（规范一：同路径异视图）
fastify.get('/slots/:id', {
  schema: { tags: ['ads'] }
}, async (request, reply) => {
  const { id } = request.params;
  const isAdmin = request.user?.role === 'admin';
  
  const slot = await getAdSlotById(id, { includeInactive: isAdmin });
  if (!slot) {
    return reply.code(404).send({ error: '广告位不存在' });
  }
  
  // 管理员返回完整信息，普通用户返回基本信息
  if (!isAdmin) {
    const { isActive, displayOrder, maxAds, ...publicSlot } = slot;
    return publicSlot;
  }
  
  return slot;
});

// 创建广告位（规范三：HTTP 方法级权限控制）
fastify.post('/slots', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: {
    tags: ['ads', 'admin'],
    description: '创建广告位',
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      required: ['name', 'code'],
      properties: {
        name: { type: 'string', maxLength: 100 },
        code: { type: 'string', maxLength: 50 },
        description: { type: 'string' },
        width: { type: 'integer', minimum: 0 },
        height: { type: 'integer', minimum: 0 },
        maxAds: { type: 'integer', minimum: 1, default: 1 },
        isActive: { type: 'boolean' },
      },
    },
  },
}, async (request, reply) => {
  const slot = await createAdSlot(request.body);
  return slot;
});

// 更新广告位
fastify.patch('/slots/:id', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: { tags: ['ads', 'admin'] }
}, async (request, reply) => {
  const { id } = request.params;
  const slot = await updateAdSlot(id, request.body);
  if (!slot) {
    return reply.code(404).send({ error: '广告位不存在' });
  }
  return slot;
});

// 删除广告位
fastify.delete('/slots/:id', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: { tags: ['ads', 'admin'] }
}, async (request, reply) => {
  const { id } = request.params;
  await deleteAdSlot(id);
  return { success: true };
});

// 获取广告列表
fastify.get('/', {
  schema: { tags: ['ads'] }
}, async (request, reply) => {
  const { include_inactive } = request.query;
  
  const isAdmin = request.user?.role === 'admin';
  const includeInactive = isAdmin && include_inactive === 'true';
  
  const result = await getAds({
    slotId: request.query.slotId,
    type: request.query.type,
    isActive: request.query.isActive,
    includeInactive,
    page: request.query.page,
    limit: request.query.limit,
  });
  
  return result;
});

// 获取单个广告
fastify.get('/:id', {
  schema: { tags: ['ads'] }
}, async (request, reply) => {
  const { id } = request.params;
  const isAdmin = request.user?.role === 'admin';
  
  const ad = await getAdById(id, { includeInactive: isAdmin });
  if (!ad) {
    return reply.code(404).send({ error: '广告不存在' });
  }
  
  // 管理员返回完整信息
  if (!isAdmin) {
    const { isActive, startAt, endAt, remark, ...publicAd } = ad;
    return publicAd;
  }
  
  return ad;
});

// 创建广告
fastify.post('/', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: { tags: ['ads', 'admin'] }
}, async (request, reply) => {
  const ad = await createAd(request.body);
  return ad;
});

// 更新广告
fastify.patch('/:id', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: { tags: ['ads', 'admin'] }
}, async (request, reply) => {
  const { id } = request.params;
  const ad = await updateAd(id, request.body);
  if (!ad) {
    return reply.code(404).send({ error: '广告不存在' });
  }
  return ad;
});

// 删除广告
fastify.delete('/:id', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: { tags: ['ads', 'admin'] }
}, async (request, reply) => {
  const { id } = request.params;
  await deleteAd(id);
  return { success: true };
});
```

#### 1.2 前端 API (`apps/web/src/extensions/ads/api/index.js`)

**变更前:**
```javascript
export const adsApi = {
  getAdminSlots: (params) => apiClient.get('/ads/admin/slots', params),
  createSlot: (data) => apiClient.post('/ads/admin/slots', data),
  updateSlot: (id, data) => apiClient.patch(`/ads/admin/slots/${id}`, data),
  deleteSlot: (id) => apiClient.delete(`/ads/admin/slots/${id}`),
  
  getAdminAds: (params) => apiClient.get('/ads/admin/ads', params),
  createAd: (data) => apiClient.post('/ads/admin/ads', data),
  updateAd: (id, data) => apiClient.patch(`/ads/admin/ads/${id}`, data),
  deleteAd: (id) => apiClient.delete(`/ads/admin/ads/${id}`),
  // ...
};
```

**变更后:**
```javascript
export const adsApi = {
  // 公开/用户接口
  getSlots: (params) => apiClient.get('/ads/slots', params),
  getSlot: (id) => apiClient.get(`/ads/slots/${id}`),
  
  // 管理员操作（无 admin 前缀，权限由后端控制）
  createSlot: (data) => apiClient.post('/ads/slots', data),
  updateSlot: (id, data) => apiClient.patch(`/ads/slots/${id}`, data),
  deleteSlot: (id) => apiClient.delete(`/ads/slots/${id}`),
  
  // 广告接口
  getAds: (params) => apiClient.get('/ads', params),
  getAd: (id) => apiClient.get(`/ads/${id}`),
  
  // 管理员操作
  createAd: (data) => apiClient.post('/ads', data),
  updateAd: (id, data) => apiClient.patch(`/ads/${id}`, data),
  deleteAd: (id) => apiClient.delete(`/ads/${id}`),
  
  // 其他公开接口保持不变
  getDisplayAds: (slotCode) => apiClient.get(`/ads/display/${slotCode}`),
  recordImpression: (adId) => apiClient.post(`/ads/${adId}/impression`),
  recordClick: (adId) => apiClient.post(`/ads/${adId}/click`),
};
```

#### 1.3 前端页面 (`apps/web/src/extensions/ads/pages/admin/AdminAdsPage.jsx`)

需要更新所有 API 调用：
```javascript
// 更新 fetchData 函数
const fetchData = async () => {
  const [slotsData, adsData] = await Promise.all([
    adsApi.getSlots({ include_inactive: 'true' }),  // 使用新路由
    adsApi.getAds({ include_inactive: 'true' }),
  ]);
  setSlots(slotsData);
  setAds(adsData);
};

// 更新 handleSlotSubmit
const handleSlotSubmit = async (values) => {
  if (editingSlot) {
    await adsApi.updateSlot(editingSlot.id, values);  // 使用新路由
  } else {
    await adsApi.createSlot(values);  // 使用新路由
  }
  fetchData();
};

// 更新 handleDeleteSlot
const handleDeleteSlot = async (id) => {
  await adsApi.deleteSlot(id);  // 使用新路由
  fetchData();
};
```

### 2. Badges 扩展重构

#### 2.1 后端路由 (`apps/api/src/extensions/badges/routes/index.js`)

**关键变更：**
```javascript
// 获取勋章列表（规范一+二：同路径异视图 + Query 参数）
fastify.get('/', {
  preHandler: [fastify.optionalAuth],
  schema: {
    tags: ['badges'],
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', default: 1 },
        limit: { type: 'integer', default: 20 },
        category: { type: 'string' },
        include_inactive: { type: 'string' }  // 新增
      }
    }
  }
}, async (request, reply) => {
  const { page, limit, category, include_inactive } = request.query;
  
  const isAdmin = request.user?.role === 'admin';
  
  // 普通用户忽略 include_inactive 参数
  const includeInactive = isAdmin && include_inactive === 'true';
  
  // Public endpoint: always active badges only for non-admins
  const result = await getBadges({ page, limit, category, includeInactive });

  // 规范一：同路径，异视图
  if (request.user) {
    const userOwned = await getUserBadges(request.user.id);
    
    const ownershipInfo = new Map();
    
    userOwned.forEach(ub => {
      const bid = ub.badge ? ub.badge.id : ub.badgeId;
      ownershipInfo.set(bid, {
        isOwned: true,
        earnedAt: ub.earnedAt,
        isDisplayed: ub.isDisplayed,
        userBadgeId: ub.id
      });
    });

    const enrichedItems = result.items.map(badge => {
      const info = ownershipInfo.get(badge.id);
      if (info) {
        return { ...badge, ...info };
      }
      return { ...badge, isOwned: false };
    });

    return {
      ...result,
      items: enrichedItems
    };
  }

  // 未登录用户，直接返回基础列表
  return { 
    ...result,
    items: result.items.map(b => ({ ...b, isOwned: false })) 
  };
});

// 创建勋章（规范三：HTTP 方法级权限控制）
fastify.post('/', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: {
    tags: ['badges', 'admin'],
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      required: ['name', 'slug', 'iconUrl'],
      properties: {
        name: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        iconUrl: { type: 'string' },
        category: { type: 'string' },
        unlockCondition: { type: 'string' },
        metadata: { type: 'string' },
        displayOrder: { type: 'integer' },
        isActive: { type: 'boolean' }
      }
    }
  }
}, async (request, reply) => {
  const { createBadge } = await import('../services/badgeService.js');
  const badge = await createBadge(request.body);
  return badge;
});

// 更新勋章
fastify.patch('/:id', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: { tags: ['badges', 'admin'] }
}, async (request, reply) => {
  const { updateBadge } = await import('../services/badgeService.js');
  const { id } = request.params;
  const badge = await updateBadge(id, request.body);
  return badge;
});

// 删除勋章
fastify.delete('/:id', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: { tags: ['badges', 'admin'] }
}, async (request, reply) => {
  // 检查是否是第一个管理员（创始人）
  const [firstAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.role, 'admin'))
    .orderBy(users.createdAt)
    .limit(1);

  if (!firstAdmin || firstAdmin.id !== request.user.id) {
    return reply.code(403).send({ error: '只有创始人（第一个管理员）可以删除勋章' });
  }

  const { deleteBadge } = await import('../services/badgeService.js');
  const { id } = request.params;
  await deleteBadge(id);
  return { success: true };
});

// 规范四：保留纯管理操作 /admin 前缀
fastify.post('/admin/grant', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: { tags: ['badges', 'admin'] }
}, async (request, reply) => {
  // 保留原有逻辑
  const { grantBadge } = await import('../services/badgeService.js');
  // ...
});

fastify.post('/admin/revoke', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: { tags: ['badges', 'admin'] }
}, async (request, reply) => {
  // 保留原有逻辑
  const { revokeUserBadge } = await import('../services/badgeService.js');
  // ...
});
```

#### 2.2 前端 API (`apps/web/src/extensions/badges/api/index.js`)

**变更前:**
```javascript
export const badgesApi = {
  getBadges: (params) => apiClient.get('/badges', params),
  getAdminBadges: (params) => apiClient.get('/badges/admin', params),
  createBadge: (data) => apiClient.post('/badges/admin', data),
  updateBadge: (id, data) => apiClient.request(`/badges/admin/${id}`, {
    method: 'PATCH',
    data,
  }),
  deleteBadge: (id) => apiClient.delete(`/badges/admin/${id}`),
  grantBadge: (data) => apiClient.post('/badges/admin/grant', data),  // 保留
  revokeBadge: (data) => apiClient.post('/badges/admin/revoke', data),  // 保留
  updateUserBadgeDisplay: (userBadgeId, data) => apiClient.patch(`/badges/user/${userBadgeId}`, data),
};
```

**变更后:**
```javascript
export const badgesApi = {
  // 公开/用户接口
  getBadges: (params) => apiClient.get('/badges', params),
  getBadge: (id) => apiClient.get(`/badges/${id}`),
  
  // 管理员操作（无 admin 前缀）
  createBadge: (data) => apiClient.post('/badges', data),
  updateBadge: (id, data) => apiClient.request(`/badges/${id}`, {
    method: 'PATCH',
    data,
  }),
  deleteBadge: (id) => apiClient.delete(`/badges/${id}`),
  
  // 规范四：保留纯管理操作（admin 前缀）
  grantBadge: (data) => apiClient.post('/badges/admin/grant', data),
  revokeBadge: (data) => apiClient.post('/badges/admin/revoke', data),
  
  updateUserBadgeDisplay: (userBadgeId, data) => apiClient.patch(`/badges/user/${userBadgeId}`, data),
};
```

### 3. Shop 扩展重构

#### 3.1 后端路由 (`apps/api/src/extensions/shop/routes/index.js`)

**关键变更：**
```javascript
// 获取商品列表（规范二：Query 参数切换管理模式）
fastify.get('/items', {
  schema: {
    tags: ['shop'],
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', default: 1 },
        limit: { type: 'integer', default: 20 },
        type: { type: 'string' },
        include_inactive: { type: 'string' }  // 新增
      },
    },
  },
}, async (request, reply) => {
  try {
    const { page, limit, type, include_inactive } = request.query;
    
    const isAdmin = request.user?.role === 'admin';
    const includeInactive = isAdmin && include_inactive === 'true';
    
    const result = await getShopItems({ page, limit, type, includeInactive });
    return result;
  } catch (error) {
    fastify.log.error('[商城] 获取商品列表失败:', error);
    return reply.code(500).send({ error: '查询失败' });
  }
});

// 创建商品（规范三：HTTP 方法级权限控制）
fastify.post('/items', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: {
    tags: ['shop', 'admin'],
    description: '创建商品（管理员）',
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      required: ['name', 'price', 'type'],
      properties: {
        name: { type: 'string', maxLength: 100 },
        description: { type: 'string' },
        price: { type: 'integer', minimum: 0 },
        type: { type: 'string' },
        imageUrl: { type: 'string' },
        stock: { type: ['integer', 'null'], minimum: 0 },
        isActive: { type: 'boolean' },
        displayOrder: { type: 'integer' },
        metadata: { type: 'string' },
        currencyCode: { type: 'string' },
      },
    },
  },
}, async (request, reply) => {
  try {
    const item = await createShopItem(request.body);
    return item;
  } catch (error) {
    fastify.log.error('[商城管理] 创建商品失败:', error);
    return reply.code(500).send({ error: '创建失败' });
  }
});

// 更新商品
fastify.patch('/items/:itemId', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: {
    tags: ['shop', 'admin'],
    description: '更新商品（管理员）',
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      required: ['itemId'],
      properties: {
        itemId: { type: 'integer' },
      },
    },
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'integer', minimum: 0 },
        type: { type: 'string' },
        imageUrl: { type: 'string' },
        stock: { type: ['integer', 'string', 'null'] },
        isActive: { type: 'boolean' },
        displayOrder: { type: 'integer' },
        metadata: { type: 'string' },
        currencyCode: { type: 'string' },
      },
    },
  },
}, async (request, reply) => {
  try {
    const { itemId } = request.params;
    const item = await updateShopItem(itemId, request.body);
    return item;
  } catch (error) {
    fastify.log.error('[商城管理] 更新商品失败:', error);
    return reply.code(500).send({ error: '更新失败' });
  }
});

// 删除商品
fastify.delete('/items/:itemId', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: {
    tags: ['shop', 'admin'],
    description: '删除商品（管理员）',
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      required: ['itemId'],
      properties: {
        itemId: { type: 'integer' },
      },
    },
  },
}, async (request, reply) => {
  try {
    // 检查是否是第一个管理员（创始人）
    const [firstAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'))
      .orderBy(users.createdAt)
      .limit(1);

    if (!firstAdmin || firstAdmin.id !== request.user.id) {
      return reply.code(403).send({ error: '只有创始人（第一个管理员）可以删除商品' });
    }

    const { itemId } = request.params;
    const result = await deleteShopItem(itemId);
    return result;
  } catch (error) {
    fastify.log.error('[商城管理] 删除商品失败:', error);
    return reply.code(500).send({ error: '删除失败' });
  }
});

// 移除旧的 /admin/items 路由
```

#### 3.2 前端 API (`apps/web/src/extensions/shop/api/index.js`)

**变更:**
```javascript
export const shopApi = {
  // 公开接口
  getShopItems: (params) => apiClient.get('/shop/items', params),
  getShopItem: (itemId) => apiClient.get(`/shop/items/${itemId}`),
  
  // 管理员操作（无 admin 前缀）
  createShopItem: (data) => apiClient.post('/shop/items', data),
  updateShopItem: (itemId, data) => apiClient.patch(`/shop/items/${itemId}`, data),
  deleteShopItem: (itemId) => apiClient.delete(`/shop/items/${itemId}`),
  
  // 其他接口保持不变
  buyItem: (itemId, data) => apiClient.post(`/shop/items/${itemId}/buy`, data),
  giftItem: (itemId, data) => apiClient.post(`/shop/items/${itemId}/gift`, data),
  getUserItems: (params) => apiClient.get('/shop/my-items', params),
  equipItem: (userItemId) => apiClient.post(`/shop/my-items/${userItemId}/equip`),
  unequipItem: (userItemId) => apiClient.post(`/shop/my-items/${userItemId}/unequip`),
};
```

### 4. Ledger 扩展重构

#### 4.1 后端路由 (`apps/api/src/extensions/ledger/routes.js`)

**关键变更：**
```javascript
// 获取货币列表（规范三：GET 公开，POST 仅管理员）
fastify.get('/currencies', {
  preHandler: [fastify.authenticate],  // 需要登录，但不一定是管理员
  schema: {
    tags: ['ledger'],
    description: '获取所有货币配置',
  }
}, async (req, reply) => {
  return db.select().from(sysCurrencies).orderBy(sysCurrencies.id);
});

fastify.post('/currencies', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: { tags: ['ledger'] }
}, async (req, reply) => {
  // 保持原有逻辑
});

// 保留纯管理操作
fastify.post('/admin/operation', {
  preHandler: [fastify.authenticate, fastify.requireAdmin],
  schema: { tags: ['ledger'] }
}, async (req, reply) => {
  // 保持原有逻辑
});
```

#### 4.2 前端 API (`apps/web/src/extensions/ledger/api/index.js`)

**变更:**
```javascript
export const ledgerApi = {
  getStats: (params) => apiClient.get('/ledger/stats', params),
  getTransactions: (params) => apiClient.get('/ledger/transactions', params),
  getBalance: (params) => apiClient.get('/ledger/balance', params),
  getAccounts: () => apiClient.get('/ledger/accounts'),
  getActiveCurrencies: () => apiClient.get('/ledger/active-currencies'),
  
  // 货币配置（GET 公开，POST 仅管理员）
  getCurrencies: (params) => apiClient.get('/ledger/currencies', params),
  createCurrency: (data) => apiClient.post('/ledger/currencies', data),
  
  // 保留纯管理操作
  performOperation: (data) => apiClient.post('/ledger/admin/operation', data),
};
```

---

## 实施步骤

### 阶段一：后端 API 重构 (预计 2-3 小时)

| 优先级 | 任务 | 文件 | 预计时间 |
|-------|------|------|---------|
| P0 | 重构 Ads 路由 | `apps/api/src/extensions/ads/routes/index.js` | 45分钟 |
| P0 | 重构 Badges 路由 | `apps/api/src/extensions/badges/routes/index.js` | 45分钟 |
| P0 | 重构 Shop 路由 | `apps/api/src/extensions/shop/routes/index.js` | 30分钟 |
| P1 | 重构 Ledger currencies 路由 | `apps/api/src/extensions/ledger/routes.js` | 20分钟 |
| P1 | 检查 Users 路由（增强 DTO） | `apps/api/src/routes/users/index.js` | 20分钟 |

### 阶段二：前端 API 同步 (预计 30 分钟)

| 优先级 | 任务 | 文件 | 预计时间 |
|-------|------|------|---------|
| P0 | 更新 adsApi | `apps/web/src/extensions/ads/api/index.js` | 10分钟 |
| P0 | 更新 badgesApi | `apps/web/src/extensions/badges/api/index.js` | 8分钟 |
| P0 | 更新 shopApi | `apps/web/src/extensions/shop/api/index.js` | 8分钟 |
| P1 | 更新 ledgerApi | `apps/web/src/extensions/ledger/api/index.js` | 5分钟 |

### 阶段三：前端页面更新 (预计 30 分钟)

| 优先级 | 任务 | 文件 | 预计时间 |
|-------|------|------|---------|
| P0 | 更新 AdminAdsPage | `apps/web/src/extensions/ads/pages/admin/AdminAdsPage.jsx` | 10分钟 |
| P0 | 更新 AdminBadgesPage | `apps/web/src/extensions/badges/pages/admin/AdminBadgesPage.jsx` | 10分钟 |
| P0 | 更新 AdminShopPage | `apps/web/src/extensions/shop/pages/admin/AdminShopPage.jsx` | 8分钟 |
| P1 | 更新 LedgerCurrencies | `apps/web/src/extensions/ledger/components/admin/LedgerCurrencies.jsx` | 5分钟 |

### 阶段四：测试与验证 (预计 1 小时)

| 优先级 | 任务 | 说明 | 预计时间 |
|-------|------|------|---------|
| P0 | 启动开发服务器 | 确保 API 和 Web 服务正常运行 | 5分钟 |
| P0 | 功能测试 | 测试所有管理后台页面功能 | 30分钟 |
| P0 | 权限测试 | 验证非管理员无法访问管理操作 | 15分钟 |
| P0 | Swagger 文档检查 | 确认 API 文档已更新 | 5分钟 |

---

## 风险与缓解

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| 旧版客户端仍在使用旧路由 | API 兼容性问题 | 中 | 暂不支持旧客户端，直接切换 |
| 权限控制遗漏 | 安全漏洞 | 低 | 仔细审查每个路由的 preHandler |
| 前端组件未同步更新 | 功能故障 | 中 | 优先同步更新前端 API 调用 |
| Query 参数泄露 | 安全风险 | 低 | 非管理员请求时静默忽略敏感参数 |
| Swagger 文档未更新 | 文档不一致 | 低 | 测试完成后重新生成文档 |

---

## 验收标准

### 后端验收

- [ ] `apps/api/src/extensions/ads/routes/index.js` - 所有 `/admin/slots` 和 `/admin/ads` 路由已移除
- [ ] `apps/api/src/extensions/badges/routes/index.js` - CRUD 路由移除 `/admin`，保留 `grant/revoke`
- [ ] `apps/api/src/extensions/shop/routes/index.js` - `/admin/items` 路由已移除
- [ ] `apps/api/src/extensions/ledger/routes.js` - `GET /currencies` 改为公开路由
- [ ] 所有新路由正确使用 `preHandler` 进行权限控制
- [ ] Query 参数 `include_inactive=true` 正确实现（非管理员忽略）
- [ ] GET 路由根据用户角色返回不同 DTO

### 前端验收

- [ ] `apps/web/src/extensions/ads/api/index.js` - API 方法已更新
- [ ] `apps/web/src/extensions/badges/api/index.js` - API 方法已更新
- [ ] `apps/web/src/extensions/shop/api/index.js` - API 方法已更新
- [ ] `apps/web/src/extensions/ledger/api/index.js` - API 方法已更新
- [ ] `apps/web/src/extensions/ads/pages/admin/AdminAdsPage.jsx` - API 调用已更新
- [ ] `apps/web/src/extensions/badges/pages/admin/AdminBadgesPage.jsx` - API 调用已更新
- [ ] `apps/web/src/extensions/shop/pages/admin/AdminShopPage.jsx` - API 调用已更新
- [ ] `apps/web/src/extensions/ledger/components/admin/LedgerCurrencies.jsx` - API 调用已更新

### 功能验收

- [ ] 管理员可以查看/创建/更新/删除广告位
- [ ] 管理员可以查看/创建/更新/删除广告
- [ ] 管理员可以查看/创建/更新/删除/授予/撤销勋章
- [ ] 管理员可以查看/创建/更新/删除商城商品
- [ ] 管理员可以查看/创建货币
- [ ] 普通用户无法访问管理操作（403 错误）
- [ ] Swagger 文档显示正确的路由结构

---

## 附录

### A. 相关文件清单

**后端文件：**
```
apps/api/src/extensions/ads/routes/index.js
apps/api/src/extensions/badges/routes/index.js
apps/api/src/extensions/shop/routes/index.js
apps/api/src/extensions/ledger/routes.js
apps/api/src/routes/users/index.js
```

**前端文件：**
```
apps/web/src/extensions/ads/api/index.js
apps/web/src/extensions/ads/pages/admin/AdminAdsPage.jsx
apps/web/src/extensions/badges/api/index.js
apps/web/src/extensions/badges/pages/admin/AdminBadgesPage.jsx
apps/web/src/extensions/badges/components/admin/BadgeAssignmentDialog.jsx
apps/web/src/extensions/shop/api/index.js
apps/web/src/extensions/shop/pages/admin/AdminShopPage.jsx
apps/web/src/extensions/ledger/api/index.js
apps/web/src/extensions/ledger/components/admin/LedgerCurrencies.jsx
```

### B. 参考资料

- Google Workspace API: https://developers.google.com/workspace/admin/directory/reference/rest/v1/users/list
- Spring Security: https://www.baeldung.com/spring-security-url-http-authorization
- NestJS Guards: https://docs.nestjs.com/guards
- Stack Overflow: https://stackoverflow.com/questions/59779967/restful-api-design-based-on-the-rbac-model

---

**文档版本**: 1.0  
**最后更新**: 2026-01-21