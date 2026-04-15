import Link from '@/components/common/Link';
import { Tag } from 'lucide-react';
import Time from '@/components/common/Time';
import { formatCompactNumber } from '@/lib/utils';
import { getTemplate } from '@/templates';
import { LAYOUTS } from '@/templates/constants';

export function CategoriesView({ categories }) {
  const SidebarLayout = getTemplate(LAYOUTS.SidebarLayout);

  return (
    <SidebarLayout>
    <div className='bg-card rounded-lg border border-border overflow-hidden'>
      <div className='px-6 py-4 border-b border-border'>
        <h1 className='text-lg font-bold'>所有分类</h1>
      </div>

      {categories.length === 0 ? (
        <div className='text-center py-20 text-muted-foreground'>
          <Tag className='h-10 w-10 text-muted-foreground/30 mx-auto mb-4' />
          <p className='font-semibold'>暂无分类</p>
          <p className='text-sm mt-1'>还没有创建任何分类</p>
        </div>
      ) : (
        <div>
          {categories.map((category) => (
            <div key={category.id} className='border-b border-border last:border-b-0'>
              <Link
                href={`/categories/${category.slug}`}
                className='flex items-center gap-3 px-6 py-4 hover:bg-accent/30 transition-colors'
              >
                <div className='w-4 h-4 rounded shrink-0' style={{ backgroundColor: category.color }} />
                <div className='flex-1 min-w-0'>
                  <div className='font-semibold text-sm'>{category.name}</div>
                  {category.description && (
                    <p className='text-sm text-muted-foreground line-clamp-1 mt-0.5'>{category.description}</p>
                  )}
                </div>
                <div className='text-right shrink-0 text-sm text-muted-foreground'>
                  <div>{formatCompactNumber(category.totalTopics || category.topicCount || 0)} 话题</div>
                  {category.latestTopic && (
                    <div className='mt-0.5'>
                      <Time date={category.latestTopic.updatedAt} fromNow />
                    </div>
                  )}
                </div>
              </Link>

              {category.subcategories?.length > 0 && (
                <div className='bg-muted/20'>
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/categories/${sub.slug}`}
                      className='flex items-center gap-3 pl-14 pr-6 py-2.5 hover:bg-accent/30 transition-colors'
                    >
                      <div className='w-2.5 h-2.5 rounded-sm shrink-0' style={{ backgroundColor: sub.color }} />
                      <span className='text-sm truncate'>{sub.name}</span>
                      <span className='text-xs text-muted-foreground ml-auto shrink-0'>
                        {formatCompactNumber(sub.topicCount || 0)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </SidebarLayout>
  );
}
