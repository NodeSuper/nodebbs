import { getTemplate } from '@/templates';
import { LAYOUTS } from '@/templates/constants';
import StickyHeader from '../components/StickyHeader';
import SearchContent from './SearchContent';

export default function SearchView() {
  const SidebarLayout = getTemplate(LAYOUTS.SidebarLayout);

  return (
    <SidebarLayout>
      <div>
        <StickyHeader title='搜索' showBack={false} />
        <SearchContent />
      </div>
    </SidebarLayout>
  );
}
