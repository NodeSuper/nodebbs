'use client';

import { Fragment } from 'react';
import { Pager } from '@/components/common/Pagination';
import TopicItem from './TopicItem';
import EmptyState from './EmptyState';

/**
 * Jatra 模板的话题列表 — 作为 TopicList 的 component 使用
 * 接收 TopicList 传来的数据和分页回调，自己控制列表结构
 */
export default function JatraTopicList({
  topics,
  totalTopics,
  currentPage,
  totalPages,
  limit,
  showPagination,
  onPageChange,
  itemInserts,
}) {
  if (topics.length === 0) {
    return (
      <div className='bg-card rounded-lg border border-border'>
        <EmptyState />
      </div>
    );
  }

  return (
    <>
      <div className='space-y-3'>
        {topics.map((topic, index) => (
          <Fragment key={topic.id}>
            <TopicItem topic={topic} />
            {itemInserts?.[index]}
          </Fragment>
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <Pager
          total={totalTopics}
          page={currentPage}
          pageSize={limit}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
