'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

export function UsernameChangeDialog({
  open,
  onOpenChange,
  user,
  settings,
  usernameData,
  onUsernameDataChange,
  onSubmit,
  loading,
  usernameInfo,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>修改用户名</DialogTitle>
          <DialogDescription>
            {usernameInfo?.cooldownDays > 0 &&
              `修改后需等待 ${usernameInfo.cooldownDays} 天才能再次修改`}
            {usernameInfo?.remainingChanges >= 0 &&
              ` · 剩余修改次数：${usernameInfo.remainingChanges}次`}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div>
            <Label className='text-sm font-medium text-card-foreground block mb-2'>
              当前用户名
            </Label>
            <Input value={user?.username} disabled className='bg-muted' />
          </div>
          <div>
            <Label className='text-sm font-medium text-card-foreground block mb-2'>
              新用户名 *
            </Label>
            <Input
              value={usernameData.newUsername}
              onChange={(e) =>
                onUsernameDataChange({ ...usernameData, newUsername: e.target.value })
              }
              placeholder='输入新用户名'
              disabled={loading}
            />
          </div>
          {settings.username_change_requires_password?.value && (
            <div>
              <Label className='text-sm font-medium text-card-foreground block mb-2'>
                当前密码 *
              </Label>
              <Input
                type='password'
                value={usernameData.password}
                onChange={(e) =>
                  onUsernameDataChange({ ...usernameData, password: e.target.value })
                }
                placeholder='输入当前密码'
                disabled={loading}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => {
              onOpenChange(false);
              onUsernameDataChange({ newUsername: '', password: '' });
            }}
            disabled={loading}
          >
            取消
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                修改中...
              </>
            ) : (
              '确认修改'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
