'use client';

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/common/Loading';
import Link from '@/components/common/Link';
import UserAvatar from '@/components/user/UserAvatar';
import UserActivityTabs from '@/app/(main)/users/[id]/components/UserActivityTabs';
import FollowButton from '@/components/user/FollowButton';
import SendMessageButton from '@/components/user/SendMessageButton';
import UserMoreMenu from '@/components/user/UserMoreMenu';
import UserIdentityBadges from '@/components/user/UserIdentityBadges';
import UserMetaRow from '@/components/user/UserMetaRow';
import { useUserProfile } from '@/hooks/user/useUserProfile';
import StickyHeader from '../components/StickyHeader';

export default function UserViewContent({
  user,
  initialTab,
  initialTopics,
  initialPosts,
  topicsTotal,
  postsTotal,
  currentPage,
  limit,
}) {
  const {
    followerCount,
    followingCount,
    isFollowing,
    handleFollowChange,
    canViewContent,
    accessMessage,
    needsAuthCheck,
    authLoading,
    openLoginDialog,
  } = useUserProfile({
    user,
    initialFollowerCount: user.followerCount,
    initialFollowingCount: user.followingCount,
    initialIsFollowing: user.isFollowing,
  });

  return (
    <div>
      <StickyHeader
        title={user.name || user.username}
        subtitle={`${topicsTotal} 个帖子`}
      />

      {/* Banner */}
      <div className='h-32 sm:h-48 bg-gradient-to-r from-primary/20 to-primary/5' />

      {/* 头像 + 操作按钮 */}
      <div className='px-4'>
        <div className='flex items-start gap-2 -mt-10 sm:-mt-16 flex-wrap'>
          <div className='border-4 border-background rounded-full shrink-0'>
            <UserAvatar
              url={user.avatar}
              name={user.name || user.username}
              size='xl'
              className='h-20 w-20 sm:h-32 sm:w-32'
              frameMetadata={user.avatarFrame?.itemMetadata}
            />
          </div>
          <div className='flex items-center gap-2 basis-full sm:basis-auto sm:ml-auto sm:mt-3 justify-end'>
            <SendMessageButton
              recipientId={user.id}
              recipientName={user.name || user.username}
              recipientMessagePermission={user.messagePermission}
              variant='outline'
              className='rounded-full'
            />
            <FollowButton
              userId={user.id}
              username={user.username}
              isFollowing={isFollowing}
              onFollowChange={handleFollowChange}
              className='rounded-full font-bold'
            />
            <UserMoreMenu
              userId={user.id}
              username={user.name || user.username}
              className='rounded-full text-muted-foreground hover:text-foreground shrink-0'
            />
          </div>
        </div>

        {/* 用户信息 */}
        <div className='mt-3'>
          <h2 className='text-xl font-extrabold'>{user.name || user.username}</h2>
          <UserIdentityBadges user={user} badges={user.badges} size='md' className='mt-1.5' />

          {user.bio && (
            <p className='text-[15px] mt-3'>{user.bio}</p>
          )}

          <UserMetaRow
            user={user}
            iconClassName='h-4 w-4 shrink-0'
            className='mt-3 text-[15px] text-muted-foreground'
          />

          {/* 关注/粉丝 */}
          <div className='flex gap-4 mt-3'>
            <Link href={`/users/${user.username}/following`} className='hover:underline'>
              <span className='font-bold'>{followingCount}</span>
              <span className='text-muted-foreground ml-1'>正在关注</span>
            </Link>
            <Link href={`/users/${user.username}/followers`} className='hover:underline'>
              <span className='font-bold'>{followerCount}</span>
              <span className='text-muted-foreground ml-1'>关注者</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className='mt-4'>
        {(!needsAuthCheck || canViewContent) && !authLoading ? (
          <UserActivityTabs
            userId={user.id}
            initialTab={initialTab}
            initialTopics={initialTopics}
            initialPosts={initialPosts}
            topicsTotal={topicsTotal}
            postsTotal={postsTotal}
            currentPage={currentPage}
            limit={limit}
          />
        ) : authLoading ? (
          <Loading className='py-12' />
        ) : (
          <div className='px-4 py-12 text-center'>
            <Lock className='h-10 w-10 text-muted-foreground/50 mx-auto mb-4' />
            <h3 className='text-lg font-bold mb-2'>{accessMessage?.title}</h3>
            <p className='text-sm text-muted-foreground mb-4'>{accessMessage?.description}</p>
            {accessMessage?.showLoginButton && (
              <Button onClick={openLoginDialog} className='rounded-full font-bold'>登录查看</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
