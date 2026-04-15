'use client';

import Link from '@/components/common/Link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Megaphone,
  RefreshCw,
  BookOpen,
  HelpCircle,
  MessageCircle,
  LifeBuoy,
  MessagesSquare,
} from 'lucide-react';

const iconMap = {
  0: Home,
  1: Megaphone,
  2: RefreshCw,
  3: BookOpen,
  4: HelpCircle,
  5: MessageCircle,
  6: LifeBuoy,
  7: MessagesSquare,
};

export default function LeftNav({ categories }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const linkClass = (active) =>
    `flex items-center gap-3 px-2 py-2 rounded text-sm transition-colors ${
      active
        ? 'text-foreground font-semibold'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <nav className='space-y-1'>
      <Link href='/' className={linkClass(isActive('/'))}>
        <Home className='h-4 w-4 shrink-0 opacity-60' />
        <span>首页</span>
      </Link>

      {categories?.map((category, index) => {
        const catHref = `/categories/${category.slug}`;
        const Icon = iconMap[(index + 1) % Object.keys(iconMap).length] || MessageCircle;
        return (
          <Link key={category.id} href={catHref} className={linkClass(isActive(catHref))}>
            <Icon className='h-4 w-4 shrink-0 opacity-60' />
            <span className='truncate'>{category.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
