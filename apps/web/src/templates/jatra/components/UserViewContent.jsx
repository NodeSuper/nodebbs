'use client';

import { Lock, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/common/Loading';
import Link from '@/components/common/Link';
import UserAvatar from '@/components/user/UserAvatar';
import UserActivityTabs from '@/app/(main)/users/[id]/components/UserActivityTabs';
import FollowButton from '@/components/user/FollowButton';
import SendMessageButton from '@/components/user/SendMessageButton';
import Time from '@/components/common/Time';
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
    <div className='overflow-hidden'>
      <div className='h-24 sm:h-36 bg-gradient-to-r from-primary/12 via-primary/8 to-primary/4' />

      <div className='px-6'>
        <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-8 sm:-mt-10 gap-3'>
          <div className='border-[3px] border-card rounded-full'>
            <UserAvatar
              url={user.avatar}
              name={user.name || user.username}
              size='xl'
              className='h-16 w-16 sm:h-20 sm:w-20'
              frameMetadata={user.avatarFrame?.itemMetadata}
            />
          </div>
          <div className='flex gap-2 sm:mb-1'>
            <SendMessageButton
              recipientId={user.id}
              recipientName={user.name || user.username}
              recipientMessagePermission={user.messagePermission}
              variant='outline'
              size='sm'
              className='rounded-md h-8 text-xs'
            />
            <FollowButton
              userId={user.id}
              username={user.username}
              isFollowing={isFollowing}
              onFollowChange={handleFollowChange}
              className='rounded-md h-8 text-xs font-semibold'
            />
          </div>
        </div>

        <div className='mt-3 pb-5'>
          <h1 className='text-lg font-bold'>{user.name || user.username}</h1>
          <p className='text-sm text-muted-foreground'>@{user.username}</p>

          {user.bio && <p className='text-sm mt-2'>{user.bio}</p>}

          <div className='flex items-center gap-3 mt-2.5 text-sm text-muted-foreground flex-wrap'>
            {user.location && (
              <span className='flex items-center gap-1'>
                <MapPin className='h-3.5 w-3.5' />
                {user.location}
              </span>
            )}
            <span className='flex items-center gap-1'>
              <Calendar className='h-3.5 w-3.5' />
              <Time date={user.createdAt} format='YYYY年M月' /> 加入
            </span>
          </div>

          <div className='flex gap-4 mt-2.5 text-sm'>
            <Link href={`/users/${user.username}/following`} className='hover:underline'>
              <span className='font-bold'>{followingCount}</span>
              <span className='text-muted-foreground ml-1'>关注</span>
            </Link>
            <Link href={`/users/${user.username}/followers`} className='hover:underline'>
              <span className='font-bold'>{followerCount}</span>
              <span className='text-muted-foreground ml-1'>粉丝</span>
            </Link>
          </div>
        </div>
      </div>

      <div>
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
          <div className='px-6 py-12 text-center'>
            <Lock className='h-10 w-10 text-muted-foreground/40 mx-auto mb-3' />
            <h3 className='text-sm font-bold mb-1'>{accessMessage?.title}</h3>
            <p className='text-sm text-muted-foreground mb-4'>{accessMessage?.description}</p>
            {accessMessage?.showLoginButton && (
              <Button onClick={openLoginDialog} size='sm' className='rounded-md text-sm font-semibold'>登录查看</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
