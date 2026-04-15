import { getStatsData, getTagsData } from '@/lib/server/topics';
import RightSidebar from '../components/RightSidebar';

export default async function SidebarLayout({ children }) {
  const [stats, tags] = await Promise.all([
    getStatsData(),
    getTagsData({ limit: 10 }),
  ]);

  return (
    <div className='flex gap-6'>
      <div className='flex-1 min-w-0'>{children}</div>

      <aside className='hidden xl:block w-[280px] shrink-0'>
        <div className='sticky top-[calc(var(--header-offset)+0px)]'>
          <RightSidebar stats={stats} tags={tags} />
        </div>
      </aside>
    </div>
  );
}
