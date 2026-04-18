import { getStatsData } from '@/lib/server/topics';
import { getApiInfo } from '@/lib/server/layout';
import { AdSlot } from '@/extensions/ads/components';
import RightSidebar from '../components/RightSidebar';

/**
 * Jatra SidebarLayout（服务端组件）
 * 仅负责右侧栏。各 View 按需调用。
 *
 * 用法：
 *   <SidebarLayout>              → 默认显示 RightSidebar
 *   <SidebarLayout rightSidebar={<Custom />}> → 自定义右侧栏
 *   <SidebarLayout rightSidebar={null}>       → 不显示右侧栏
 */
export default async function SidebarLayout({ children, rightSidebar }) {
  const [stats, apiInfo] = await Promise.all([
    getStatsData(),
    getApiInfo(),
  ]);

  // 如果没有指定自定义右侧栏，使用默认的 RightSidebar
  const sidebarContent = rightSidebar !== undefined
    ? rightSidebar
    : <RightSidebar stats={stats} version={apiInfo?.version} />;

  return (
    <div className='flex flex-col gap-6'>
      <AdSlot slotCode='home_header_banner' className='rounded-lg' />
      <div className='flex gap-8 items-start'>
        <main className='flex-1 min-w-0 flex flex-col gap-6'>
          {children}
        </main>

        {sidebarContent && (
          <aside className='hidden lg:flex flex-col w-70 shrink-0 sticky top-[var(--header-offset)] gap-4'>
            <AdSlot slotCode='home_sidebar_top' />
            {sidebarContent}
            <AdSlot slotCode='home_sidebar_bottom' />
          </aside>
        )}
      </div>
      <AdSlot slotCode='home_footer_banner' className='rounded-lg' />
    </div>
  );
}
