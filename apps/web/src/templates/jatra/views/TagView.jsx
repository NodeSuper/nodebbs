import { TopicSortTabs } from '@/components/topic/TopicSortTabs';
import { Pager } from '@/components/common/Pagination';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { getTemplate } from '@/templates';
import { LAYOUTS } from '@/templates/constants';
import TopicItem from '../components/TopicItem';
import EmptyState from '../components/EmptyState';

export default function TagView({ tag, sort, data, page, totalPages, limit }) {
  const SidebarLayout = getTemplate(LAYOUTS.SidebarLayout);

  return (
    <SidebarLayout>
    <div>
      <div className='bg-card rounded-lg border border-border px-6 py-4 mb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <Tag className='h-4 w-4 text-primary' />
          </div>
          <h1 className='text-lg font-bold'>#{tag.name}</h1>
          <Badge variant='secondary' className='text-xs font-normal'>
            {data.total} 个话题
          </Badge>
        </div>
        {tag.description && (
          <p className='text-sm text-muted-foreground mt-1.5'>{tag.description}</p>
        )}
      </div>

      <div className='flex justify-center mb-4'>
        <TopicSortTabs defaultValue={sort} className='w-auto' />
      </div>

      {data.items?.length > 0 ? (
        <div className='space-y-3'>
          {data.items.map((topic) => (
            <TopicItem key={topic.id} topic={topic} />
          ))}
          {totalPages > 1 && (
            <div className='py-3'>
              <Pager total={data.total} page={page} pageSize={limit} />
            </div>
          )}
        </div>
      ) : (
        <div className='bg-card rounded-lg border border-border'>
          <EmptyState />
        </div>
      )}
    </div>
    </SidebarLayout>
  );
}
