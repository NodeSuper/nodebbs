'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Lock, Loader2 } from 'lucide-react';
import { Loading } from '../common/Loading';

/**
 * 认证守卫组件
 * 用于保护需要登录才能访问的页面
 */
export default function RequireAuth({ children }) {
  const { user, isAuthenticated, loading, openLoginDialog } = useAuth();

  // 加载状态
  if (loading) {
    return <Loading variant='overlay' />;
  }

  // 未登录状态
  if (!isAuthenticated || !user) {
    return (
      <div className='p-12 text-center'>
        <Lock className='h-12 w-12 text-muted-foreground/50 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-foreground mb-2'>需要登录</h3>
        <p className='text-sm text-muted-foreground mb-6'>
          请先登录以访问此页面
        </p>
        <Button onClick={openLoginDialog}>立即登录</Button>
      </div>
    );
  }

  // 已登录，显示内容
  return <>{children}</>;
}
