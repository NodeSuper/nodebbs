/**
 * Permission Service
 * RBAC 权限检查服务
 */

import { eq, and, inArray, isNull, gt } from 'drizzle-orm';
import db from '../db/index.js';
import {
  roles,
  permissions,
  rolePermissions,
  userRoles,
  categoryPermissions,
  userStatus,
} from '../db/schema.js';

// 权限缓存 TTL（秒）
const PERMISSION_CACHE_TTL = 300; // 5 分钟

class PermissionService {
  constructor(fastify) {
    this.fastify = fastify;
  }

  /**
   * 获取用户的所有角色
   * @param {number} userId - 用户 ID
   * @returns {Promise<Array>} 用户角色列表
   */
  async getUserRoles(userId) {
    const cacheKey = `user:${userId}:roles`;

    // 尝试从缓存获取
    if (this.fastify?.cache) {
      return await this.fastify.cache.remember(cacheKey, PERMISSION_CACHE_TTL, async () => {
        return this._fetchUserRoles(userId);
      });
    }

    return this._fetchUserRoles(userId);
  }

  async _fetchUserRoles(userId) {
    const now = new Date();

    const results = await db
      .select({
        id: roles.id,
        slug: roles.slug,
        name: roles.name,
        color: roles.color,
        icon: roles.icon,
        priority: roles.priority,
        isDisplayed: roles.isDisplayed,
        parentId: roles.parentId,
        expiresAt: userRoles.expiresAt,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, userId),
          // 排除已过期的角色
          // expiresAt 为 null 表示永不过期，或者 expiresAt > now
          // drizzle-orm 的 or 需要导入
        )
      );

    // 过滤掉已过期的角色
    return results.filter(r => !r.expiresAt || new Date(r.expiresAt) > now);
  }

  /**
   * 获取角色的所有祖先角色ID（用于角色继承）
   * @param {number} roleId - 角色 ID
   * @param {Set} visited - 已访问的角色ID集合（防止循环）
   * @returns {Promise<number[]>} 祖先角色ID列表
   */
  async _getAncestorRoleIds(roleId, visited = new Set()) {
    if (visited.has(roleId)) {
      return []; // 防止循环继承
    }
    visited.add(roleId);

    const [role] = await db
      .select({ parentId: roles.parentId })
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    if (!role || !role.parentId) {
      return [];
    }

    const ancestors = await this._getAncestorRoleIds(role.parentId, visited);
    return [role.parentId, ...ancestors];
  }

  /**
   * 获取用户所有角色ID（包括继承的父角色）
   * @param {number} userId - 用户 ID
   * @returns {Promise<number[]>} 角色ID列表
   */
  async _getAllRoleIdsWithInheritance(userId) {
    const userRolesList = await this.getUserRoles(userId);
    const allRoleIds = new Set(userRolesList.map(r => r.id));

    // 递归获取所有父角色
    for (const role of userRolesList) {
      if (role.parentId) {
        const ancestors = await this._getAncestorRoleIds(role.id);
        ancestors.forEach(id => allRoleIds.add(id));
      }
    }

    return Array.from(allRoleIds);
  }

  /**
   * 获取用户的所有权限
   * @param {number} userId - 用户 ID
   * @returns {Promise<Array>} 权限列表（包含条件）
   */
  async getUserPermissions(userId) {
    const cacheKey = `user:${userId}:permissions`;

    if (this.fastify?.cache) {
      return await this.fastify.cache.remember(cacheKey, PERMISSION_CACHE_TTL, async () => {
        return this._fetchUserPermissions(userId);
      });
    }

    return this._fetchUserPermissions(userId);
  }

  async _fetchUserPermissions(userId) {
    const userRolesList = await this.getUserRoles(userId);
    if (!userRolesList.length) {
      return [];
    }

    // 获取所有角色ID（包括继承的父角色）
    const roleIds = await this._getAllRoleIdsWithInheritance(userId);

    if (!roleIds.length) {
      return [];
    }

    const results = await db
      .select({
        id: permissions.id,
        slug: permissions.slug,
        name: permissions.name,
        module: permissions.module,
        action: permissions.action,
        conditions: rolePermissions.conditions,
        roleId: rolePermissions.roleId,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(inArray(rolePermissions.roleId, roleIds));

    // 获取角色优先级映射
    const rolePriorityMap = new Map();
    const allRoles = await db
      .select({ id: roles.id, priority: roles.priority })
      .from(roles)
      .where(inArray(roles.id, roleIds));
    allRoles.forEach(r => rolePriorityMap.set(r.id, r.priority));

    // 去重并合并条件（高优先级角色的权限覆盖低优先级）
    const permMap = new Map();
    for (const perm of results) {
      const existing = permMap.get(perm.slug);
      const currentPriority = rolePriorityMap.get(perm.roleId) || 0;
      const existingPriority = existing ? (rolePriorityMap.get(existing.roleId) || 0) : -1;

      if (!existing) {
        permMap.set(perm.slug, {
          ...perm,
          conditions: perm.conditions ? JSON.parse(perm.conditions) : null,
        });
      } else {
        // 如果有更宽松的权限（无条件），使用无条件版本
        // 或者高优先级角色的权限覆盖低优先级
        if (!perm.conditions && existing.conditions) {
          permMap.set(perm.slug, {
            ...perm,
            conditions: null,
          });
        } else if (currentPriority > existingPriority && perm.conditions) {
          // 高优先级角色的条件可能更宽松
          permMap.set(perm.slug, {
            ...perm,
            conditions: JSON.parse(perm.conditions),
          });
        }
      }
    }

    return Array.from(permMap.values());
  }

  /**
   * 检查用户是否有某个权限
   * @param {number} userId - 用户 ID
   * @param {string} permissionSlug - 权限标识
   * @param {Object} context - 上下文（如资源所有者ID、分类ID等）
   * @returns {Promise<boolean>}
   */
  async hasPermission(userId, permissionSlug, context = {}) {
    const userPermissions = await this.getUserPermissions(userId);
    const permission = userPermissions.find(p => p.slug === permissionSlug);

    if (!permission) {
      return false;
    }

    // 检查条件
    if (permission.conditions) {
      // own: true 表示只能操作自己的资源
      if (permission.conditions.own && context.ownerId !== undefined) {
        if (context.ownerId !== userId) {
          return false;
        }
      }

      // categories: [1, 2, 3] 表示只能在指定分类操作
      if (permission.conditions.categories && context.categoryId !== undefined) {
        if (!permission.conditions.categories.includes(context.categoryId)) {
          return false;
        }
      }

      // level: 5 表示需要达到指定等级
      if (permission.conditions.level !== undefined && context.userLevel !== undefined) {
        if (context.userLevel < permission.conditions.level) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 检查用户是否有某个角色
   * @param {number} userId - 用户 ID
   * @param {string} roleSlug - 角色标识
   * @returns {Promise<boolean>}
   */
  async hasRole(userId, roleSlug) {
    const userRolesList = await this.getUserRoles(userId);
    return userRolesList.some(r => r.slug === roleSlug);
  }

  /**
   * 检查用户是否有任一权限
   * @param {number} userId - 用户 ID
   * @param {Array<string>} permissionSlugs - 权限标识列表
   * @returns {Promise<boolean>}
   */
  async hasAnyPermission(userId, permissionSlugs) {
    const userPermissions = await this.getUserPermissions(userId);
    const userPermSlugs = userPermissions.map(p => p.slug);
    return permissionSlugs.some(slug => userPermSlugs.includes(slug));
  }

  /**
   * 检查用户是否有所有权限
   * @param {number} userId - 用户 ID
   * @param {Array<string>} permissionSlugs - 权限标识列表
   * @returns {Promise<boolean>}
   */
  async hasAllPermissions(userId, permissionSlugs) {
    const userPermissions = await this.getUserPermissions(userId);
    const userPermSlugs = userPermissions.map(p => p.slug);
    return permissionSlugs.every(slug => userPermSlugs.includes(slug));
  }

  /**
   * 获取用户在某个分类的权限
   * @param {number} userId - 用户 ID
   * @param {number} categoryId - 分类 ID
   * @returns {Promise<Object>}
   */
  async getCategoryPermissions(userId, categoryId) {
    const userRolesList = await this.getUserRoles(userId);
    if (!userRolesList.length) {
      return { canView: false, canCreate: false, canReply: false, canModerate: false };
    }

    const roleIds = userRolesList.map(r => r.id);

    const results = await db
      .select()
      .from(categoryPermissions)
      .where(
        and(
          eq(categoryPermissions.categoryId, categoryId),
          inArray(categoryPermissions.roleId, roleIds)
        )
      );

    // 合并权限（任一角色有权限即可）
    const merged = {
      canView: results.some(r => r.canView),
      canCreate: results.some(r => r.canCreate),
      canReply: results.some(r => r.canReply),
      canModerate: results.some(r => r.canModerate),
    };

    // 如果没有针对该分类的配置，使用默认权限（全部允许查看）
    if (results.length === 0) {
      return { canView: true, canCreate: true, canReply: true, canModerate: false };
    }

    return merged;
  }

  /**
   * 清除用户权限缓存
   * @param {number} userId - 用户 ID
   */
  async clearUserPermissionCache(userId) {
    if (this.fastify?.cache) {
      await this.fastify.cache.invalidate([
        `user:${userId}:roles`,
        `user:${userId}:permissions`,
      ]);
    }
  }

  /**
   * 增强用户对象，添加 RBAC 数据
   * @param {Object} user - 用户对象
   * @returns {Promise<Object>} 增强后的用户对象
   */
  async enhanceUserWithPermissions(user) {
    if (!user) return null;

    const [userRolesList, userPermissions] = await Promise.all([
      this.getUserRoles(user.id),
      this.getUserPermissions(user.id),
    ]);

    // 获取展示角色（最高优先级且允许展示的角色）
    const displayRole = userRolesList
      .filter(r => r.isDisplayed)
      .sort((a, b) => b.priority - a.priority)[0] || null;

    return {
      ...user,
      // RBAC 数据
      userRoles: userRolesList,
      permissions: userPermissions.map(p => p.slug),
      displayRole: displayRole ? {
        slug: displayRole.slug,
        name: displayRole.name,
        color: displayRole.color,
        icon: displayRole.icon,
      } : null,
      // 向后兼容的权限检查
      isAdmin: userRolesList.some(r => r.slug === 'admin'),
      isModerator: userRolesList.some(r => ['admin', 'moderator'].includes(r.slug)),
    };
  }

  // ============ 管理方法 ============

  /**
   * 为用户分配角色
   * @param {number} userId - 用户 ID
   * @param {number} roleId - 角色 ID
   * @param {Object} options - 选项
   */
  async assignRoleToUser(userId, roleId, options = {}) {
    const { expiresAt, assignedBy } = options;

    await db.insert(userRoles).values({
      userId,
      roleId,
      expiresAt,
      assignedBy,
    }).onConflictDoUpdate({
      target: [userRoles.userId, userRoles.roleId],
      set: { expiresAt, assignedBy, assignedAt: new Date() },
    });

    await this.clearUserPermissionCache(userId);
  }

  /**
   * 从用户移除角色
   * @param {number} userId - 用户 ID
   * @param {number} roleId - 角色 ID
   */
  async removeRoleFromUser(userId, roleId) {
    await db
      .delete(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        )
      );

    await this.clearUserPermissionCache(userId);
  }

  /**
   * 获取所有角色
   */
  async getAllRoles() {
    return db.select().from(roles).orderBy(roles.priority);
  }

  /**
   * 获取所有权限
   */
  async getAllPermissions() {
    return db.select().from(permissions).orderBy(permissions.module, permissions.action);
  }

  /**
   * 根据 slug 获取角色
   */
  async getRoleBySlug(slug) {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.slug, slug))
      .limit(1);
    return role;
  }

  /**
   * 获取角色的权限
   */
  async getRolePermissions(roleId) {
    return db
      .select({
        id: permissions.id,
        slug: permissions.slug,
        name: permissions.name,
        module: permissions.module,
        action: permissions.action,
        conditions: rolePermissions.conditions,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));
  }

  /**
   * 设置角色的权限
   * @param {number} roleId - 角色 ID
   * @param {Array<{permissionId: number, conditions?: object}>} permissionConfigs - 权限配置
   */
  async setRolePermissions(roleId, permissionConfigs) {
    // 删除现有权限
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    // 插入新权限
    if (permissionConfigs.length > 0) {
      await db.insert(rolePermissions).values(
        permissionConfigs.map(config => ({
          roleId,
          permissionId: config.permissionId,
          conditions: config.conditions ? JSON.stringify(config.conditions) : null,
        }))
      );
    }
  }

  // ============ 用户状态管理方法 ============

  /**
   * 获取用户状态
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object|null>} 用户状态对象
   */
  async getUserStatus(userId) {
    const cacheKey = `user:${userId}:status`;

    if (this.fastify?.cache) {
      return await this.fastify.cache.remember(cacheKey, PERMISSION_CACHE_TTL, async () => {
        return this._fetchUserStatus(userId);
      });
    }

    return this._fetchUserStatus(userId);
  }

  async _fetchUserStatus(userId) {
    const [status] = await db
      .select()
      .from(userStatus)
      .where(eq(userStatus.userId, userId))
      .limit(1);

    if (!status) {
      return { status: 'active', isMuted: false, isBanned: false };
    }

    const now = new Date();

    // 检查禁言是否已过期
    const isMuted = status.status === 'muted' &&
      (!status.mutedUntil || new Date(status.mutedUntil) > now);

    // 检查封禁是否已过期
    const isBanned = status.status === 'banned' &&
      (!status.bannedUntil || new Date(status.bannedUntil) > now);

    return {
      ...status,
      isMuted,
      isBanned,
      effectiveStatus: isBanned ? 'banned' : (isMuted ? 'muted' : status.status),
    };
  }

  /**
   * 禁言用户
   * @param {number} userId - 用户 ID
   * @param {Object} options - 选项
   */
  async muteUser(userId, options = {}) {
    const { until, reason, mutedBy } = options;

    await db
      .insert(userStatus)
      .values({
        userId,
        status: 'muted',
        mutedUntil: until || null,
        mutedReason: reason || null,
        mutedBy: mutedBy || null,
      })
      .onConflictDoUpdate({
        target: [userStatus.userId],
        set: {
          status: 'muted',
          mutedUntil: until || null,
          mutedReason: reason || null,
          mutedBy: mutedBy || null,
          updatedAt: new Date(),
        },
      });

    await this.clearUserStatusCache(userId);
  }

  /**
   * 解除禁言
   * @param {number} userId - 用户 ID
   */
  async unmuteUser(userId) {
    const [current] = await db
      .select()
      .from(userStatus)
      .where(eq(userStatus.userId, userId))
      .limit(1);

    if (current) {
      // 如果用户已被封禁，保持封禁状态；否则设为 active
      const newStatus = current.bannedUntil || current.status === 'banned' ? 'banned' : 'active';

      await db
        .update(userStatus)
        .set({
          status: newStatus,
          mutedUntil: null,
          mutedReason: null,
          mutedBy: null,
          updatedAt: new Date(),
        })
        .where(eq(userStatus.userId, userId));
    }

    await this.clearUserStatusCache(userId);
  }

  /**
   * 封禁用户（通过状态表）
   * @param {number} userId - 用户 ID
   * @param {Object} options - 选项
   */
  async banUserStatus(userId, options = {}) {
    const { until, reason, bannedBy } = options;

    await db
      .insert(userStatus)
      .values({
        userId,
        status: 'banned',
        bannedUntil: until || null,
        bannedReason: reason || null,
        bannedBy: bannedBy || null,
      })
      .onConflictDoUpdate({
        target: [userStatus.userId],
        set: {
          status: 'banned',
          bannedUntil: until || null,
          bannedReason: reason || null,
          bannedBy: bannedBy || null,
          updatedAt: new Date(),
        },
      });

    await this.clearUserStatusCache(userId);
  }

  /**
   * 解除封禁（通过状态表）
   * @param {number} userId - 用户 ID
   */
  async unbanUserStatus(userId) {
    const [current] = await db
      .select()
      .from(userStatus)
      .where(eq(userStatus.userId, userId))
      .limit(1);

    if (current) {
      // 如果用户仍被禁言，保持禁言状态；否则设为 active
      const isMuted = current.mutedUntil && new Date(current.mutedUntil) > new Date();
      const newStatus = isMuted ? 'muted' : 'active';

      await db
        .update(userStatus)
        .set({
          status: newStatus,
          bannedUntil: null,
          bannedReason: null,
          bannedBy: null,
          updatedAt: new Date(),
        })
        .where(eq(userStatus.userId, userId));
    }

    await this.clearUserStatusCache(userId);
  }

  /**
   * 清除用户状态缓存
   * @param {number} userId - 用户 ID
   */
  async clearUserStatusCache(userId) {
    if (this.fastify?.cache) {
      await this.fastify.cache.invalidate([`user:${userId}:status`]);
    }
  }

  /**
   * 检查用户是否被禁言
   * @param {number} userId - 用户 ID
   * @returns {Promise<{isMuted: boolean, reason?: string, until?: Date}>}
   */
  async checkMuteStatus(userId) {
    const status = await this.getUserStatus(userId);

    if (status.isMuted) {
      return {
        isMuted: true,
        reason: status.mutedReason,
        until: status.mutedUntil,
      };
    }

    return { isMuted: false };
  }

  /**
   * 获取角色（包含父角色信息）
   * @param {number} roleId - 角色 ID
   */
  async getRoleById(roleId) {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);
    return role;
  }

  /**
   * 检测循环继承
   * @param {number} roleId - 要设置的角色 ID
   * @param {number} parentId - 要设置的父角色 ID
   * @returns {Promise<boolean>} 是否存在循环
   */
  async detectCircularInheritance(roleId, parentId) {
    if (!parentId || roleId === parentId) {
      return roleId === parentId;
    }

    const visited = new Set([roleId]);
    let currentId = parentId;

    while (currentId) {
      if (visited.has(currentId)) {
        return true; // 检测到循环
      }
      visited.add(currentId);

      const [role] = await db
        .select({ parentId: roles.parentId })
        .from(roles)
        .where(eq(roles.id, currentId))
        .limit(1);

      currentId = role?.parentId;
    }

    return false;
  }
}

// 创建单例实例工厂
let instance = null;

export function createPermissionService(fastify) {
  instance = new PermissionService(fastify);
  return instance;
}

export function getPermissionService() {
  if (!instance) {
    instance = new PermissionService(null);
  }
  return instance;
}

export default PermissionService;
