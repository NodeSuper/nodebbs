import { Trophy, Coins, Crown } from 'lucide-react';
import Link from '@/components/common/Link';
import UserAvatar from '@/components/user/UserAvatar';
import { cn } from '@/lib/utils';
import { getTemplate } from '@/templates';
import { LAYOUTS } from '@/templates/constants';

function Podium({ top3, rankType }) {
  const [first, second, third] = [top3[0], top3[1], top3[2]];

  const PodiumItem = ({ user, rank, className }) => {
    if (!user) return <div className={cn('flex-1', className)} />;
    const isFirst = rank === 1;
    const isSecond = rank === 2;
    const isThird = rank === 3;

    return (
      <div className={cn('flex flex-col items-center z-10', className)}>
        <div className='relative mb-4'>
          {isFirst && <Crown className='absolute -top-7 left-1/2 -translate-x-1/2 w-6 h-6 text-yellow-500 fill-yellow-500 animate-bounce' />}
          <div className={cn('rounded-full p-0.5 border-2', isFirst && 'border-yellow-400', isSecond && 'border-gray-300', isThird && 'border-amber-600')}>
            <UserAvatar url={user.avatar} name={user.name || user.username} size={isFirst ? 'xl' : 'lg'} modifiers='embed,s_200x200' />
          </div>
          <div className={cn('absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full font-bold text-white text-xs flex items-center justify-center', isFirst && 'bg-yellow-500', isSecond && 'bg-gray-400', isThird && 'bg-amber-700')}>
            {rank}
          </div>
        </div>
        <Link href={`/users/${user.username}`} className='text-center p-1.5 rounded hover:bg-muted/50 w-full max-w-28'>
          <div className='font-bold text-sm truncate'>{user.name}</div>
          <div className='flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground'>
            <Coins className='w-3.5 h-3.5' />
            <span className='tabular-nums'>{rankType === 'balance' ? user.balance : user.totalEarned}</span>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className='flex justify-center items-end gap-6 sm:gap-8 py-6 border-b border-border'>
      <PodiumItem user={second} rank={2} className='order-1 flex-1 sm:flex-none' />
      <PodiumItem user={first} rank={1} className='order-2 flex-1 sm:flex-none -mt-6' />
      <PodiumItem user={third} rank={3} className='order-3 flex-1 sm:flex-none' />
    </div>
  );
}

function RankItem({ user, index, rankType, currentUserId }) {
  const isCurrentUser = currentUserId === user.userId;
  const rank = index + 1;

  return (
    <Link href={`/users/${user.username}`} className='flex items-center gap-4 px-6 py-3 hover:bg-accent/30 transition-colors border-b border-border'>
      <span className={cn('w-6 text-center font-bold tabular-nums text-sm text-muted-foreground', isCurrentUser && 'text-primary')}>{rank}</span>
      <UserAvatar url={user.avatar} name={user.name || user.username} size='sm' modifiers='embed,s_200x200' />
      <div className='flex-1 min-w-0'>
        <span className={cn('font-semibold text-sm', isCurrentUser && 'text-primary')}>{user.name}</span>
        {isCurrentUser && <span className='text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-2'>You</span>}
      </div>
      <div className='flex items-center gap-1.5 text-muted-foreground'>
        <Coins className='h-4 w-4 text-yellow-500/70' />
        <span className='font-bold tabular-nums text-sm'>{rankType === 'balance' ? user.balance : user.totalEarned}</span>
      </div>
    </Link>
  );
}

export default function RankView({ rankType, currentUserId, currencyName, ranking }) {
  const SidebarLayout = getTemplate(LAYOUTS.SidebarLayout);

  return (
    <SidebarLayout>
    <div className='bg-card rounded-lg border border-border overflow-hidden'>
      <div className='px-6 py-4 border-b border-border'>
        <h1 className='text-lg font-bold flex items-center gap-2'>
          <Trophy className='h-5 w-5 text-yellow-500' />
          {currencyName}排行榜
        </h1>
      </div>

      <div className='flex border-b border-border'>
        <Link href='/rank?type=balance' scroll={false} replace className={cn('flex-1 text-center py-3 text-sm font-semibold transition-colors relative hover:bg-accent/30', rankType === 'balance' ? 'text-primary' : 'text-muted-foreground')}>
          余额榜
          {rankType === 'balance' && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary' />}
        </Link>
        <Link href='/rank?type=totalEarned' scroll={false} replace className={cn('flex-1 text-center py-3 text-sm font-semibold transition-colors relative hover:bg-accent/30', rankType === 'totalEarned' ? 'text-primary' : 'text-muted-foreground')}>
          财富榜
          {rankType === 'totalEarned' && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary' />}
        </Link>
      </div>

      {ranking.length === 0 ? (
        <div className='text-center py-20'>
          <Trophy className='h-10 w-10 text-muted-foreground/30 mx-auto mb-4' />
          <p className='font-semibold'>暂无排行数据</p>
          <p className='text-sm text-muted-foreground mt-1'>还没有用户获得{currencyName}</p>
        </div>
      ) : (
        <>
          <Podium top3={ranking.slice(0, 3)} rankType={rankType} />
          <div>
            {ranking.slice(3).map((user, index) => (
              <RankItem key={user.userId} user={user} index={index + 3} rankType={rankType} currentUserId={currentUserId} />
            ))}
          </div>
        </>
      )}
    </div>
    </SidebarLayout>
  );
}
