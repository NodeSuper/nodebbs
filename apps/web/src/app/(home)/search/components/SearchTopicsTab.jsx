import { TopicList } from '@/components/topic/TopicList';

/**
 * 话题搜索结果 Tab 组件
 * 纯 UI 组件，接收 props 渲染话题搜索结果
 */
export function SearchTopicsTab({
  loading,
  typeLoading,
  results,
  onLoadPage,
}) {
  const { items, total, page, limit } = results;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className='mt-6'>
      {!loading && !typeLoading && total > 0 && (
        <div className='mb-4 text-sm text-muted-foreground'>
          找到{' '}
          <span className='font-semibold text-foreground'>
            {total}
          </span>{' '}
          个相关话题
        </div>
      )}
      <TopicList
        data={items}
        loading={loading || typeLoading}
        error={null}
        total={total}
        page={page}
        totalPages={totalPages}
        limit={limit}
        showPagination={total > limit}

        onPageChange={(p) => onLoadPage('topics', p)}
      />
    </div>
  );
}
