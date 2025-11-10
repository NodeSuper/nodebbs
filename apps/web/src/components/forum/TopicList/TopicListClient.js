// 专为SSR优化
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopicListUI } from './TopicListUI';

export default function TopicListClient({
  initialTopics,
  totalTopics,
  currentPage,
  totalPages,
  limit = 20,
  showPagination = true,
  showHeader = true,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topics, setTopics] = useState(initialTopics);

  // 监听服务端数据变化，更新本地状态
  useEffect(() => {
    setTopics(initialTopics);
  }, [initialTopics]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newPage === 1) {
      params.delete('p');
    } else {
      params.set('p', newPage.toString());
    }

    const newUrl = params.toString() ? `?${params}` : '?';
    router.push(newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <TopicListUI
      topics={topics}
      totalTopics={totalTopics}
      currentPage={currentPage}
      totalPages={totalPages}
      limit={limit}
      showPagination={showPagination}
      showHeader={showHeader}
      onPageChange={handlePageChange}
    />
  );
}
