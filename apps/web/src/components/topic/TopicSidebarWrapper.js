'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopicSidebar from '@/components/topic/TopicSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { topicApi } from '@/lib/api';
import { toast } from 'sonner';

export default function TopicSidebarWrapper({ topic, onTopicUpdate }) {
  const router = useRouter();
  const { user, isAuthenticated, openLoginDialog } = useAuth();
  
  const [isBookmarked, setIsBookmarked] = useState(topic.isBookmarked || false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(topic.isSubscribed || false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // 切换收藏状态
  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }

    setBookmarkLoading(true);

    try {
      if (isBookmarked) {
        await topicApi.unbookmark(topic.id);
        setIsBookmarked(false);
        toast.success('已取消收藏');
      } else {
        await topicApi.bookmark(topic.id);
        setIsBookmarked(true);
        toast.success('收藏成功');
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
      toast.error(err.message || '操作失败');
    } finally {
      setBookmarkLoading(false);
    }
  };

  // 切换订阅状态
  const handleToggleSubscribe = async () => {
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }

    setSubscribeLoading(true);

    try {
      if (isSubscribed) {
        await topicApi.unsubscribe(topic.id);
        setIsSubscribed(false);
        toast.success('已取消订阅');
      } else {
        await topicApi.subscribe(topic.id);
        setIsSubscribed(true);
        toast.success('订阅成功，有新回复时会收到通知');
      }
    } catch (err) {
      console.error('订阅操作失败:', err);
      toast.error(err.message || '操作失败');
    } finally {
      setSubscribeLoading(false);
    }
  };

  // 切换主题状态（开启/关闭）
  const handleToggleTopicStatus = async () => {
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }

    try {
      const newClosedState = !topic.isClosed;
      await topicApi.update(topic.id, {
        isClosed: newClosedState,
      });

      toast.success(newClosedState ? '主题已关闭' : '主题已重新开启');
      
      // 更新父组件状态
      if (onTopicUpdate) {
        onTopicUpdate({ isClosed: newClosedState });
      }
      
      router.refresh();
    } catch (err) {
      console.error('操作失败:', err);
      toast.error('操作失败：' + err.message);
    }
  };

  // 编辑话题
  const handleEditTopic = async (editData) => {
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }

    setEditLoading(true);

    try {
      const response = await topicApi.update(topic.id, editData);
      toast.success('话题更新成功');
      setIsEditDialogOpen(false);
      
      // 更新父组件状态
      if (onTopicUpdate) {
        // 将标签字符串数组转换为对象数组格式
        const tagsArray = Array.isArray(editData.tags)
          ? editData.tags.map((tagName, index) => ({
              id: `temp-${index}`, // 临时 ID，刷新后会被服务端数据替换
              name: tagName,
            }))
          : [];

        onTopicUpdate({
          title: editData.title,
          content: editData.content,
          categoryId: editData.categoryId,
          tags: tagsArray,
          updatedAt: response?.updatedAt || new Date().toISOString(),
          editCount: (topic.editCount || 0) + 1,
        });
      }
      
      router.refresh();
    } catch (err) {
      console.error('更新话题失败:', err);
      toast.error(err.message || '更新失败');
      throw err;
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <TopicSidebar
      topic={topic}
      isBookmarked={isBookmarked}
      bookmarkLoading={bookmarkLoading}
      onToggleBookmark={handleToggleBookmark}
      isSubscribed={isSubscribed}
      subscribeLoading={subscribeLoading}
      onToggleSubscribe={handleToggleSubscribe}
      onToggleTopicStatus={handleToggleTopicStatus}
      isEditDialogOpen={isEditDialogOpen}
      setIsEditDialogOpen={setIsEditDialogOpen}
      onEditTopic={handleEditTopic}
      editLoading={editLoading}
      isAuthenticated={isAuthenticated}
      user={user}
    />
  );
}
