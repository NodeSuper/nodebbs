import { getTemplate } from '@/templates';
import { LAYOUTS } from '@/templates/constants';
import SearchViewContent from '../components/SearchViewContent';

export default function SearchView() {
  const SidebarLayout = getTemplate(LAYOUTS.SidebarLayout);

  return (
    <SidebarLayout>
      <SearchViewContent />
    </SidebarLayout>
  );
}
