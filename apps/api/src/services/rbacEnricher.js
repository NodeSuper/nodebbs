import { userEnricher } from './user/index.js';
import { getPermissionService } from './permissionService.js';

/**
 * RBAC 用户增强器
 * 为用户添加 displayRole（展示角色）
 *
 * 角色展示信息（name/color 等）从角色级缓存 roles:display:map 获取，
 * 用户级缓存 user:{id}:roles 仅用于确定用户拥有哪些角色 ID。
 * 这样更新角色信息时只需清除一个 key，无需遍历所有用户。
 */
export default function registerRbacEnricher(fastify) {
  /**
   * 从用户角色列表 + 角色展示映射表中提取展示角色
   * @param {Array} userRolesList - 用户的角色列表（来自 user 级缓存，可能含过期的 name/color）
   * @param {Object} rolesDisplayMap - 角色展示信息映射（来自角色级缓存，始终最新）
   */
  const extractDisplayRole = (userRolesList, rolesDisplayMap) => {
    const displayRole = userRolesList
      .map(r => rolesDisplayMap[r.id] || r) // 优先用角色级缓存的最新数据，兜底用 user 级数据
      .filter(r => r.isDisplayed)
      .sort((a, b) => b.priority - a.priority)[0] || null;

    return displayRole ? {
      slug: displayRole.slug,
      name: displayRole.name,
      color: displayRole.color,
      icon: displayRole.icon,
    } : null;
  };

  /**
   * 为单个用户补充展示角色信息
   */
  const enrichUser = async (user) => {
    if (!user || !user.id) return;

    try {
      const permissionService = getPermissionService();
      const [userRolesList, rolesDisplayMap] = await Promise.all([
        permissionService.getUserRoles(user.id),
        permissionService.getRolesDisplayMap(),
      ]);
      user.displayRole = extractDisplayRole(userRolesList, rolesDisplayMap);
    } catch (error) {
      console.error(`[RBAC增强] 补充用户 ${user.id} 的角色信息失败:`, error);
      user.displayRole = null;
    }
  };

  /**
   * 为多个用户批量补充展示角色信息
   */
  const enrichUsers = async (users) => {
    if (!users || users.length === 0) return;

    const permissionService = getPermissionService();

    // 角色展示映射只需取一次（角色级缓存）
    let rolesDisplayMap;
    try {
      rolesDisplayMap = await permissionService.getRolesDisplayMap();
    } catch (error) {
      console.error('[RBAC增强] 获取角色展示信息失败:', error);
      users.forEach(u => { u.displayRole = null; });
      return;
    }

    // 并行获取所有用户的角色（每个用户独立缓存）
    await Promise.all(
      users.map(async (user) => {
        if (!user.id) {
          user.displayRole = null;
          return;
        }

        try {
          const userRolesList = await permissionService.getUserRoles(user.id);
          user.displayRole = extractDisplayRole(userRolesList, rolesDisplayMap);
        } catch (error) {
          console.error(`[RBAC增强] 补充用户 ${user.id} 的角色信息失败:`, error);
          user.displayRole = null;
        }
      })
    );
  };

  userEnricher.register('rbac', enrichUser);
  userEnricher.registerBatch('rbac', enrichUsers);
}
