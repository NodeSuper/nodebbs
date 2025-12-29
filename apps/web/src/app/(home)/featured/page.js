import { getTopicsData } from '@/lib/server/topics';
import { TopicList } from '@/components/topic/TopicList';

// 生成页面元数据
export const metadata = {
  title: '精华话题',
  description: '高质量的讨论和置顶话题',
  openGraph: {
    title: '精华话题',
    description: '高质量的讨论和置顶话题',
    type: 'website',
  },
};

export default async function FeaturedPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.p) || 1;
  const LIMIT = 50;

  // 服务端获取数据
  const data = await getTopicsData({
    page,
    sort: 'popular',
    limit: LIMIT,
  });

  const totalPages = Math.ceil(data.total / LIMIT);

  return (
    <>
      {/* 页面标题 */}
      <div className='mb-4'>
        <h1 className='text-2xl font-semibold mb-2'>精华话题</h1>
        <p className='text-sm text-muted-foreground'>高质量的讨论和置顶话题</p>
      </div>

      {/* 话题列表 */}
      <TopicList
        initialData={data.items}
        total={data.total}
        currentPage={page}
        totalPages={totalPages}
        limit={LIMIT}
        showPagination={true}

        useUrlPagination={true}
      />
    </>
  );
}
