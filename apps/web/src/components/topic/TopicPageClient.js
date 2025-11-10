'use client';

import { useState } from 'react';
import StickySidebar from '@/components/forum/StickySidebar';
import TopicContent from '@/components/topic/TopicContent';
import ReplySection from '@/components/topic/ReplySection';
import TopicSidebarWrapper from '@/components/topic/TopicSidebarWrapper';

export default function TopicPageClient({
  topic: initialTopic,
  initialPosts,
  totalPosts,
  totalPages,
  currentPage,
  limit,
}) {
  // 统一管理话题状态
  const [topic, setTopic] = useState(initialTopic);

  // 更新话题状态的回调
  const handleTopicUpdate = (updates) => {
    setTopic((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className='container mx-auto px-4 py-6 flex-1'>
      <main className='flex flex-col-reverse md:flex-col lg:flex-row gap-6'>
        {/* 主要内容区域 */}
        <div className='flex-1'>
          {/* 话题内容 */}
          <TopicContent topic={topic} />

          {/* 回复区域（列表+表单） */}
          <ReplySection
            topicId={topic.id}
            initialPosts={initialPosts}
            totalPosts={totalPosts}
            totalPages={totalPages}
            currentPage={currentPage}
            limit={limit}
            isClosed={topic.isClosed}
            isDeleted={topic.isDeleted}
            onTopicUpdate={handleTopicUpdate}
          />
        </div>

        {/* 右侧边栏 */}
        <div className='w-full lg:w-64 shrink-0'>
          <StickySidebar className='sticky top-[107px]'>
            <TopicSidebarWrapper
              topic={topic}
              onTopicUpdate={handleTopicUpdate}
            />
          </StickySidebar>
        </div>
      </main>
    </div>
  );
}
