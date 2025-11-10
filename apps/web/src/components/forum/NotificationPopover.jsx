'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, Trash2, Settings } from 'lucide-react';
import { notificationApi } from '@/lib/api';
import Link from 'next/link';
import { Loading } from '../common/Loading';

export default function NotificationPopover() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 加载通知
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // 定期更新未读数量
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // 每分钟更新一次
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationApi.getList(1, 10, false);
      setNotifications(data.items || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationApi.getList(1, 1, true);
      setUnreadCount(data.total || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const notification = notifications.find((n) => n.id === id);
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return '刚刚';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}小时前`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const getNotificationIcon = (type) => {
    // 根据不同类型返回不同的图标或样式
    switch (type) {
      case 'reply':
        return '💬';
      case 'like':
        return '❤️';
      case 'mention':
        return '@';
      case 'follow':
        return '👤';
      default:
        return '🔔';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-4 w-4' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs'
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-96 p-0' align='end'>
        {/* 标题栏 */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-border'>
          <h3 className='font-semibold text-base'>通知</h3>
          <div className='flex items-center gap-2'>
            {unreadCount > 0 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleMarkAllAsRead}
                className='text-xs h-7 px-2'
              >
                <Check className='h-3 w-3 mr-1' />
                全部已读
              </Button>
            )}
            {/* <Link href='/profile/notifications'  onClick={() => setIsOpen(false)}>
              <Button variant='ghost' size='icon' className='h-7 w-7'>
                <Settings className='h-3.5 w-3.5' />
              </Button>
            </Link> */}
          </div>
        </div>

        {/* 通知列表 */}
        <div className='max-h-[400px] overflow-y-auto'>
          {isLoading ? (
            <Loading className='py-8' />
          ) : notifications.length > 0 ? (
            <div className='divide-y divide-border'>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-accent transition-colors ${
                    !notification.isRead ? 'bg-accent/80' : ''
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    {/* 图标 */}
                    <div className='shrink-0 text-xl mt-0.5'>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* 内容 */}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm text-foreground leading-relaxed'>
                        {notification.message}
                      </p>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='text-xs text-muted-foreground'>
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <Badge
                            variant='secondary'
                            className='h-4 px-1 text-xs font-bold text-green-600'
                          >
                            新
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className='flex items-center gap-1 shrink-0'>
                      {!notification.isRead && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6'
                          onClick={() => handleMarkAsRead(notification.id)}
                          title='标记为已读'
                        >
                          <Check className='h-3 w-3' />
                        </Button>
                      )}
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6 hover:text-destructive'
                        onClick={() => handleDelete(notification.id)}
                        title='删除'
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12'>
              <Bell className='h-12 w-12 text-muted-foreground opacity-50 mb-3' />
              <p className='text-sm text-muted-foreground'>暂无通知</p>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className='border-t border-border px-4 py-2'>
          <Link href='/profile/notifications' onClick={() => setIsOpen(false)}>
            <Button variant='ghost' className='w-full text-sm hover:bg-accent'>
              查看全部通知
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
