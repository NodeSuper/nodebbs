'use client';

import { useState } from 'react';
import Link from '@/components/common/Link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/user/UserAvatar';
import {
  Search,
  Plus,
  Menu,
  X,
  Home,
  Compass,
  Tag,
  Bell,
  Settings,
  LogOut,
  User,
  Mail,
  Shield,
  ChevronDown,
  Wallet,
  Trophy,
  MessageSquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import NotificationPopover from '@/components/common/NotificationPopover';
import ThemeSwitcher from '@/components/common/ThemeSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useLedger } from '@/extensions/ledger/contexts/LedgerContext';
import { usePermission } from '@/hooks/usePermission';

const mobileNavItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/categories', label: '分类', icon: Compass },
  { href: '/tags', label: '标签', icon: Tag },
  { href: '/rank', label: '排行', icon: Trophy },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading, logout, openLoginDialog } = useAuth();
  const { settings } = useSettings();
  const { isWalletEnabled } = useLedger();
  const { hasDashboardAccess } = usePermission();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?s=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className='border-b border-border bg-card sticky top-0 z-50'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center h-14 gap-4'>
          {/* Logo + 站名 */}
          <Link href='/' className='flex items-center gap-2 shrink-0'>
            <img
              src={settings?.site_logo?.value || '/logo.svg'}
              alt='logo'
              className='h-6 w-auto'
            />
            <span className='text-base font-bold text-foreground hidden sm:inline whitespace-nowrap'>
              {settings?.site_name?.value || 'NodeBBS'}
            </span>
          </Link>

          {/* 搜索框 */}
          <div className='flex-1 max-w-sm mx-auto'>
            <form onSubmit={handleSearch} className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none' />
              <input
                type='text'
                placeholder='搜索...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full h-9 pl-9 pr-3 rounded-full bg-background border border-border text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50'
              />
            </form>
          </div>

          {/* 右侧 */}
          <div className='flex items-center gap-3 shrink-0'>
            {!loading && (
              <>
                {/* 通知 */}
                {isAuthenticated && <NotificationPopover />}

                <ThemeSwitcher />

                {/* 用户菜单 */}
                {isAuthenticated ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className='p-0.5 rounded-full hover:ring-2 hover:ring-accent transition-all'>
                          <UserAvatar
                            url={user?.avatar}
                            name={user?.name || user?.username}
                            size='sm'
                            frameMetadata={user?.avatarFrame?.itemMetadata}
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-56'>
                        <DropdownMenuLabel className='pb-2'>
                          <div className='flex flex-col'>
                            <span className='font-bold text-sm'>{user?.name || user?.username}</span>
                            <span className='text-xs text-muted-foreground font-normal'>@{user?.username}</span>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
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
                        {hasDashboardAccess() && (
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
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* New 发布按钮 - 蓝色圆角 */}
                    <Link href='/create'>
                      <Button className='h-9 px-4 rounded-md text-sm font-semibold'>
                        <Plus className='h-4 w-4' />
                        <span className='hidden sm:inline'>发布</span>
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button size='sm' onClick={openLoginDialog} className='h-8 px-4 rounded-md text-sm font-semibold'>
                    登录
                  </Button>
                )}

                {/* 移动端菜单 */}
                <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                  <PopoverTrigger asChild>
                    <Button variant='ghost' size='icon' className='lg:hidden h-8 w-8'>
                      {menuOpen ? <X className='h-4 w-4' /> : <Menu className='h-4 w-4' />}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align='end' sideOffset={0} className='w-screen mt-px rounded-none shadow-none border-x-0 border-b p-0' onOpenAutoFocus={(e) => e.preventDefault()}>
                    <div className='flex flex-col p-3 gap-0.5'>
                      {mobileNavItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${isActive ? 'bg-accent font-semibold' : 'hover:bg-accent/50'}`}
                            onClick={() => setMenuOpen(false)}
                          >
                            <item.icon className='h-5 w-5' />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                    {isAuthenticated && (
                      <div className='p-3 pt-0'>
                        <Link href='/create' onClick={() => setMenuOpen(false)}>
                          <Button className='w-full rounded-md h-9 text-sm font-semibold'>
                            <Plus className='h-4 w-4' />
                            发布话题
                          </Button>
                        </Link>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
