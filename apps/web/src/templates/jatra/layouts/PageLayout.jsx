import { getCategoriesData } from '@/lib/server/topics';
import LeftNav from '../components/LeftNav';

export default async function PageLayout({ children }) {
  const categories = await getCategoriesData({ isFeatured: true });

  return (
    <div className='container mx-auto px-4 py-5'>
      <div className='flex gap-6'>
        {/* 左侧导航 */}
        <aside className='hidden lg:block w-[200px] shrink-0'>
          <div className='sticky top-[calc(var(--header-offset)+0px)]'>
            <LeftNav categories={categories} />
          </div>
        </aside>

        {/* 主内容区 */}
        <div className='flex-1 min-w-0'>{children}</div>
      </div>
    </div>
  );
}
