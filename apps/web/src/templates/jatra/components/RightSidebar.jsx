import Link from '@/components/common/Link';
import { Users, Activity, Info } from 'lucide-react';
import { formatCompactNumber } from '@/lib/utils';

function AboutPanel({ stats }) {
  return (
    <div className='rounded-lg border border-border bg-card overflow-hidden'>
      <div className='px-4 py-3 bg-primary/5 border-b border-border'>
        <h3 className='text-sm font-semibold flex items-center gap-2'>
          <Info className='h-4 w-4 text-primary' />
          关于社区
        </h3>
      </div>
      <div className='p-4'>
        <p className='text-sm text-muted-foreground leading-relaxed'>
          社区公告与讨论，分享经验和知识，与其他成员交流互动。
        </p>
        {stats && (
          <div className='mt-4 pt-3 border-t border-border space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>话题</span>
              <span className='font-medium'>{formatCompactNumber(stats.totalTopics)}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>回复</span>
              <span className='font-medium'>{formatCompactNumber(stats.totalPosts)}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>成员</span>
              <span className='font-medium'>{formatCompactNumber(stats.totalUsers)}</span>
            </div>
            {stats.online?.total > 0 && (
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>在线</span>
                <span className='font-medium text-green-600 flex items-center gap-1'>
                  <span className='inline-block h-1.5 w-1.5 bg-green-500 rounded-full' />
                  {formatCompactNumber(stats.online.total)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveMembersPanel({ stats }) {
  if (!stats?.activeUsers?.length) return null;

  return (
    <div className='rounded-lg border border-border bg-card overflow-hidden'>
      <div className='px-4 py-3 border-b border-border'>
        <h3 className='text-sm font-semibold flex items-center gap-2'>
          <Users className='h-4 w-4 text-primary' />
          近期活跃成员
        </h3>
      </div>
      <div className='p-4'>
        <div className='space-y-2.5'>
          {stats.activeUsers.slice(0, 8).map((user) => (
            <Link
              key={user.id || user.username}
              href={`/users/${user.username}`}
              className='flex items-center gap-2.5 group'
            >
              <img
                src={user.avatar || '/default-avatar.png'}
                alt={user.name || user.username}
                className='w-6 h-6 rounded-full object-cover'
              />
              <span className='text-sm text-muted-foreground group-hover:text-primary truncate transition-colors'>
                {user.name || user.username}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function LatestActivityPanel({ stats }) {
  if (!stats?.latestActivities?.length) return null;

  return (
    <div className='rounded-lg border border-border bg-card overflow-hidden'>
      <div className='px-4 py-3 border-b border-border'>
        <h3 className='text-sm font-semibold flex items-center gap-2'>
          <Activity className='h-4 w-4 text-primary' />
          最新动态
        </h3>
      </div>
      <div className='p-4'>
        <div className='space-y-3'>
          {stats.latestActivities.slice(0, 8).map((activity, i) => (
            <div key={i} className='flex items-start gap-2.5 text-sm'>
              <img
                src={activity.userAvatar || '/default-avatar.png'}
                alt={activity.userName}
                className='w-5 h-5 rounded-full object-cover mt-0.5 shrink-0'
              />
              <div className='min-w-0'>
                <span className='font-medium text-foreground'>{activity.userName}</span>
                <span className='text-muted-foreground'> {activity.action} </span>
                {activity.topicTitle && (
                  <Link href={`/topic/${activity.topicId}`} className='text-primary hover:underline truncate'>
                    {activity.topicTitle}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TagsPanel({ tags }) {
  if (!tags?.length) return null;

  return (
    <div className='rounded-lg border border-border bg-card overflow-hidden'>
      <div className='px-4 py-3 border-b border-border'>
        <h3 className='text-sm font-semibold'>热门标签</h3>
      </div>
      <div className='p-4'>
        <div className='flex flex-wrap gap-2'>
          {tags.slice(0, 10).map((tag) => (
            <Link
              key={tag.id || tag.slug}
              href={`/tags/${tag.slug}`}
              className='px-2.5 py-1 rounded text-xs bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors'
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RightSidebar({ stats, tags }) {
  return (
    <div className='space-y-4'>
      <AboutPanel stats={stats} />
      <ActiveMembersPanel stats={stats} />
      <LatestActivityPanel stats={stats} />
      <TagsPanel tags={tags} />
    </div>
  );
}
