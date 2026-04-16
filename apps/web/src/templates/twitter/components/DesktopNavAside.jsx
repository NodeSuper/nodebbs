'use client';

import { usePathname } from 'next/navigation';
import { DesktopNav } from '../globals/Header';

/**
 * 桌面端左侧导航容器
 * profile/dashboard 页面收窄为图标宽度，避免双侧边栏冲突
 */
export default function DesktopNavAside() {
  const pathname = usePathname();
  const isMinimal = pathname?.startsWith('/profile') || pathname?.startsWith('/dashboard');

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen border-r border-border transition-[width] duration-200 ${
        isMinimal ? 'w-[68px]' : 'w-[68px] xl:w-[275px]'
      }`}
    >
      <DesktopNav />
    </aside>
  );
}
