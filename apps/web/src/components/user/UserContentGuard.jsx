'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '../common/Loading';

/**
 * 用户内容访问控制组件
 * 根据用户的contentVisibility设置控制内容显示
 */
export default function UserContentGuard({ user, children }) {
  const {
    user: currentUser,
    isAuthenticated,
    openLoginDialog,
    loading,
  } = useAuth();

  // 检查是否可以查看内容
  const canViewContent = () => {
    const visibility = user.contentVisibility || 'everyone';

    // 如果是用户自己，总是可以查看
    if (currentUser && currentUser.id === user.id) {
      return true;
    }

    switch (visibility) {
      case 'everyone':
        return true;
      case 'authenticated':
        return isAuthenticated;
      case 'private':
        return false;
      default:
        return true;
    }
  };

  // 获取提示信息
  const getAccessMessage = () => {
    const visibility = user.contentVisibility || 'everyone';

    switch (visibility) {
      case 'authenticated':
        return {
          title: '需要登录',
          description: '该用户设置了仅登录用户可查看其内容',
          action: '登录查看',
        };
      case 'private':
        return {
          title: '内容已隐藏',
          description: '该用户设置了仅自己可查看其内容',
          action: null,
        };
      default:
        return null;
    }
  };

  // 优化：如果内容对所有人可见，不需要等待认证状态
  const visibility = user.contentVisibility || 'everyone';
  
  if (visibility === 'everyone') {
    return <>{children}</>;
  }

  // 只有在需要检查认证状态时才显示 loading
  if (loading) {
    return <Loading className='py-12' />;
  }

  if (canViewContent()) {
    return <>{children}</>;
  }

  const message = getAccessMessage();

  return (
    <div className='bg-card border border-border rounded-lg p-8 text-center'>
      <Lock className='h-12 w-12 text-muted-foreground/50 mx-auto mb-4' />
      <h3 className='text-lg font-semibold text-foreground mb-2'>
        {message.title}
      </h3>
      <p className='text-sm text-muted-foreground mb-4'>
        {message.description}
      </p>
      {message.action && (
        <Button onClick={openLoginDialog}>{message.action}</Button>
      )}
    </div>
  );
}
