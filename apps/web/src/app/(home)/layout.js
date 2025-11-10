import { getCategoriesData, getStatsData } from '@/lib/server/topics';
import { Sidebar } from '@/components/forum/Sidebar';
import StickySidebar from '@/components/forum/StickySidebar';

// 强制动态渲染，因为需要读取 cookies
export const dynamic = 'force-dynamic';

export default async function HomeLayout({ children }) {
  // 并行获取分类和统计数据
  const [categories, stats] = await Promise.all([
    getCategoriesData(),
    getStatsData(),
  ]);

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='flex flex-col lg:flex-row gap-6'>
        <div className='w-full lg:w-64 shrink-0'>
          <StickySidebar className='sticky top-[81px]'>
            <Sidebar categories={categories} stats={stats} />
          </StickySidebar>
        </div>
        <main className='flex-1 min-w-0 overflow-hidden'>{children}</main>
      </div>
    </div>
  );
}
