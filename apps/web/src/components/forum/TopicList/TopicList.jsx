'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { topicApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loading } from '@/components/common/Loading';
import { TopicListUI } from './TopicListUI';

export default function TopicList({
  // 受控模式：直接传入数据
  data: controlledTopics,
  loading: controlledLoading,
  error: controlledError,
  total: controlledTotal,
  page: controlledPage,
  totalPages: controlledTotalPages,
  // 非受控模式：自动请求数据
  defaultParams = {},
  limit = 20,
  showPagination = true,
  showHeader = true,
  onDataLoaded,
  onPageChange: externalPageChange,
}) {
  // Next.js 路由 hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 判断是否为受控模式
  const isControlled = controlledTopics !== undefined;

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(!isControlled);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // 从 URL 参数读取页码，默认为 1
  const urlPage = parseInt(searchParams.get('p') || '1', 10);
  const [page, setPage] = useState(urlPage);

  // 监听 URL 变化，同步页码状态
  useEffect(() => {
    const newPage = parseInt(searchParams.get('p') || '1', 10);
    if (newPage !== page && !isControlled) {
      setPage(newPage);
    }
  }, [searchParams, isControlled]);

  // 非受控模式：获取话题列表
  useEffect(() => {
    if (!isControlled) {
      fetchTopics();
    }
  }, [page, JSON.stringify(defaultParams), isControlled]);

  const fetchTopics = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        ...defaultParams,
      };

      const data = await topicApi.getList(params);
      setTopics(data.items);
      setTotal(data.total);
      setTotalPages(Math.ceil(data.total / data.limit));

      if (onDataLoaded) {
        onDataLoaded(data);
      }
    } catch (err) {
      console.error('获取话题列表失败:', err);
      setError(err.message);
      toast.error('获取话题列表失败：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (isControlled) {
      // 受控模式：只调用外部回调
      if (externalPageChange) {
        externalPageChange(newPage);
      }
    } else {
      // 非受控模式：更新 URL 参数
      const params = new URLSearchParams(searchParams.toString());

      if (newPage === 1) {
        // 第一页时移除 p 参数，保持 URL 简洁
        params.delete('p');
      } else {
        params.set('p', newPage.toString());
      }

      // 使用 router.push 更新 URL（保留浏览器历史）
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.push(newUrl, { scroll: false });

      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 受控模式：使用外部传入的数据
  const displayTopics = isControlled ? controlledTopics : topics;
  const displayLoading = isControlled ? controlledLoading : loading;
  const displayError = isControlled ? controlledError : error;
  const displayTotal = isControlled
    ? controlledTotal ?? controlledTopics.length
    : total;
  const displayPage = isControlled ? controlledPage ?? 1 : page;
  const displayTotalPages = isControlled
    ? controlledTotalPages ?? Math.max(1, Math.ceil(displayTotal / limit))
    : totalPages;

  // Loading 状态
  if (displayLoading) {
    return <Loading text='加载中...' className='py-16' />;
  }

  // Error 状态
  if (displayError) {
    return (
      <div className='text-center py-16 border border-border rounded-lg bg-card'>
        <div className='text-destructive font-semibold mb-2'>加载失败</div>
        <p className='text-sm text-muted-foreground mb-4'>{displayError}</p>
        {!isControlled && (
          <Button size='sm' onClick={fetchTopics}>
            重试
          </Button>
        )}
      </div>
    );
  }

  return (
    <TopicListUI
      topics={displayTopics}
      totalTopics={displayTotal}
      currentPage={displayPage}
      totalPages={displayTotalPages}
      limit={limit}
      showPagination={showPagination}
      showHeader={showHeader}
      onPageChange={handlePageChange}
    />
  );
}
