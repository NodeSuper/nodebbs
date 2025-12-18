'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Archive, Loader2 } from 'lucide-react';
import UserAvatar from '@/components/user/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { postApi, topicApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/common/Loading';

export default function ReplyForm({
  topicId,
  isClosed,
  isDeleted,
  onReplyAdded,
  onTopicUpdate,
}) {
  const router = useRouter();
  const { user, isAuthenticated, openLoginDialog, loading } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 提交回复
  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      toast.error('请输入回复内容');
      return;
    }

    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }

    setSubmitting(true);

    try {
      const response = await postApi.create({
        topicId: topicId,
        content: replyContent,
      });

      if (response.requiresApproval) {
        toast.success(
          response.message || '您的回复已提交，等待审核后将公开显示'
        );
      } else {
        toast.success(response.message || '回复成功！');

        // 如果返回了新帖子数据，立即添加到列表
        if (response.post && onReplyAdded) {
          const newPost = {
            id: response.post.id,
            content: replyContent,
            userId: user.id,
            userName: user.name,
            username: user.username,
            userUsername: user.username,
            userAvatar: user.avatar,
            topicId: topicId,
            postNumber: response.post.postNumber || 0,
            likeCount: 0,
            isLiked: false,
            replyToPostId: null,
            replyToPost: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            editCount: 0,
            ...response.post,
          };
          onReplyAdded(newPost);
        } else {
          // 如果没有返回数据或没有回调，刷新页面
          router.refresh();
        }
      }

      setReplyContent('');
    } catch (err) {
      console.error('发布回复失败:', err);
      toast.error('发布回复失败：' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 切换主题状态（开启/关闭）
  const handleToggleTopicStatus = async () => {
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }

    try {
      const newClosedState = !isClosed;
      await topicApi.update(topicId, {
        isClosed: newClosedState,
      });

      toast.success(newClosedState ? '主题已关闭' : '主题已重新开启');
      
      // 更新父组件状态
      if (onTopicUpdate) {
        onTopicUpdate({ isClosed: newClosedState });
      }
      
      router.refresh();
    } catch (err) {
      console.error('操作失败:', err);
      toast.error('操作失败：' + err.message);
    }
  };

  if (loading) {
    return <Loading className='py-12' />;
  }

  if (!isAuthenticated) {
    return (
      <div className='mt-6 bg-card border border-border rounded-lg p-6 text-center'>
        <p className='text-muted-foreground mb-4'>请先登录后再发表评论</p>
        <Button onClick={openLoginDialog}>登录</Button>
      </div>
    );
  }

  return (
    <div className='mt-6'>
      {/* 话题已删除提示 */}
      {isDeleted && (
        <div className='mb-4 bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center space-x-3'>
          <Archive className='h-5 w-5 text-destructive shrink-0' />
          <div>
            <p className='text-sm font-medium text-destructive'>
              此话题已被删除
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              已删除的话题不能发表新回复。
            </p>
          </div>
        </div>
      )}

      {/* 话题已关闭提示 */}
      {!isDeleted && isClosed && (
        <div className='mb-4 bg-muted border border-border rounded-lg p-4 flex items-center space-x-3'>
          <Lock className='h-5 w-5 text-muted-foreground shrink-0' />
          <div>
            <p className='text-sm font-medium text-card-foreground'>
              此话题已关闭
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              {user?.role === 'admin' || user?.role === 'moderator'
                ? '作为管理员/版主，您可以重新开启此话题。'
                : '此话题不再接受新回复。'}
            </p>
          </div>
        </div>
      )}

      <div className='bg-card border border-border rounded-lg'>
        {/* 回复框头部 */}
        <div className='flex items-center space-x-3 px-4 py-3 bg-muted border-b border-border rounded-t-lg'>
          <UserAvatar url={user?.avatar} name={user?.username} size='sm' />
          <span className='text-sm font-medium text-card-foreground'>
            写下你的评论
          </span>
        </div>

        {/* 回复输入区域 */}
        <div className='p-4'>
          <Textarea
            className='w-full min-h-[100px] resize-none'
            placeholder={isDeleted ? '已删除的话题不能回复' : '发表你的评论...'}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            disabled={submitting || isClosed || isDeleted}
          />
        </div>

        {/* 回复框底部 */}
        <div className='px-4 py-3 bg-muted border-t border-border rounded-b-lg'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-muted-foreground'>
              {/* 支持 Markdown 格式 */}
            </div>
            <div className='flex items-center space-x-2'>
              {!isDeleted &&
                (user?.role === 'admin' || user?.role === 'moderator') && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleToggleTopicStatus}
                  >
                    {isClosed ? '重新开启' : '关闭话题'}
                  </Button>
                )}
              <Button
                size='sm'
                className='bg-chart-2 hover:bg-chart-2/90 text-primary-foreground'
                onClick={handleSubmitReply}
                disabled={
                  submitting ||
                  !replyContent.trim() ||
                  isClosed ||
                  isDeleted
                }
              >
                {submitting ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    提交中...
                  </>
                ) : (
                  '发表评论'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
