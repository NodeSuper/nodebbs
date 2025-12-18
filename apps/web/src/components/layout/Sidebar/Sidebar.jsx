'use client';

import { usePathname } from 'next/navigation';
import { SidebarUI } from './SidebarUI';

export default function Sidebar({ categories, stats }) {
  const pathname = usePathname();

  return <SidebarUI categories={categories} stats={stats} currentPath={pathname} />;
}
