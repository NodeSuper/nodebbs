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

export function EmailChangeDialog({
  open,
  onOpenChange,
  user,
  settings,
  emailStep,
  emailData,
  onEmailDataChange,
  onRequestCode,
  onVerifyCode,
  loading,
  emailExpiresAt,
  onStepChange,
}) {
  const handleClose = () => {
    onOpenChange(false);
    onStepChange(1);
    onEmailDataChange({ newEmail: '', password: '', verificationCode: '' });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        } else {
          onOpenChange(true);
        }
      }}
    >
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>修改邮箱地址</DialogTitle>
          <DialogDescription>
            {emailStep === 1
              ? '输入新邮箱地址，我们将发送验证码'
              : '请输入发送到新邮箱的验证码'}
          </DialogDescription>
        </DialogHeader>

        {emailStep === 1 ? (
          <div className='space-y-4 py-4'>
            <div>
              <Label className='text-sm font-medium text-card-foreground block mb-2'>
                当前邮箱
              </Label>
              <Input value={user?.email} disabled className='bg-muted' />
            </div>
            <div>
              <Label className='text-sm font-medium text-card-foreground block mb-2'>
                新邮箱地址 *
              </Label>
              <Input
                type='email'
                value={emailData.newEmail}
                onChange={(e) =>
                  onEmailDataChange({ ...emailData, newEmail: e.target.value })
                }
                placeholder='输入新邮箱地址'
                disabled={loading}
              />
            </div>
            {settings.email_change_requires_password?.value && (
              <div>
                <Label className='text-sm font-medium text-card-foreground block mb-2'>
                  当前密码 *
                </Label>
                <Input
                  type='password'
                  value={emailData.password}
                  onChange={(e) =>
                    onEmailDataChange({ ...emailData, password: e.target.value })
                  }
                  placeholder='输入当前密码'
                  disabled={loading}
                />
              </div>
            )}
          </div>
        ) : (
          <div className='space-y-4 py-4'>
            <div className='p-4 bg-muted rounded-lg'>
              <p className='text-sm text-muted-foreground'>
                验证码已发送到：<span className='font-medium text-card-foreground'>{emailData.newEmail}</span>
              </p>
              {emailExpiresAt && (
                <p className='text-xs text-muted-foreground mt-1'>
                  有效期至：{new Date(emailExpiresAt).toLocaleString('zh-CN')}
                </p>
              )}
            </div>
            <div>
              <Label className='text-sm font-medium text-card-foreground block mb-2'>
                验证码 *
              </Label>
              <Input
                value={emailData.verificationCode}
                onChange={(e) =>
                  onEmailDataChange({ ...emailData, verificationCode: e.target.value })
                }
                placeholder='输入6位验证码'
                maxLength={6}
                disabled={loading}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => {
              if (emailStep === 2) {
                onStepChange(1);
              } else {
                handleClose();
              }
            }}
            disabled={loading}
          >
            {emailStep === 2 ? '上一步' : '取消'}
          </Button>
          <Button
            onClick={emailStep === 1 ? onRequestCode : onVerifyCode}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                {emailStep === 1 ? '发送中...' : '验证中...'}
              </>
            ) : emailStep === 1 ? (
              '发送验证码'
            ) : (
              '确认修改'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
