'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

/**
 * RBAC 权限检查 Hook
 * 提供权限检查方法和角色信息
 */
export function usePermission() {
  const { user } = useAuth();

  return useMemo(() => {
    // 向后兼容的属性
    const isAdmin = user?.isAdmin || false;
    const isModerator = user?.isModerator || false;

    // RBAC 数据
    const userRoles = user?.userRoles || [];
    const permissions = user?.permissions || [];
    const displayRole = user?.displayRole || null;

    /**
     * 检查用户是否有指定权限
     * @param {string} slug - 权限标识
     * @returns {boolean}
     */
    const hasPermission = (slug) => {
      if (!user) return false;
      // 管理员拥有所有权限
      if (isAdmin) return true;
      return permissions.includes(slug);
    };

    /**
     * 检查用户是否有任一指定权限
     * @param {string[]} slugs - 权限标识列表
     * @returns {boolean}
     */
    const hasAnyPermission = (slugs) => {
      if (!user) return false;
      if (isAdmin) return true;
      return slugs.some(slug => permissions.includes(slug));
    };

    /**
     * 检查用户是否有所有指定权限
     * @param {string[]} slugs - 权限标识列表
     * @returns {boolean}
     */
    const hasAllPermissions = (slugs) => {
      if (!user) return false;
      if (isAdmin) return true;
      return slugs.every(slug => permissions.includes(slug));
    };

    /**
     * 检查用户是否有指定角色
     * @param {string} slug - 角色标识
     * @returns {boolean}
     */
    const hasRole = (slug) => {
      if (!user) return false;
      return userRoles.some(r => r.slug === slug);
    };

    /**
     * 检查用户是否有任一指定角色
     * @param {string[]} slugs - 角色标识列表
     * @returns {boolean}
     */
    const hasAnyRole = (slugs) => {
      if (!user) return false;
      return userRoles.some(r => slugs.includes(r.slug));
    };

    /**
     * 检查用户是否可以编辑话题
     * @param {Object} topic - 话题对象
     * @returns {boolean}
     */
    const canEditTopic = (topic) => {
      if (!user || !topic) return false;
      // 管理员/版主可以编辑所有话题
      if (isModerator) return true;
      // 作者可以编辑自己的话题
      if (topic.userId === user.id) {
        return hasPermission('topic.update');
      }
      return false;
    };

    /**
     * 检查用户是否可以删除话题
     * @param {Object} topic - 话题对象
     * @returns {boolean}
     */
    const canDeleteTopic = (topic) => {
      if (!user || !topic) return false;
      // 管理员/版主可以删除所有话题
      if (isModerator) return true;
      // 作者可以删除自己的话题
      if (topic.userId === user.id) {
        return hasPermission('topic.delete');
      }
      return false;
    };

    /**
     * 检查用户是否可以置顶话题
     * @returns {boolean}
     */
    const canPinTopic = () => {
      if (!user) return false;
      return hasPermission('topic.pin');
    };

    /**
     * 检查用户是否可以关闭话题
     * @returns {boolean}
     */
    const canCloseTopic = () => {
      if (!user) return false;
      return hasPermission('topic.close');
    };

    /**
     * 检查用户是否可以编辑帖子
     * @param {Object} post - 帖子对象
     * @returns {boolean}
     */
    const canEditPost = (post) => {
      if (!user || !post) return false;
      // 管理员/版主可以编辑所有帖子
      if (isModerator) return true;
      // 作者可以编辑自己的帖子
      if (post.userId === user.id) {
        return hasPermission('post.update');
      }
      return false;
    };

    /**
     * 检查用户是否可以删除帖子
     * @param {Object} post - 帖子对象
     * @returns {boolean}
     */
    const canDeletePost = (post) => {
      if (!user || !post) return false;
      // 管理员/版主可以删除所有帖子
      if (isModerator) return true;
      // 作者可以删除自己的帖子
      if (post.userId === user.id) {
        return hasPermission('post.delete');
      }
      return false;
    };

    /**
     * 检查用户是否可以管理指定用户
     * @param {Object} targetUser - 目标用户对象
     * @returns {boolean}
     */
    const canManage = (targetUser) => {
      if (!user) return false;
      if (isAdmin) return true;
      if (isModerator && targetUser?.role !== 'admin') return true;
      return false;
    };

    return {
      // 向后兼容
      isAdmin,
      isModerator,
      canManage,

      // RBAC 数据
      userRoles,
      permissions,
      displayRole,

      // 权限检查方法
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,

      // 话题权限
      canEditTopic,
      canDeleteTopic,
      canPinTopic,
      canCloseTopic,

      // 帖子权限
      canEditPost,
      canDeletePost,
    };
  }, [user]);
}
