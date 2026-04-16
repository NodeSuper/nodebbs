import { getTemplate } from '@/templates';
import { LAYOUTS } from '@/templates/constants';
import StickyHeader from '../components/StickyHeader';
import TagsContent from './TagsContent';

export default function TagsView({ tags = [] }) {
  const SidebarLayout = getTemplate(LAYOUTS.SidebarLayout);

  return (
    <SidebarLayout>
      <div>
        <StickyHeader title='标签' showBack={false} />
        <TagsContent tags={tags} />
      </div>
    </SidebarLayout>
  );
}
