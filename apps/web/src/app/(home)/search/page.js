'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TopicList } from '@/components/topic/TopicList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { searchApi } from '@/lib/api';
import {
  Search,
  ArrowLeft,
  Filter,
  X,
  Loader2,
  User,
  FileText,
  Hash,
} from 'lucide-react';
import Link from 'next/link';
import UserAvatar from '@/components/user/UserAvatar';
import { Loading } from '@/components/common/Loading';

function SearchResults() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('s') || '';
  const typeParam = searchParams.get('type') || 'topics';

  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState(typeParam);
  const [searchResults, setSearchResults] = useState({
    topics: { items: [], total: 0, page: 1, limit: 20 },
    posts: { items: [], total: 0, page: 1, limit: 20 },
    users: { items: [], total: 0, page: 1, limit: 20 },
  });
  const [loadingTypes, setLoadingTypes] = useState({
    topics: false,
    posts: false,
    users: false,
  });

  // 初始搜索：当搜索关键词改变时，使用 type='all' 获取所有类型的第一页
  useEffect(() => {
    if (searchQuery.trim()) {
      performInitialSearch();
    } else {
      setSearchResults({
        topics: { items: [], total: 0, page: 1, limit: 20 },
        posts: { items: [], total: 0, page: 1, limit: 20 },
        users: { items: [], total: 0, page: 1, limit: 20 },
      });
    }
  }, [searchQuery]);

  // 初始搜索：获取所有类型的数据
  const performInitialSearch = async () => {
    setLoading(true);
    try {
      const data = await searchApi.search(searchQuery.trim(), 'all', 1, 20);
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载特定类型的特定页
  const loadTypePage = async (type, page) => {
    setLoadingTypes((prev) => ({ ...prev, [type]: true }));
    try {
      const data = await searchApi.search(searchQuery.trim(), type, page, 20);
      setSearchResults((prev) => ({
        ...prev,
        [type]: data[type],
      }));
    } catch (error) {
      console.error(`Failed to load ${type} page ${page}:`, error);
    } finally {
      setLoadingTypes((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <>
      {/* 搜索标题 */}
      <div className='mb-6'>
        <div className='flex items-center space-x-3 mb-2'>
          <Search className='h-6 w-6 text-foreground' />
          <h1 className='text-2xl font-bold text-foreground'>搜索结果</h1>
        </div>

        {searchQuery && (
          <div className='flex items-center space-x-2 mt-3'>
            <span className='text-muted-foreground'>搜索关键词:</span>
            <Badge variant='secondary' className='text-base px-3 py-1'>
              {searchQuery}
            </Badge>
            <Link href='/search'>
              <Button variant='ghost' size='sm' className='h-7'>
                <X className='h-4 w-4' />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 搜索类型标签页 */}
      {searchQuery && (
        <Tabs value={searchType} onValueChange={setSearchType} className='mb-6'>
          <TabsList>
            <TabsTrigger value='topics' className='flex items-center gap-1.5'>
              <FileText className='h-4 w-4' />
              <span>话题</span>
              {!loading && searchResults.topics.total > 0 && (
                <span className='text-xs opacity-70'>
                  ({searchResults.topics.total})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value='posts' className='flex items-center gap-1.5'>
              <Hash className='h-4 w-4' />
              <span>回复</span>
              {!loading && searchResults.posts.total > 0 && (
                <span className='text-xs opacity-70'>
                  ({searchResults.posts.total})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value='users' className='flex items-center gap-1.5'>
              <User className='h-4 w-4' />
              <span>用户</span>
              {!loading && searchResults.users.total > 0 && (
                <span className='text-xs opacity-70'>
                  ({searchResults.users.total})
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* 话题结果 */}
          {searchType === 'topics' && (
            <TabsContent value='topics' className='mt-6'>
              {!loading &&
                !loadingTypes.topics &&
                searchResults.topics.total > 0 && (
                  <div className='mb-4 text-sm text-muted-foreground'>
                    找到{' '}
                    <span className='font-semibold text-foreground'>
                      {searchResults.topics.total}
                    </span>{' '}
                    个相关话题
                  </div>
                )}
              <TopicList
                data={searchResults.topics.items}
                loading={loading || loadingTypes.topics}
                error={null}
                total={searchResults.topics.total}
                page={searchResults.topics.page}
                totalPages={Math.ceil(
                  searchResults.topics.total / searchResults.topics.limit
                )}
                limit={searchResults.topics.limit}
                showPagination={
                  searchResults.topics.total > searchResults.topics.limit
                }
                showHeader={false}
                onPageChange={(page) => loadTypePage('topics', page)}
              />
            </TabsContent>
          )}

          {/* 回复结果 */}
          {searchType === 'posts' && (
            <TabsContent value='posts' className='mt-6'>
              {(loading || loadingTypes.posts) && (
                <Loading text='加载中...' className='py-16' />
              )}
              {!loading &&
                !loadingTypes.posts &&
                searchResults.posts.total === 0 && (
                  <div className='text-center py-16 bg-card border border-border rounded-lg'>
                    <Hash className='h-12 w-12 text-muted-foreground/50 mx-auto mb-4' />
                    <div className='text-lg font-medium text-foreground mb-2'>
                      未找到相关回复
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      尝试使用不同的关键词搜索
                    </p>
                  </div>
                )}
              {!loading &&
                !loadingTypes.posts &&
                searchResults.posts.total > 0 && (
                  <>
                    <div className='mb-4 text-sm text-muted-foreground'>
                      找到{' '}
                      <span className='font-semibold text-foreground'>
                        {searchResults.posts.total}
                      </span>{' '}
                      个相关回复
                    </div>
                    <div className='space-y-3'>
                      {searchResults.posts.items.map((post) => (
                        <Link
                          key={post.id}
                          href={`/topic/${post.topicId}#post-${post.id}`}
                          className='block bg-card border border-border rounded-lg p-4 hover:bg-accent/50 transition-all'
                        >
                          <div className='text-sm font-medium text-muted-foreground mb-2'>
                            {post.topicTitle}
                          </div>
                          <div className='text-card-foreground line-clamp-3 mb-3'>
                            {post.content}
                          </div>
                          <div className='flex items-center text-xs text-muted-foreground'>
                            <span className='font-medium'>{post.username}</span>
                            <span className='mx-2'>·</span>
                            <span>#{post.postNumber}</span>
                            <span className='mx-2'>·</span>
                            <span>
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {/* 回复分页 */}
                    {searchResults.posts.total > searchResults.posts.limit && (
                      <div className='flex justify-center mt-6'>
                        <div className='flex items-center gap-1'>
                          <Button
                            variant='outline'
                            size='sm'
                            disabled={searchResults.posts.page === 1}
                            onClick={() =>
                              loadTypePage(
                                'posts',
                                searchResults.posts.page - 1
                              )
                            }
                            className='text-sm'
                          >
                            上一页
                          </Button>
                          <span className='text-sm text-muted-foreground px-4'>
                            第 {searchResults.posts.page} 页 / 共{' '}
                            {Math.ceil(
                              searchResults.posts.total /
                                searchResults.posts.limit
                            )}{' '}
                            页
                          </span>
                          <Button
                            variant='outline'
                            size='sm'
                            disabled={
                              searchResults.posts.page >=
                              Math.ceil(
                                searchResults.posts.total /
                                  searchResults.posts.limit
                              )
                            }
                            onClick={() =>
                              loadTypePage(
                                'posts',
                                searchResults.posts.page + 1
                              )
                            }
                            className='text-sm'
                          >
                            下一页
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
            </TabsContent>
          )}

          {/* 用户结果 */}
          {searchType === 'users' && (
            <TabsContent value='users' className='mt-6'>
              {(loading || loadingTypes.users) && (
                <Loading text='加载中...' className='py-16' />
              )}
              {!loading &&
                !loadingTypes.users &&
                searchResults.users.total === 0 && (
                  <div className='text-center py-16 bg-card border border-border rounded-lg'>
                    <User className='h-12 w-12 text-muted-foreground/50 mx-auto mb-4' />
                    <div className='text-lg font-medium text-foreground mb-2'>
                      未找到相关用户
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      尝试使用不同的关键词搜索
                    </p>
                  </div>
                )}
              {!loading &&
                !loadingTypes.users &&
                searchResults.users.total > 0 && (
                  <>
                    <div className='mb-4 text-sm text-muted-foreground'>
                      找到{' '}
                      <span className='font-semibold text-foreground'>
                        {searchResults.users.total}
                      </span>{' '}
                      个相关用户
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {searchResults.users.items.map((user) => (
                        <Link
                          key={user.id}
                          href={`/users/${user.username}`}
                          className='block bg-card border border-border rounded-lg p-4 hover:bg-accent/50 hover:border-accent-foreground/20 transition-all'
                        >
                          <div className='flex items-center space-x-3'>
                            <UserAvatar
                              url={user.avatar}
                              name={user.username}
                              size='lg'
                            />
                            <div className='flex-1 min-w-0'>
                              <div className='font-medium text-card-foreground truncate'>
                                {user.name || user.username}
                              </div>
                              <div className='text-sm text-muted-foreground truncate'>
                                @{user.username}
                              </div>
                              {user.bio && (
                                <div className='text-xs text-muted-foreground line-clamp-1 mt-1'>
                                  {user.bio}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {/* 用户分页 */}
                    {searchResults.users.total > searchResults.users.limit && (
                      <div className='flex justify-center mt-6'>
                        <div className='flex items-center gap-1'>
                          <Button
                            variant='outline'
                            size='sm'
                            disabled={searchResults.users.page === 1}
                            onClick={() =>
                              loadTypePage(
                                'users',
                                searchResults.users.page - 1
                              )
                            }
                            className='text-sm'
                          >
                            上一页
                          </Button>
                          <span className='text-sm text-muted-foreground px-4'>
                            第 {searchResults.users.page} 页 / 共{' '}
                            {Math.ceil(
                              searchResults.users.total /
                                searchResults.users.limit
                            )}{' '}
                            页
                          </span>
                          <Button
                            variant='outline'
                            size='sm'
                            disabled={
                              searchResults.users.page >=
                              Math.ceil(
                                searchResults.users.total /
                                  searchResults.users.limit
                              )
                            }
                            onClick={() =>
                              loadTypePage(
                                'users',
                                searchResults.users.page + 1
                              )
                            }
                            className='text-sm'
                          >
                            下一页
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* 空搜索状态 */}
      {!searchQuery && (
        <div className='text-center py-20 bg-card border border-border rounded-lg'>
          <Search className='h-16 w-16 text-muted-foreground/50 mx-auto mb-4' />
          <div className='text-xl font-medium text-foreground mb-2'>
            请输入搜索关键词
          </div>
          <p className='text-sm text-muted-foreground max-w-md mx-auto'>
            在顶部搜索框中输入关键词来搜索话题、回复和用户
          </p>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Loading text='加载中...' />}>
      <SearchResults />
    </Suspense>
  );
}
