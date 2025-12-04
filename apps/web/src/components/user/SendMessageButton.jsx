'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Loader2 } from 'lucide-react';
import { messageApi, blockedUsersApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function SendMessageButton({ recipientId, recipientName, recipientMessagePermission = 'everyone' }) {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [checkingBlock, setCheckingBlock] = useState(true);

  // 检查拉黑状态
  useEffect(() => {
    if (isAuthenticated && user && recipientId) {
      checkBlockStatus();
    } else {
      setCheckingBlock(false);
    }
  }, [isAuthenticated, user, recipientId]);

  const checkBlockStatus = async () => {
    try {
      const result = await blockedUsersApi.check(recipientId);
      setIsBlocked(result.isBlocked || false);
    } catch (err) {
      console.error('检查拉黑状态失败:', err);
    } finally {
      setCheckingBlock(false);
    }
  };

  // 如果是自己，不显示按钮（不能给自己发消息）
  if (user && user.id === recipientId) {
    return null;
  }

  // 如果接收者禁用了站内信，不显示按钮
  if (recipientMessagePermission === 'disabled') {
    return null;
  }

  // 如果当前用户禁用了站内信，不显示按钮
  if (user && user.messagePermission === 'disabled') {
    return null;
  }

  // 如果存在拉黑关系，不显示按钮
  if (!checkingBlock && isBlocked) {
    return null;
  }

  const handleSend = async () => {
    if (!content.trim()) {
      toast.error('请输入消息内容');
      return;
    }

    setSending(true);

    try {
      await messageApi.send({
        recipientId,
        subject: subject.trim() || null,
        content: content.trim()
      });

      toast.success('消息发送成功');
      setIsOpen(false);
      setSubject('');
      setContent('');
    } catch (err) {
      console.error('发送消息失败:', err);
      toast.error('发送失败：' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleOpenChange = (open) => {
    if (!isAuthenticated && open) {
      toast.error('请先登录');
      return;
    }
    setIsOpen(open);
  };

  return (
    <>
      <Button
        className='w-full'
        variant='outline'
        onClick={() => handleOpenChange(true)}
      >
        <Mail className='h-4 w-4' />
        发送消息
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>发送站内信</DialogTitle>
            <DialogDescription>
              发送私信给 {recipientName}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='subject'>主题（可选）</Label>
              <Input
                id='subject'
                placeholder='请输入消息主题'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={sending}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='content'>内容 *</Label>
              <Textarea
                id='content'
                placeholder='请输入消息内容'
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={sending}
                rows={6}
                className='resize-none'
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsOpen(false)}
              disabled={sending}
            >
              取消
            </Button>
            <Button
              type='submit'
              onClick={handleSend}
              disabled={sending || !content.trim()}
            >
              {sending ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  发送中...
                </>
              ) : (
                '发送'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
