'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { topicApi, postApi } from '@/lib/api';
import { TopicsList, PostsList } from './UserActivityTabsUI';

export default function UserActivityTabs({ user }) {
  // Topics state
  const [topics, setTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [topicsPage, setTopicsPage] = useState(1);
  const [topicsPageSize] = useState(20);
  const [topicsTotal, setTopicsTotal] = useState(0);

  // Posts state
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [postsPageSize] = useState(20);
  const [postsTotal, setPostsTotal] = useState(0);

  const [activeTab, setActiveTab] = useState('topics');

  // Fetch topics
  const fetchTopics = async (page = topicsPage, limit = topicsPageSize) => {
    setIsLoadingTopics(true);
    try {
      const data = await topicApi.getList({
        userId: user.id,
        page,
        limit,
      });
      setTopics(data.items || []);
      setTopicsTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  // Fetch posts
  const fetchPosts = async (page = postsPage, limit = postsPageSize) => {
    setIsLoadingPosts(true);
    try {
      const data = await postApi.getByUser(user.id, page, limit);
      setPosts(data.items || []);
      setPostsTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Load topics on mount
  useEffect(() => {
    fetchTopics();
  }, []);

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === 'posts' && posts.length === 0) {
      fetchPosts();
    }
  };

  // Handle topics pagination
  const handleTopicsPageChange = (page) => {
    setTopicsPage(page);
    fetchTopics(page, topicsPageSize);
  };

  // Handle posts pagination
  const handlePostsPageChange = (page) => {
    setPostsPage(page);
    fetchPosts(page, postsPageSize);
  };

  return (
    <Tabs
      defaultValue='topics'
      className='w-full'
      onValueChange={handleTabChange}
    >
      <TabsList>
        <TabsTrigger value='topics'>发布的话题</TabsTrigger>
        <TabsTrigger value='posts'>参与的回复</TabsTrigger>
      </TabsList>

      <TabsContent value='topics' className='mt-0'>
        <TopicsList
          topics={topics}
          isLoading={isLoadingTopics}
          total={topicsTotal}
          currentPage={topicsPage}
          pageSize={topicsPageSize}
          onPageChange={handleTopicsPageChange}
        />
      </TabsContent>

      <TabsContent value='posts' className='mt-0'>
        <PostsList
          posts={posts}
          isLoading={isLoadingPosts}
          total={postsTotal}
          currentPage={postsPage}
          pageSize={postsPageSize}
          onPageChange={handlePostsPageChange}
        />
      </TabsContent>
    </Tabs>
  );
}
