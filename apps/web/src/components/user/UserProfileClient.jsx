'use client';

import { useState } from 'react';
import FollowButton from '@/components/user/FollowButton';
import { Users } from 'lucide-react';
import Link from 'next/link';

export default function UserProfileClient({
  username,
  initialFollowerCount,
  initialFollowingCount,
  initialIsFollowing,
}) {
  const [followerCount, setFollowerCount] = useState(initialFollowerCount || 0);
  const [followingCount, setFollowingCount] = useState(initialFollowingCount || 0);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing || false);

  const handleFollowChange = (newIsFollowing) => {
    setIsFollowing(newIsFollowing);
    // 更新粉丝数
    setFollowerCount((prev) => (newIsFollowing ? prev + 1 : prev - 1));
  };

  return (
    <>
      {/* 操作按钮 */}
      <div className='mb-4'>
        <FollowButton
          username={username}
          initialIsFollowing={isFollowing}
          onFollowChange={handleFollowChange}
        />
      </div>

      {/* 关注者和粉丝 */}
      <div className='flex items-center gap-4 mb-4 text-sm'>
        <Link
          href={`/users/${username}/followers`}
          className='flex items-center gap-1 hover:text-primary'
        >
          <Users className='h-4 w-4' />
          <span className='font-semibold'>{followerCount}</span>
          <span className='text-muted-foreground'>粉丝</span>
        </Link>
        <Link
          href={`/users/${username}/following`}
          className='flex items-center gap-1 hover:text-primary'
        >
          <span className='font-semibold'>{followingCount}</span>
          <span className='text-muted-foreground'>关注</span>
        </Link>
      </div>
    </>
  );
}
