import { getTemplate } from '@/templates';
import { LAYOUTS } from '@/templates/constants';
import TagsViewContent from '../components/TagsViewContent';

export default function TagsView({ tags }) {
  const SidebarLayout = getTemplate(LAYOUTS.SidebarLayout);

  return (
    <SidebarLayout>
      <TagsViewContent tags={tags} />
    </SidebarLayout>
  );
}
