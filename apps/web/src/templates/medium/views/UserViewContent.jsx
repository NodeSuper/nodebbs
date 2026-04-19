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
      {/* 用户信息 */}
      <div className='py-6 sm:py-8 border-b border-border/60'>
        <div className='flex items-start gap-4 sm:gap-5 flex-wrap'>
          <UserAvatar
            url={user.avatar}
            name={user.name || user.username}
            size='xl'
            className='h-16 w-16 sm:h-20 sm:w-20 shrink-0'
            frameMetadata={user.avatarFrame?.itemMetadata}
          />
          <div className='flex-1 min-w-0'>
            <h1 className='text-xl sm:text-2xl font-bold break-words' style={{ fontFamily: 'var(--font-serif)' }}>
              {user.name || user.username}
            </h1>
            <UserIdentityBadges user={user} badges={user.badges} size='md' className='mt-2' />

            {user.bio && <p className='mt-3 text-[15px] break-words'>{user.bio}</p>}

            <UserMetaRow
              user={user}
              className='mt-3 text-sm text-muted-foreground gap-x-3 sm:gap-x-4 gap-y-1.5'
            >
              <Link href={`/users/${user.username}/followers`} className='hover:text-foreground'>
                <span className='font-semibold text-foreground'>{followerCount}</span> 关注者
              </Link>
              <Link href={`/users/${user.username}/following`} className='hover:text-foreground'>
                <span className='font-semibold text-foreground'>{followingCount}</span> 关注
              </Link>
            </UserMetaRow>
          </div>

          {/* 操作区: 移动端换行全宽, 桌面端右对齐 */}
          <div className='flex items-center gap-2 basis-full sm:basis-auto sm:shrink-0'>
            <SendMessageButton
              recipientId={user.id}
              recipientName={user.name || user.username}
              recipientMessagePermission={user.messagePermission}
              variant='outline'
              className='flex-1 sm:flex-none rounded-full'
            />
            <FollowButton
              userId={user.id}
              username={user.username}
              isFollowing={isFollowing}
              onFollowChange={handleFollowChange}
              className='flex-1 sm:flex-none rounded-full'
            />
            <UserMoreMenu
              userId={user.id}
              username={user.name || user.username}
              className='rounded-full text-muted-foreground hover:text-foreground shrink-0'
            />
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className='pt-6'>
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
          <div className='py-16 text-center'>
            <Lock className='h-10 w-10 text-muted-foreground/30 mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>{accessMessage?.title}</h3>
            <p className='text-sm text-muted-foreground mb-4'>{accessMessage?.description}</p>
            {accessMessage?.showLoginButton && (
              <Button onClick={openLoginDialog} variant='outline' className='rounded-full'>登录查看</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
