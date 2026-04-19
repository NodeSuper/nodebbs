import { Badge } from '@/components/ui/badge';
import UserBadge from '@/extensions/badges/components/Badge';
import { cn } from '@/lib/utils';

/**
 * 用户角色 Badge (单个 pill)
 */
export function UserRoleBadge({ user, className }) {
  if (!user?.displayRole) return null;
  return (
    <Badge
      variant='secondary'
      className={cn('bg-primary/10 text-primary', className)}
    >
      {user.displayRole.name}
    </Badge>
  );
}

/**
 * 勋章列表
 * @param {Array} badges - 勋章数据 (兼容 Badge object 或 UserBadge object)
 * @param {'md'|'lg'|'xl'} size - 勋章尺寸
 */
export function UserBadgesList({ badges = [], size = 'md', className }) {
  if (!badges || badges.length === 0) return null;
  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      {badges.map((item) => {
        const badge = item.badge || item;
        return (
          <UserBadge
            key={badge.id || badge.slug}
            badge={badge}
            userBadge={item.badge ? item : null}
            size={size}
            className='transition-transform hover:scale-110'
          />
        );
      })}
    </div>
  );
}

/**
 * 用户身份组合行 — 角色 Badge + 勋章在同一行展示
 * 适用于横向布局的头部 (medium/twitter 模板)
 * UserCard 的垂直布局应直接使用 UserRoleBadge + UserBadgesList 各自渲染
 */
export default function UserIdentityBadges({
  user,
  badges = [],
  size = 'md',
  className,
}) {
  const hasRole = !!user?.displayRole;
  const hasBadges = badges && badges.length > 0;
  if (!hasRole && !hasBadges) return null;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <UserRoleBadge user={user} />
      <UserBadgesList badges={badges} size={size} />
    </div>
  );
}
