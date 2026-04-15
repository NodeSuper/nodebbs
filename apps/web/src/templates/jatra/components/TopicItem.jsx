import Link from '@/components/common/Link';
import UserAvatar from '@/components/user/UserAvatar';
import Time from '@/components/common/Time';
import { ThumbsUp, MessageSquare, Eye, Pin, Lock } from 'lucide-react';

export default function TopicItem({ topic }) {
  const replyCount = Math.max((topic.postCount || 1) - 1, 0);

  return (
    <div className='bg-card rounded-lg border border-border px-6 py-5'>
      <div className='flex gap-3.5'>
        {/* 头像 */}
        <Link href={`/users/${topic.username}`} className='shrink-0 pt-0.5'>
          <UserAvatar
            url={topic.userAvatar}
            name={topic.userName || topic.username}
            size='md'
            frameMetadata={topic.userAvatarFrame?.itemMetadata}
          />
        </Link>

        {/* 内容 */}
        <div className='flex-1 min-w-0'>
          {/* 用户名 · 日期 · 浏览数 */}
          <div className='flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap'>
            <Link
              href={`/users/${topic.username}`}
              className='font-semibold text-primary hover:underline'
            >
              {topic.userName || topic.username}
            </Link>
            {topic.username && (
              <span className='text-muted-foreground/60'>@{topic.username}</span>
            )}
            <span>·</span>
            <Time date={topic.createdAt} fromNow className='shrink-0' />
            {topic.viewCount > 0 && (
              <>
                <span>·</span>
                <span className='flex items-center gap-0.5 shrink-0'>
                  <Eye className='h-3.5 w-3.5' />
                  {topic.viewCount}
                </span>
              </>
            )}
            {topic.isPinned && (
              <Pin className='w-3.5 h-3.5 text-primary shrink-0 ml-auto' />
            )}
            {topic.isClosed && (
              <Lock className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
            )}
          </div>

          {/* 标题 */}
          <Link href={`/topic/${topic.id}`}>
            <h3 className='text-base font-bold text-foreground leading-snug mt-2 break-words line-clamp-2 hover:text-primary transition-colors'>
              {topic.title}
            </h3>
          </Link>

          {/* 摘要 */}
          {topic.snippet && (
            <p className='text-sm text-muted-foreground/80 leading-relaxed mt-1.5 line-clamp-2 break-words'>
              {topic.snippet}
            </p>
          )}

          {/* 互动按钮 */}
          <div className='flex items-center gap-3 mt-4'>
            <Link
              href={`/topic/${topic.id}`}
              className='inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors'
            >
              <ThumbsUp className='h-3.5 w-3.5' />
              <span>赞</span>
              {topic.firstPostLikeCount > 0 && (
                <span className='tabular-nums font-medium'>{topic.firstPostLikeCount}</span>
              )}
            </Link>
            <Link
              href={`/topic/${topic.id}`}
              className='inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors'
            >
              <MessageSquare className='h-3.5 w-3.5' />
              <span>回复</span>
              {replyCount > 0 && (
                <span className='tabular-nums font-medium'>{replyCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
