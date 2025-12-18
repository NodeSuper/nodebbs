'use client';

import { Calendar } from 'lucide-react';
import StickySidebar from '@/components/common/StickySidebar';
import Time from '@/components/common/Time';
import SendMessageButton from '@/components/user/SendMessageButton';
import BlockUserButton from '@/components/user/BlockUserButton';
import ReportUserButton from '@/components/user/ReportUserButton';
import UserProfileClient from '@/components/user/UserProfileClient';
import UserCard from '@/components/user/UserCard';

export default function UserProfileSidebar({ user }) {
  const avatarFrame = user.avatarFrame;
  const badges = user.badges || [];

  return (
    <div className='w-full lg:w-72 shrink-0'>
      <StickySidebar className='sticky top-[81px]' enabled={false}>
        <aside className='space-y-4'>
          {/* 用户头像和基本信息 */}
          <UserCard
            user={user}
            badges={badges}
            variant="default"
            avatarClassName="w-24 h-24"
          />

          <div className='flex flex-col items-center gap-4'>
            {/* 关注按钮和粉丝数（客户端组件） */}
            <UserProfileClient
              username={user.username}
              initialFollowerCount={user.followerCount}
              initialFollowingCount={user.followingCount}
              initialIsFollowing={user.isFollowing}
            />

            {/* 其他操作按钮 */}
            <div className='space-y-2 w-full px-4 md:px-8'>
              <SendMessageButton
                recipientId={user.id}
                recipientName={user.name || user.username}
                recipientMessagePermission={user.messagePermission}
              />
              <BlockUserButton
                userId={user.id}
                username={user.name || user.username}
              />
              <ReportUserButton
                userId={user.id}
                username={user.name || user.username}
              />
            </div>

            {/* 用户详细信息 */}
            <div className='space-y-3 text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Calendar className='h-4 w-4' />
                <span>
                  加入于 <Time date={user.createdAt} format='YYYY年MM月DD日' />
                </span>
              </div>
            </div>
          </div>

          {/* 统计信息 - GitHub 风格 */}
          <div className='border border-border rounded-lg p-4 bg-card'>
            <h2 className='text-sm font-semibold mb-3'>统计</h2>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>发布话题</span>
                <span className='text-sm font-semibold'>
                  {user.topicCount || 0}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>参与回复</span>
                <span className='text-sm font-semibold'>
                  {user.postCount || 0}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </StickySidebar>
    </div>
  );
}
