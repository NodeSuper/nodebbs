/**
 * RBAC 初始化脚本
 * 用于初始化角色和权限数据
 */

import { eq } from 'drizzle-orm';
import {
  roles,
  permissions,
  rolePermissions,
  userRoles,
} from '../../db/schema.js';

// ============ 系统角色定义 ============
// 继承关系: admin > moderator > vip > user
const SYSTEM_ROLES = [
  {
    slug: 'admin',
    name: '管理员',
    description: '系统管理员，拥有所有权限',
    color: '#e74c3c',
    icon: 'Shield',
    isSystem: true,
    isDefault: false,
    isDisplayed: true,
    priority: 100,
    parentSlug: 'moderator', // admin 继承 moderator
  },
  {
    slug: 'moderator',
    name: '版主',
    description: '版主，可以管理内容和用户',
    color: '#3498db',
    icon: 'UserCheck',
    isSystem: true,
    isDefault: false,
    isDisplayed: true,
    priority: 80,
    parentSlug: 'vip', // moderator 继承 vip
  },
  {
    slug: 'vip',
    name: 'VIP会员',
    description: 'VIP会员，拥有额外特权',
    color: '#f39c12',
    icon: 'Crown',
    isSystem: true,
    isDefault: false,
    isDisplayed: true,
    priority: 50,
    parentSlug: 'user', // vip 继承 user
  },
  {
    slug: 'user',
    name: '普通用户',
    description: '普通注册用户',
    color: '#95a5a6',
    icon: 'User',
    isSystem: true,
    isDefault: true,
    isDisplayed: false,
    priority: 10,
    parentSlug: null, // user 是基础角色，无父角色
  },
];

// ============ 系统权限定义 ============
const SYSTEM_PERMISSIONS = [
  // 话题权限
  { slug: 'topic.create', name: '创建话题', module: 'topic', action: 'create', isSystem: true },
  { slug: 'topic.read', name: '查看话题', module: 'topic', action: 'read', isSystem: true },
  { slug: 'topic.update', name: '编辑话题', module: 'topic', action: 'update', isSystem: true },
  { slug: 'topic.delete', name: '删除话题', module: 'topic', action: 'delete', isSystem: true },
  { slug: 'topic.pin', name: '置顶话题', module: 'topic', action: 'pin', isSystem: true },
  { slug: 'topic.close', name: '关闭话题', module: 'topic', action: 'close', isSystem: true },
  { slug: 'topic.approve', name: '审核话题', module: 'topic', action: 'approve', isSystem: true },
  { slug: 'topic.move', name: '移动话题', module: 'topic', action: 'move', isSystem: true },

  // 帖子/回复权限
  { slug: 'post.create', name: '发表回复', module: 'post', action: 'create', isSystem: true },
  { slug: 'post.read', name: '查看回复', module: 'post', action: 'read', isSystem: true },
  { slug: 'post.update', name: '编辑回复', module: 'post', action: 'update', isSystem: true },
  { slug: 'post.delete', name: '删除回复', module: 'post', action: 'delete', isSystem: true },
  { slug: 'post.approve', name: '审核回复', module: 'post', action: 'approve', isSystem: true },

  // 用户管理权限
  { slug: 'user.read', name: '查看用户', module: 'user', action: 'read', isSystem: true },
  { slug: 'user.update', name: '编辑用户', module: 'user', action: 'update', isSystem: true },
  { slug: 'user.delete', name: '删除用户', module: 'user', action: 'delete', isSystem: true },
  { slug: 'user.ban', name: '封禁用户', module: 'user', action: 'ban', isSystem: true },
  { slug: 'user.role.assign', name: '分配角色', module: 'user', action: 'role.assign', isSystem: true },

  // 分类管理权限
  { slug: 'category.create', name: '创建分类', module: 'category', action: 'create', isSystem: true },
  { slug: 'category.update', name: '编辑分类', module: 'category', action: 'update', isSystem: true },
  { slug: 'category.delete', name: '删除分类', module: 'category', action: 'delete', isSystem: true },

  // 系统管理权限
  { slug: 'system.settings', name: '系统设置', module: 'system', action: 'settings', isSystem: true },
  { slug: 'system.dashboard', name: '管理后台', module: 'system', action: 'dashboard', isSystem: true },
  { slug: 'system.logs', name: '系统日志', module: 'system', action: 'logs', isSystem: true },

  // 上传权限
  { slug: 'upload.image', name: '上传图片', module: 'upload', action: 'image', isSystem: true },
  { slug: 'upload.file', name: '上传文件', module: 'upload', action: 'file', isSystem: true },

  // 邀请权限
  { slug: 'invitation.create', name: '创建邀请码', module: 'invitation', action: 'create', isSystem: true },
  { slug: 'invitation.manage', name: '管理邀请码', module: 'invitation', action: 'manage', isSystem: true },

  // 审核权限
  { slug: 'moderation.reports', name: '处理举报', module: 'moderation', action: 'reports', isSystem: true },
  { slug: 'moderation.content', name: '审核内容', module: 'moderation', action: 'content', isSystem: true },
];

// ============ 角色权限映射 ============
// 定义每个角色默认拥有的权限
const ROLE_PERMISSION_MAP = {
  admin: [
    // 管理员拥有所有权限
    'topic.create', 'topic.read', 'topic.update', 'topic.delete', 'topic.pin', 'topic.close', 'topic.approve', 'topic.move',
    'post.create', 'post.read', 'post.update', 'post.delete', 'post.approve',
    'user.read', 'user.update', 'user.delete', 'user.ban', 'user.role.assign',
    'category.create', 'category.update', 'category.delete',
    'system.settings', 'system.dashboard', 'system.logs',
    'upload.image', 'upload.file',
    'invitation.create', 'invitation.manage',
    'moderation.reports', 'moderation.content',
  ],
  moderator: [
    // 版主权限
    'topic.create', 'topic.read', 'topic.update', 'topic.delete', 'topic.pin', 'topic.close', 'topic.approve', 'topic.move',
    'post.create', 'post.read', 'post.update', 'post.delete', 'post.approve',
    'user.read', 'user.ban',
    'upload.image', 'upload.file',
    'invitation.create',
    'moderation.reports', 'moderation.content',
  ],
  vip: [
    // VIP用户权限
    'topic.create', 'topic.read', 'topic.update', 'topic.delete',
    'post.create', 'post.read', 'post.update', 'post.delete',
    'user.read',
    'upload.image', 'upload.file',
    'invitation.create',
  ],
  user: [
    // 普通用户权限
    'topic.create', 'topic.read', 'topic.update', 'topic.delete',
    'post.create', 'post.read', 'post.update', 'post.delete',
    'user.read',
    'upload.image',
  ],
};

// 权限条件配置（如：普通用户只能操作自己的内容）
const PERMISSION_CONDITIONS = {
  user: {
    'topic.update': { own: true },
    'topic.delete': { own: true },
    'post.update': { own: true },
    'post.delete': { own: true },
  },
  vip: {
    'topic.update': { own: true },
    'topic.delete': { own: true },
    'post.update': { own: true },
    'post.delete': { own: true },
  },
};

/**
 * 列出 RBAC 配置
 */
export function listRBACConfig() {
  console.log('\n📋 RBAC 配置列表:\n');

  console.log('系统角色:');
  SYSTEM_ROLES.forEach(role => {
    const inheritInfo = role.parentSlug ? ` -> 继承自 ${role.parentSlug}` : ' (基础角色)';
    console.log(`  - ${role.slug}: ${role.name} (优先级: ${role.priority})${inheritInfo}`);
  });

  console.log('\n继承关系:');
  console.log('  admin -> moderator -> vip -> user');

  console.log('\n系统权限:');
  const modulePermissions = {};
  SYSTEM_PERMISSIONS.forEach(perm => {
    if (!modulePermissions[perm.module]) {
      modulePermissions[perm.module] = [];
    }
    modulePermissions[perm.module].push(perm);
  });

  Object.entries(modulePermissions).forEach(([module, perms]) => {
    console.log(`  ${module}:`);
    perms.forEach(perm => {
      console.log(`    - ${perm.slug}: ${perm.name}`);
    });
  });

  console.log('\n角色权限映射:');
  Object.entries(ROLE_PERMISSION_MAP).forEach(([role, perms]) => {
    console.log(`  ${role}: ${perms.length} 个权限`);
  });
}

/**
 * 初始化 RBAC 数据
 */
export async function initRBAC(db, reset = false) {
  const result = {
    roles: { addedCount: 0, updatedCount: 0, skippedCount: 0, total: SYSTEM_ROLES.length },
    permissions: { addedCount: 0, updatedCount: 0, skippedCount: 0, total: SYSTEM_PERMISSIONS.length },
    rolePermissions: { addedCount: 0, updatedCount: 0, skippedCount: 0, total: 0 },
  };

  console.log('\n📦 初始化 RBAC 系统...\n');

  // 1. 初始化角色
  console.log('🔹 初始化角色...');
  const roleIdMap = {}; // slug -> id 映射

  for (const roleData of SYSTEM_ROLES) {
    // 排除 parentSlug，因为它不是数据库字段
    const { parentSlug, ...roleDataWithoutParent } = roleData;

    const [existing] = await db
      .select()
      .from(roles)
      .where(eq(roles.slug, roleData.slug))
      .limit(1);

    if (existing) {
      if (reset) {
        await db
          .update(roles)
          .set(roleDataWithoutParent)
          .where(eq(roles.slug, roleData.slug));
        result.roles.updatedCount++;
        console.log(`  ✓ 更新角色: ${roleData.slug}`);
      } else {
        result.roles.skippedCount++;
        console.log(`  - 跳过角色: ${roleData.slug} (已存在)`);
      }
      roleIdMap[roleData.slug] = existing.id;
    } else {
      const [inserted] = await db
        .insert(roles)
        .values(roleDataWithoutParent)
        .returning({ id: roles.id });
      result.roles.addedCount++;
      roleIdMap[roleData.slug] = inserted.id;
      console.log(`  ✓ 创建角色: ${roleData.slug}`);
    }
  }

  // 1.5 设置角色继承关系
  console.log('\n🔹 设置角色继承关系...');
  for (const roleData of SYSTEM_ROLES) {
    if (roleData.parentSlug) {
      const roleId = roleIdMap[roleData.slug];
      const parentId = roleIdMap[roleData.parentSlug];

      if (roleId && parentId) {
        await db
          .update(roles)
          .set({ parentId })
          .where(eq(roles.id, roleId));
        console.log(`  ✓ 设置继承: ${roleData.slug} -> ${roleData.parentSlug}`);
      }
    }
  }

  // 2. 初始化权限
  console.log('\n🔹 初始化权限...');
  const permissionIdMap = {}; // slug -> id 映射

  for (const permData of SYSTEM_PERMISSIONS) {
    const [existing] = await db
      .select()
      .from(permissions)
      .where(eq(permissions.slug, permData.slug))
      .limit(1);

    if (existing) {
      if (reset) {
        await db
          .update(permissions)
          .set(permData)
          .where(eq(permissions.slug, permData.slug));
        result.permissions.updatedCount++;
      } else {
        result.permissions.skippedCount++;
      }
      permissionIdMap[permData.slug] = existing.id;
    } else {
      const [inserted] = await db
        .insert(permissions)
        .values(permData)
        .returning({ id: permissions.id });
      result.permissions.addedCount++;
      permissionIdMap[permData.slug] = inserted.id;
    }
  }
  console.log(`  ✓ 权限初始化完成 (新增: ${result.permissions.addedCount}, 更新: ${result.permissions.updatedCount}, 跳过: ${result.permissions.skippedCount})`);

  // 3. 初始化角色权限关联
  console.log('\n🔹 初始化角色权限关联...');

  for (const [roleSlug, permSlugs] of Object.entries(ROLE_PERMISSION_MAP)) {
    const roleId = roleIdMap[roleSlug];
    if (!roleId) {
      console.log(`  ⚠ 跳过角色 ${roleSlug}: 角色不存在`);
      continue;
    }

    const conditions = PERMISSION_CONDITIONS[roleSlug] || {};

    for (const permSlug of permSlugs) {
      const permissionId = permissionIdMap[permSlug];
      if (!permissionId) {
        console.log(`  ⚠ 跳过权限 ${permSlug}: 权限不存在`);
        continue;
      }

      result.rolePermissions.total++;

      const [existing] = await db
        .select()
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId))
        .limit(1);

      // 检查是否已存在该关联
      const [existingAssoc] = await db
        .select()
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId))
        .limit(1);

      // 使用 upsert 方式
      const conditionJson = conditions[permSlug] ? JSON.stringify(conditions[permSlug]) : null;

      try {
        await db
          .insert(rolePermissions)
          .values({
            roleId,
            permissionId,
            conditions: conditionJson,
          })
          .onConflictDoUpdate({
            target: [rolePermissions.roleId, rolePermissions.permissionId],
            set: { conditions: conditionJson },
          });
        result.rolePermissions.addedCount++;
      } catch (err) {
        // 如果 onConflictDoUpdate 不支持，使用传统方式
        const [existing] = await db
          .select()
          .from(rolePermissions)
          .where(eq(rolePermissions.roleId, roleId))
          .limit(1);

        if (!existing) {
          await db
            .insert(rolePermissions)
            .values({
              roleId,
              permissionId,
              conditions: conditionJson,
            });
          result.rolePermissions.addedCount++;
        } else {
          result.rolePermissions.skippedCount++;
        }
      }
    }
  }
  console.log(`  ✓ 角色权限关联完成 (新增: ${result.rolePermissions.addedCount}, 跳过: ${result.rolePermissions.skippedCount})`);

  return result;
}

/**
 * 迁移现有用户到 user_roles 表
 * 根据 users.role 字段为用户分配对应角色
 */
export async function migrateExistingUsers(db) {
  console.log('\n🔹 迁移现有用户角色...');

  // 获取所有角色的 ID 映射
  const allRoles = await db.select().from(roles);
  const roleIdMap = {};
  allRoles.forEach(role => {
    roleIdMap[role.slug] = role.id;
  });

  // 获取所有用户
  const { users: usersTable } = await import('../../db/schema.js');
  const allUsers = await db.select({ id: usersTable.id, role: usersTable.role }).from(usersTable);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const user of allUsers) {
    const roleId = roleIdMap[user.role];
    if (!roleId) {
      console.log(`  ⚠ 跳过用户 ${user.id}: 角色 ${user.role} 不存在`);
      skippedCount++;
      continue;
    }

    // 检查是否已分配
    const [existing] = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, user.id))
      .limit(1);

    if (existing) {
      skippedCount++;
      continue;
    }

    // 分配角色
    await db.insert(userRoles).values({
      userId: user.id,
      roleId,
    });
    migratedCount++;
  }

  console.log(`  ✓ 用户迁移完成 (迁移: ${migratedCount}, 跳过: ${skippedCount})`);
  return { migratedCount, skippedCount };
}

/**
 * 清理 RBAC 数据（危险操作）
 */
export async function cleanRBAC(db) {
  console.log('\n🗑️ 清理 RBAC 数据...');

  // 按依赖顺序删除
  await db.delete(rolePermissions);
  console.log('  ✓ 已清理角色权限关联');

  await db.delete(userRoles);
  console.log('  ✓ 已清理用户角色关联');

  await db.delete(permissions);
  console.log('  ✓ 已清理权限');

  await db.delete(roles);
  console.log('  ✓ 已清理角色');

  console.log('✅ RBAC 数据清理完成');
}
