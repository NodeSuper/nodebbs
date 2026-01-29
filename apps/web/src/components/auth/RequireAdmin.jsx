'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import { Loading } from '../common/Loading';

/**
 * 管理后台访问守卫组件
 * 检查用户是否有任一管理后台权限
 */
export default function RequireAdmin({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { hasDashboardAccess } = usePermission();

  const router = useRouter();
  const canAccess = isAuthenticated && hasDashboardAccess();

  useEffect(() => {
    if (!loading && !canAccess) {
      router.push('/');
    }
  }, [canAccess, loading, router]);

  if (loading) {
    return <Loading variant='overlay' />;
  }

  if (!canAccess) {
    return null;
  }

  return <>{children}</>;
}
