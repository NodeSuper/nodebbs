'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderTree, FileText, MessageSquare } from 'lucide-react';
import { categoryApi, userApi, topicApi } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    totalTopics: 0,
    totalPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 这里可以创建专门的统计 API，暂时用现有 API 获取
      const [categories, topics] = await Promise.all([
        categoryApi.getAll(),
        topicApi.getList({ limit: 1 }),
      ]);

      setStats({
        totalUsers: 0, // 需要添加用户统计 API
        totalCategories: categories.length || 0,
        totalTopics: topics.total || 0,
        totalPosts: 0, // 需要添加帖子统计 API
      });
    } catch (err) {
      console.error('获取统计数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '总用户数',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: '分类数量',
      value: stats.totalCategories,
      icon: FolderTree,
      color: 'text-green-500',
    },
    {
      title: '话题数量',
      value: stats.totalTopics,
      icon: FileText,
      color: 'text-purple-500',
    },
    {
      title: '回复数量',
      value: stats.totalPosts,
      icon: MessageSquare,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">数据概览</h2>
        <p className="text-sm text-muted-foreground">
          查看论坛的关键统计数据和活动概况
        </p>
      </div>

      {/* Stats grid - GitHub style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="border border-border rounded-lg p-4 bg-card hover:border-muted-foreground/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">
                  {stat.title}
                </span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-semibold">
                {loading ? '-' : stat.value.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="border border-border rounded-lg bg-card">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold">快速操作</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            使用左侧导航栏访问各个管理功能，管理论坛的分类、用户、标签和内容。
          </p>
        </div>
      </div>
    </div>
  );
}
