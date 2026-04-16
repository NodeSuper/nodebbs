'use client';

import Link from '@/components/common/Link';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  User,
  MessageSquare,
  Mail,
  Settings,
  Wallet,
  Shield,
  LogOut,
} from 'lucide-react';

/**
 * 用户下拉菜单项 — 桌面端与移动端共享
 * 确保两端菜单项一致，避免重复维护
 */
export default function UserMenuItems({ user, isWalletEnabled, hasDashboardAccess, logout }) {
  return (
    <>
      <DropdownMenuItem asChild>
        <Link href={`/users/${user?.username}`} className='cursor-pointer'>
          <User className='h-4 w-4' />
          个人主页
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href='/profile/topics' className='cursor-pointer'>
          <MessageSquare className='h-4 w-4' />
          我的话题
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href='/profile/messages' className='cursor-pointer'>
          <Mail className='h-4 w-4' />
          站内信
        </Link>
      </DropdownMenuItem>
      {isWalletEnabled && (
        <DropdownMenuItem asChild>
          <Link href='/profile/wallet' className='cursor-pointer'>
            <Wallet className='h-4 w-4' />
            我的钱包
          </Link>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem asChild>
        <Link href='/profile/settings' className='cursor-pointer'>
          <Settings className='h-4 w-4' />
          个人设置
        </Link>
      </DropdownMenuItem>
      {hasDashboardAccess && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href='/dashboard' className='cursor-pointer text-primary'>
              <Shield className='h-4 w-4' />
              管理后台
            </Link>
          </DropdownMenuItem>
        </>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={logout} className='cursor-pointer text-red-600 dark:text-red-500'>
        <LogOut className='h-4 w-4' />
        退出登录
      </DropdownMenuItem>
    </>
  );
}
