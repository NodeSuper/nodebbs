'use client';

import { Fragment } from 'react';
import { Pager } from '@/components/common/Pagination';
import TimelineItem from './TimelineItem';
import EmptyTimeline from './EmptyTimeline';

/**
 * Twitter 模板的话题列表 — 作为 TopicList 的 component 使用
 * 接收 TopicList 传来的标准 props，用 TimelineItem 渲染
 */
export default function TwitterTopicList({
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
    return <EmptyTimeline />;
  }

  return (
    <>
      <div>
        {topics.map((topic, index) => (
          <Fragment key={topic.id}>
            <TimelineItem topic={topic} />
            {itemInserts?.[index]}
          </Fragment>
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <div className='py-4'>
          <Pager
            total={totalTopics}
            page={currentPage}
            pageSize={limit}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
