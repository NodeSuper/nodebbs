'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TopicList } from '@/components/forum/TopicList';
import { Star, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favoriteTopics, setFavoriteTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // 获取收藏列表
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const response = await userApi.getBookmarks(user.username, page, limit);
        setFavoriteTopics(response.items || []);
        setTotal(response.total || 0);
      } catch (err) {
        console.error('Failed to fetch bookmarks:', err);
        setError(err.message || '获取收藏列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground mb-2">我的收藏</h1>
            <p className="text-muted-foreground">你收藏的精彩话题</p>
          </div>
          {!loading && total > 0 && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>{total} 个收藏</span>
            </Badge>
          )}
        </div>
      </div>

      {/* 收藏列表 - 使用 TopicList 受控模式 */}
      {!loading && favoriteTopics.length === 0 && !error ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">还没有收藏</h3>
          <p className="text-muted-foreground mb-4">收藏你感兴趣的话题，方便以后查看</p>
          <Link href="/">
            <Button variant="outline">
              <Sparkles className="h-4 w-4" />
              去发现话题
            </Button>
          </Link>
        </div>
      ) : (
        <TopicList
          data={favoriteTopics}
          loading={loading}
          error={error}
          total={total}
          page={page}
          limit={limit}
          showPagination={true}
          showHeader={true}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
