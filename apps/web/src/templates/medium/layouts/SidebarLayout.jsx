import { getStatsData, getTagsData } from '@/lib/server/topics';
import { AdSlot } from '@/extensions/ads/components';
import RecommendSidebar from '../components/RecommendSidebar';

export default async function SidebarLayout({ children }) {
  const [stats, tags] = await Promise.all([
    getStatsData(),
    getTagsData({ limit: 10 }),
  ]);

  return (
    <div className='flex justify-center'>
      <div className='flex w-full max-w-[1100px]'>
        {/* 主内容区 */}
        <div className='flex-1 min-w-0 max-w-[728px] mx-auto px-6 lg:px-10 py-8 xl:mx-0 xl:border-r xl:border-border space-y-6'>
          <AdSlot slotCode='home_header_banner' className='rounded-lg' />
          {children}
          <AdSlot slotCode='home_footer_banner' className='rounded-lg' />
        </div>

        {/* 右侧推荐栏 — 桌面端 */}
        <aside className='hidden xl:block w-[368px] shrink-0 px-8 py-8'>
          <div className='sticky top-[calc(var(--header-offset)+32px)] space-y-6'>
            <AdSlot slotCode='home_sidebar_top' />
            <RecommendSidebar stats={stats} tags={tags} />
            <AdSlot slotCode='home_sidebar_bottom' />
          </div>
        </aside>
      </div>
    </div>
  );
}
