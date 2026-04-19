'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormDialog } from '@/components/common/FormDialog';
import ReportDialog from '@/components/common/ReportDialog';
import { MoreHorizontal, Shield, ShieldOff, Flag } from 'lucide-react';
import { blockedUsersApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 用户主页次要操作菜单 — 拉黑 / 举报
 * 以 ... 图标触发下拉菜单, 相比平铺按钮更节省空间
 */
export default function UserMoreMenu({ userId, username, className }) {
  const { isAuthenticated, user, openLoginDialog } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await blockedUsersApi.check(userId);
        if (!cancelled) setIsBlocked(result.blockedByMe || false);
      } catch (err) {
        console.error('检查拉黑状态失败:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, user, userId]);

  const handleBlock = async () => {
    setLoading(true);
    try {
      await blockedUsersApi.block(userId);
      setIsBlocked(true);
      toast.success(`已拉黑 ${username}`);
      setShowBlockDialog(false);
    } catch (err) {
      toast.error(err.message || '拉黑失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    try {
      await blockedUsersApi.unblock(userId);
      setIsBlocked(false);
      toast.success(`已取消拉黑 ${username}`);
      setShowUnblockDialog(false);
    } catch (err) {
      toast.error(err.message || '取消拉黑失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReportClick = () => {
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }
    setReportDialogOpen(true);
  };

  const handleBlockClick = () => {
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }
    if (isBlocked) {
      setShowUnblockDialog(true);
    } else {
      setShowBlockDialog(true);
    }
  };

  // 自己的主页不显示
  if (user && user.id === userId) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            aria-label='更多操作'
            className={className}
          >
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-40'>
          <DropdownMenuItem onClick={handleBlockClick}>
            {isBlocked ? (
              <>
                <ShieldOff className='h-4 w-4' />
                取消拉黑
              </>
            ) : (
              <>
                <Shield className='h-4 w-4' />
                拉黑用户
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleReportClick}>
            <Flag className='h-4 w-4' />
            举报用户
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FormDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        title='确认拉黑用户？'
        description={`拉黑 ${username} 后，你们将无法互相发送站内信，对方将无法查看你的动态。你可以随时取消拉黑。`}
        submitText='确认拉黑'
        submitClassName='bg-destructive hover:bg-destructive/90'
        onSubmit={handleBlock}
        loading={loading}
      />

      <FormDialog
        open={showUnblockDialog}
        onOpenChange={setShowUnblockDialog}
        title='取消拉黑？'
        description={`取消拉黑 ${username} 后，你们将可以正常互动。`}
        submitText='确认取消'
        onSubmit={handleUnblock}
        loading={loading}
      />

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        reportType='user'
        targetId={userId}
        targetTitle={username}
      />
    </>
  );
}
