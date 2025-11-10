'use client';

import React, { useState, useEffect } from 'react';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight, X } from 'lucide-react';

export default function StickySidebar({ children, className, enabled = true }) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // 客户端检查屏幕尺寸
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // 在服务器端和客户端首次渲染时，始终渲染为桌面版本
  if (!mounted) {
    return <aside className={className}>{children}</aside>;
  }

  if (isDesktop || !enabled) {
    return <aside className={className}>{children}</aside>;
  }

  return (
    <Drawer direction='left'>
      <DrawerTrigger asChild>
        <Button variant='outline' size='icon'>
          <ChevronRight className='h-6 w-6' />
        </Button>
      </DrawerTrigger>
      <DrawerContent className='right-2 top-2 bottom-2 outline-none w-[310px]'>
        <DrawerHeader>
          <DrawerTitle className='text-right'>
            <DrawerClose>
              <X className='h-6 w-6' />
            </DrawerClose>
          </DrawerTitle>
        </DrawerHeader>
        {/* 移动端覆盖样式 */}
        <div className={cn(className, 'p-4 static')}>{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
