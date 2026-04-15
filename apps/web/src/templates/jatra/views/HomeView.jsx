import { TopicSortTabs } from '@/components/topic/TopicSortTabs';
import { Pager } from '@/components/common/Pagination';
import { getTemplate } from '@/templates';
import { LAYOUTS } from '@/templates/constants';
import TopicItem from '../components/TopicItem';
import EmptyState from '../components/EmptyState';

export default function HomeView({ title, description, sort, data, page, totalPages, limit }) {
  const SidebarLayout = getTemplate(LAYOUTS.SidebarLayout);

  return (
    <SidebarLayout>
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
    </SidebarLayout>
  );
}
