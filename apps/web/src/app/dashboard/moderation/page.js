'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { moderationApi } from '@/lib/api';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Loading } from '@/components/common/Loading';

export default function ContentModerationPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({ totalTopics: 0, totalPosts: 0 });

  useEffect(() => {
    loadPendingContent();
  }, [activeTab]);

  const loadPendingContent = async () => {
    setLoading(true);
    try {
      const data = await moderationApi.getPending(activeTab, 1, 50);
      setItems(data.items || []);
      setStats({
        totalTopics: data.totalTopics || 0,
        totalPosts: data.totalPosts || 0,
      });
    } catch (error) {
      console.error('Failed to load pending content:', error);
      toast.error('加载待审核内容失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (type, id) => {
    try {
      await moderationApi.approve(type, id);
      toast.success(`${type === 'topic' ? '话题' : '回复'}已批准`);
      loadPendingContent();
    } catch (error) {
      console.error('Failed to approve:', error);
      toast.error('批准失败');
    }
  };

  const handleReject = async (type, id) => {
    try {
      await moderationApi.reject(type, id);
      toast.success(`${type === 'topic' ? '话题' : '回复'}已拒绝`);
      loadPendingContent();
    } catch (error) {
      console.error('Failed to reject:', error);
      toast.error('拒绝失败');
    }
  };

  return (
    <div className='space-y-6'>
      {/* Page header */}
      <div>
        <h2 className='text-2xl font-semibold mb-2'>内容审核</h2>
        <p className='text-sm text-muted-foreground'>审核待发布的话题和回复</p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='border border-border rounded-lg p-4 bg-card'>
          <div className='flex items-center gap-3'>
            <Clock className='h-5 w-5 text-yellow-500' />
            <div>
              <p className='text-sm text-muted-foreground'>待审核话题</p>
              <p className='text-2xl font-semibold'>{stats.totalTopics}</p>
            </div>
          </div>
        </div>
        <div className='border border-border rounded-lg p-4 bg-card'>
          <div className='flex items-center gap-3'>
            <Clock className='h-5 w-5 text-yellow-500' />
            <div>
              <p className='text-sm text-muted-foreground'>待审核回复</p>
              <p className='text-2xl font-semibold'>{stats.totalPosts}</p>
            </div>
          </div>
        </div>
        <div className='border border-border rounded-lg p-4 bg-card'>
          <div className='flex items-center gap-3'>
            <Clock className='h-5 w-5 text-yellow-500' />
            <div>
              <p className='text-sm text-muted-foreground'>总计</p>
              <p className='text-2xl font-semibold'>
                {stats.totalTopics + stats.totalPosts}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='all'>全部</TabsTrigger>
          <TabsTrigger value='topic'>话题</TabsTrigger>
          <TabsTrigger value='post'>回复</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className='space-y-4 mt-6'>
          {loading ? (
            <Loading text='加载中...' />
          ) : items.length === 0 ? (
            <div className='border border-border rounded-lg p-12 bg-card'>
              <div className='text-center text-muted-foreground'>
                <Clock className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>暂无待审核内容</p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className='border border-border rounded-lg p-6 bg-card hover:border-muted-foreground/50 transition-colors'
              >
                <div className='space-y-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Badge
                          variant={
                            item.type === 'topic' ? 'default' : 'secondary'
                          }
                        >
                          {item.type === 'topic' ? '话题' : '回复'}
                        </Badge>
                        <span className='text-sm text-muted-foreground'>
                          由 {item.username} 发布于{' '}
                          {new Date(item.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>

                      {item.type === 'topic' ? (
                        <div>
                          <h3 className='text-lg font-semibold mb-2'>
                            {item.title}
                          </h3>
                          {item.content && (
                            <p className='text-sm text-muted-foreground mb-2 line-clamp-3'>
                              {item.content}
                            </p>
                          )}
                          <Link
                            href={`/topic/${item.id}`}
                            className='text-sm text-primary hover:underline'
                          >
                            查看详情 →
                          </Link>
                        </div>
                      ) : (
                        <div>
                          <p className='text-sm text-muted-foreground mb-2'>
                            回复话题:{' '}
                            <Link
                              href={`/topic/${item.topicId}`}
                              className='text-primary hover:underline'
                            >
                              {item.topicTitle}
                            </Link>
                          </p>
                          <p className='text-sm line-clamp-3'>{item.content}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      onClick={() => handleApprove(item.type, item.id)}
                      className='gap-2'
                    >
                      <CheckCircle className='h-4 w-4' />
                      批准
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={() => handleReject(item.type, item.id)}
                      className='gap-2'
                    >
                      <XCircle className='h-4 w-4' />
                      拒绝
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
