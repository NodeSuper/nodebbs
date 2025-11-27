'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Heart,
  Lock,
  Pin,
  Archive,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import TimeAgo from '@/components/forum/TimeAgo';
import MarkdownRender from '@/components/common/MarkdownRender';
import { useAuth } from '@/contexts/AuthContext';
import { postApi } from '@/lib/api';
import { toast } from 'sonner';

export default function TopicContent({ topic }) {
  const { user, isAuthenticated, openLoginDialog } = useAuth();
  const [likingPostIds, setLikingPostIds] = useState(new Set());
  const [likeState, setLikeState] = useState({
    isFirstPostLiked: topic.isFirstPostLiked || false,
    firstPostLikeCount: topic.firstPostLikeCount || 0,
  });

  // 切换首帖点赞状态
  const handleTogglePostLike = async (postId, isLiked) => {
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }

    if (likingPostIds.has(postId)) {
      return;
    }

    setLikingPostIds((prev) => new Set(prev).add(postId));

    try {
      if (isLiked) {
        await postApi.unlike(postId);
      } else {
        await postApi.like(postId);
      }

      setLikeState({
        isFirstPostLiked: !isLiked,
        firstPostLikeCount: isLiked
          ? (likeState.firstPostLikeCount || 0) - 1
          : (likeState.firstPostLikeCount || 0) + 1,
      });

      toast.success(isLiked ? '已取消点赞' : '点赞成功');
    } catch (err) {
      console.error('点赞操作失败:', err);
      toast.error(err.message || '操作失败');
    } finally {
      setLikingPostIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  return (
    <>
      {/* 已删除话题提示 */}
      {topic.isDeleted && (
        <div className='mb-4 bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3'>
          <Archive className='h-5 w-5 text-destructive shrink-0 mt-0.5' />
          <div className='flex-1'>
            <p className='text-sm font-medium text-destructive mb-1'>
              此话题已被删除
            </p>
            <p className='text-xs text-muted-foreground'>
              作为{user?.role === 'admin' ? '管理员' : '版主'}
              ，您可以查看已删除的话题内容。普通用户无法访问此话题。
            </p>
          </div>
        </div>
      )}

      {/* 被拒绝话题提示 */}
      {topic.approvalStatus === 'rejected' && user?.id === topic.userId && (
        <div className='mb-4 bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3'>
          <AlertCircle className='h-5 w-5 text-destructive shrink-0 mt-0.5' />
          <div className='flex-1'>
            <p className='text-sm font-medium text-destructive mb-1'>
              此话题审核未通过
            </p>
            <p className='text-xs text-muted-foreground'>
              您可以编辑话题内容后重新提交审核。编辑后，话题将自动重新进入待审核状态。
            </p>
          </div>
        </div>
      )}

      {/* 话题标题 */}
      <div className='mb-6'>
        <div className='flex items-start gap-3'>
          <div className='shrink-0 mt-1.5'>
            {topic.isDeleted ? (
              <Archive className='h-6 w-6 text-destructive/80' />
            ) : topic.isClosed ? (
              <Lock className='h-6 w-6 text-muted-foreground/70' />
            ) : (
              <MessageSquare className='h-6 w-6 text-chart-2/80' />
            )}
          </div>

          <div className='flex-1 min-w-0'>
            <h1 className='text-3xl font-bold mb-3 leading-tight text-foreground break-all'>
              {topic.isPinned && (
                <Pin className='inline-block h-5 w-5 mr-2 text-chart-5 -mt-1' />
              )}
              {topic.title}
              {topic.isDeleted && (
                <Badge
                  variant='outline'
                  className='ml-3 text-destructive border-destructive text-xs'
                >
                  已删除
                </Badge>
              )}
            </h1>

            {/* 元信息 */}
            <div className='flex items-center gap-2 text-sm text-muted-foreground/70 flex-wrap'>
              <span
                className={
                  topic.isDeleted
                    ? 'text-destructive/80'
                    : topic.isClosed
                    ? 'text-muted-foreground/70'
                    : 'text-chart-2/80'
                }
              >
                {topic.isDeleted
                  ? '已删除'
                  : topic.isClosed
                  ? '已关闭'
                  : '开放中'}
              </span>
              <span className='opacity-50'>•</span>
              <Link
                href={`/users/${topic.username}`}
                prefetch={false}
                className='hover:text-foreground transition-colors'
              >
                {topic.userName || topic.username}
              </Link>
              <span className='opacity-70'>
                发布于 <TimeAgo date={topic.createdAt} />
              </span>
              {topic.editCount > 0 && (
                <>
                  <span className='opacity-50'>•</span>
                  <span className='opacity-70'>
                    编辑 {topic.editCount} 次
                  </span>
                </>
              )}
              {topic.approvalStatus === 'pending' && (
                <>
                  <span className='opacity-50'>•</span>
                  <Badge
                    variant='outline'
                    className='text-chart-5 border-chart-5 text-xs'
                  >
                    待审核
                  </Badge>
                </>
              )}
              {topic.approvalStatus === 'rejected' && (
                <>
                  <span className='opacity-50'>•</span>
                  <Badge
                    variant='outline'
                    className='text-destructive border-destructive text-xs'
                  >
                    已拒绝
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 话题内容 - 首帖 */}
      <div
        className='bg-card border border-border rounded-lg mb-6'
        data-post-number='1'
      >
        <div className='px-4 sm:px-6 py-5'>
          <article className='max-w-none prose prose-stone dark:prose-invert'>
            <MarkdownRender content={topic.content} />
          </article>

          {/* 首帖底部操作栏 */}
          {topic.firstPostId && (
            <div className='flex items-center justify-end mt-5 pt-4 border-t border-border/50'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() =>
                  handleTogglePostLike(
                    topic.firstPostId,
                    likeState.isFirstPostLiked
                  )
                }
                disabled={
                  likingPostIds.has(topic.firstPostId) || !isAuthenticated
                }
                className={`${
                  likeState.isFirstPostLiked
                    ? 'text-destructive hover:text-destructive/80'
                    : 'text-muted-foreground hover:text-destructive'
                }`}
                title={likeState.isFirstPostLiked ? '取消点赞' : '点赞'}
              >
                {likingPostIds.has(topic.firstPostId) ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <>
                    <Heart
                      className={`h-4 w-4 ${
                        likeState.isFirstPostLiked ? 'fill-current' : ''
                      }`}
                    />
                    <span className='text-sm ml-1'>
                      {likeState.firstPostLikeCount > 0
                        ? likeState.firstPostLikeCount
                        : '点赞'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
