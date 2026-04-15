import { TopicSortTabs } from '@/components/topic/TopicSortTabs';
import { Pager } from '@/components/common/Pagination';
import { getTemplate } from '@/templates';
import { LAYOUTS } from '@/templates/constants';
import TopicItem from '../components/TopicItem';
import EmptyState from '../components/EmptyState';

export default function CategoryView({ category, sort, data, page, totalPages, limit }) {
  const SidebarLayout = getTemplate(LAYOUTS.SidebarLayout);

  return (
    <SidebarLayout>
    <div>
      <div className='bg-card rounded-lg border border-border px-6 py-4 mb-4'>
        <div className='flex items-center gap-2.5'>
          <div className='w-4 h-4 rounded-sm shrink-0' style={{ backgroundColor: category.color }} />
          <h1 className='text-lg font-bold'>{category.name}</h1>
          <span className='text-sm text-muted-foreground'>{data.total} 个话题</span>
        </div>
        {category.description && (
          <p className='text-sm text-muted-foreground mt-1.5 ml-6'>{category.description}</p>
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
