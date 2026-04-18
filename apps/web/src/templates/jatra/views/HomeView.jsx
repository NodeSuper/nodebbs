import { TopicList } from '@/components/topic/TopicList';
import { TopicSortTabs } from '@/components/topic/TopicSortTabs';
import { AdSlot } from '@/extensions/ads/components';
import { getTemplate } from '@/templates';
import { LAYOUTS } from '@/templates/constants';
import JatraTopicList from '../components/JatraTopicList';

/**
 * Jatra 首页视图
 */
export default function HomeView({ title, description, sort, data, page, totalPages, limit }) {
  const SidebarLayout = getTemplate(LAYOUTS.SidebarLayout);

  return (
    <SidebarLayout>
      <div>
        {/* 顶部过滤条 */}
        <div className='flex justify-between items-center gap-3 mb-4'>
          <div>
            <h1 className='text-xl font-bold text-foreground'>{title}</h1>
            {description && (
              <p className='text-sm text-muted-foreground mt-0.5'>{description}</p>
            )}
          </div>
          <TopicSortTabs defaultValue={sort} className='w-auto' />
        </div>

        <TopicList
          initialData={data.items}
          total={data.total}
          currentPage={page}
          totalPages={totalPages}
          limit={limit}
          showPagination={true}
          useUrlPagination={true}
          component={JatraTopicList}
          itemInserts={{
            4: <AdSlot key='ad-topic-inline' slotCode='topic_list_inline' className='rounded-lg' />
          }}
        />
      </div>
    </SidebarLayout>
  );
}
