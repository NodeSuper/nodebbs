'use client';

import NextLink from 'next/link';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

/**
 * 封装的 Link 组件
 * 1. 默认禁用 prefetch (App Router 默认为 true/null，容易导致带宽浪费)
 * 2. 自动处理外部链接 (target="_blank" + rel="noopener noreferrer")
 * 3. 支持 showExternalIcon 显示外部链接图标
 */
const Link = forwardRef(({
  href,
  className,
  children,
  prefetch = false,
  external,
  showExternalIcon = false,
  ...props
}, ref) => {
  const isExternal = external || (typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://')));

  if (isExternal) {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(showExternalIcon && "inline-flex items-center gap-1", className)}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
        {showExternalIcon && <ExternalLink className="h-3 w-3 opacity-70" />}
      </a>
    );
  }

  return (
    <NextLink
      ref={ref}
      href={href || '#'}
      className={className}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </NextLink>
  );
});

Link.displayName = 'Link';

export default Link;
