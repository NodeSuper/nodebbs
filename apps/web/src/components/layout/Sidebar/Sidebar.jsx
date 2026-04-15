'use client';

import { usePathname } from 'next/navigation';
import { SidebarContent } from './SidebarContent';

export default function Sidebar({ categories, stats }) {
  const pathname = usePathname();

  return <SidebarContent categories={categories} stats={stats} currentPath={pathname} />;
}
