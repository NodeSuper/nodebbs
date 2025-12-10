import { getTopicsData } from '@/lib/server/topics';
import { TopicListClient } from '@/components/forum/TopicList';

// 生成页面元数据
export const metadata = {
  title: '热门话题',
  description: '最受关注的讨论话题',
  openGraph: {
    title: '热门话题',
    description: '最受关注的讨论话题',
    type: 'website',
  },
};

export default async function TrendingPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.p) || 1;
  const LIMIT = 50;

  // 服务端获取数据
  const data = await getTopicsData({
    page,
    sort: 'trending',
    limit: LIMIT,
  });

  const totalPages = Math.ceil(data.total / LIMIT);

  return (
    <>
      {/* 页面标题 */}
      <div className='mb-4'>
        <h1 className='text-2xl font-semibold mb-2'>热门话题</h1>
        <p className='text-sm text-muted-foreground'>最受关注的讨论话题</p>
      </div>

      {/* 话题列表 */}
      <TopicListClient
        initialTopics={data.items}
        totalTopics={data.total}
        currentPage={page}
        totalPages={totalPages}
        limit={LIMIT}
        showPagination={true}
        showHeader={true}
      />
    </>
  );
}
