'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  Loader2,
  LayoutDashboard,
  FolderTree,
  Users,
  Tag,
  Flag,
  Settings,
  Shield,
  MessageSquare,
} from 'lucide-react';
import StickySidebar from '@/components/forum/StickySidebar';
import { Loading } from '@/components/common/Loading';

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading) {
    return <Loading variant='overlay' />;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: '概览', exact: true },
    { href: '/dashboard/topics', icon: MessageSquare, label: '话题管理' },
    { href: '/dashboard/categories', icon: FolderTree, label: '分类管理' },
    { href: '/dashboard/users', icon: Users, label: '用户管理' },
    { href: '/dashboard/tags', icon: Tag, label: '标签管理' },
    { href: '/dashboard/reports', icon: Flag, label: '举报管理' },
    { href: '/dashboard/moderation', icon: Shield, label: '内容审核' },
    { href: '/dashboard/invitations', icon: Shield, label: '邀请码' },
    { href: '/dashboard/invitation-rules', icon: Shield, label: '邀请码规则' },
    { href: '/dashboard/settings', icon: Settings, label: '系统配置' },
  ];

  const isActive = (href, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* GitHub-style sidebar */}
        <div className='w-full lg:w-64 shrink-0'>
          <StickySidebar className='sticky top-[81px] space-y-3'>
            <h1 className='text-lg text-center font-semibold p-4 bg-muted text-muted-foreground rounded-xl'>
              管理后台
            </h1>
            <nav className='space-y-1'>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors
                      ${
                        active
                          ? 'bg-muted font-medium text-foreground'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className='h-4 w-4' />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </StickySidebar>
        </div>

        {/* Main content */}
        <main className='flex-1 min-w-0'>{children}</main>
      </div>
    </div>
  );
}
