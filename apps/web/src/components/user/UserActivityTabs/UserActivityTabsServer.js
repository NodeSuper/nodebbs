'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { topicApi, postApi } from '@/lib/api';
import { TopicsList, PostsList } from './UserActivityTabsUI';

export default function UserActivityTabsServer({
  user,
  initialTab,
  initialTopics,
  initialPosts,
  topicsTotal,
  postsTotal,
  currentPage,
  limit,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Topics state
  const [topics, setTopics] = useState(initialTopics);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [topicsPageTotal, setTopicsPageTotal] = useState(topicsTotal);

  // Posts state
  const [posts, setPosts] = useState(initialPosts);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsPageTotal, setPostsPageTotal] = useState(postsTotal);

  const [activeTab, setActiveTab] = useState(initialTab);

  // 更新 URL 参数
  const updateURL = (tab, page = 1) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Fetch topics
  const fetchTopics = async (page = 1) => {
    setIsLoadingTopics(true);
    try {
      const data = await topicApi.getList({
        userId: user.id,
        page,
        limit,
      });
      setTopics(data.items || []);
      setTopicsPageTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  // Fetch posts
  const fetchPosts = async (page = 1) => {
    setIsLoadingPosts(true);
    try {
      const data = await postApi.getByUser(user.id, page, limit);
      setPosts(data.items || []);
      setPostsPageTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
    updateURL(value, 1);

    // 如果切换到标签且没有数据，则加载
    if (value === 'posts' && posts.length === 0) {
      fetchPosts(1);
    } else if (value === 'topics' && topics.length === 0) {
      fetchTopics(1);
    }
  };

  // Handle topics pagination
  const handleTopicsPageChange = (page) => {
    updateURL('topics', page);
    fetchTopics(page);
  };

  // Handle posts pagination
  const handlePostsPageChange = (page) => {
    updateURL('posts', page);
    fetchPosts(page);
  };

  return (
    <Tabs value={activeTab} className='w-full' onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value='topics'>发布的话题</TabsTrigger>
        <TabsTrigger value='posts'>参与的回复</TabsTrigger>
      </TabsList>

      <TabsContent value='topics' className='mt-0'>
        <TopicsList
          topics={topics}
          isLoading={isLoadingTopics}
          total={topicsPageTotal}
          currentPage={currentPage}
          pageSize={limit}
          onPageChange={handleTopicsPageChange}
        />
      </TabsContent>

      <TabsContent value='posts' className='mt-0'>
        <PostsList
          posts={posts}
          isLoading={isLoadingPosts}
          total={postsPageTotal}
          currentPage={currentPage}
          pageSize={limit}
          onPageChange={handlePostsPageChange}
        />
      </TabsContent>
    </Tabs>
  );
}
