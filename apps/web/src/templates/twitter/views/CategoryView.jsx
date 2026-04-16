import { getTemplate } from '@/templates';
import { LAYOUTS } from '@/templates/constants';
import TopicListView from '../components/TopicListView';

export default function CategoryView({ category, sort, data, page, totalPages, limit }) {
  const SidebarLayout = getTemplate(LAYOUTS.SidebarLayout);

  return (
    <SidebarLayout>
      <TopicListView
        title={category.name}
        subtitle={`${data.total} 个话题`}
        sort={sort}
        data={data}
        page={page}
        totalPages={totalPages}
        limit={limit}
      />
    </SidebarLayout>
  );
}
