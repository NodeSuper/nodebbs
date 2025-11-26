'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { categoryApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Tag,
  MessageSquare,
  Loader2,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import Time from '@/components/forum/Time';
import { Loading } from '@/components/common/Loading';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryApi.getAll();

        // 在前端组装子分类结构
        const categoryMap = new Map();
        const rootCategories = [];

        // 首先创建所有分类的映射
        data.forEach(cat => {
          categoryMap.set(cat.id, { ...cat, subcategories: [] });
        });

        // 然后组装层级结构
        data.forEach(cat => {
          const category = categoryMap.get(cat.id);
          if (cat.parentId) {
            const parent = categoryMap.get(cat.parentId);
            if (parent) {
              parent.subcategories.push(category);
            }
          } else {
            rootCategories.push(category);
          }
        });

        setCategories(rootCategories);
      } catch (err) {
        setError(err);
        toast.error('获取分类列表失败: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (error) {
    return (
      <div className='flex-1 flex items-center justify-center text-red-500'>
        加载失败: {error.message}
      </div>
    );
  }

  return (
    <>
      {/* 页面标题和操作 */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4'>
        <div>
          <h1 className='text-2xl font-semibold text-foreground mb-2'>
            所有分类
          </h1>
          <p className='text-sm text-muted-foreground'>
            {!loading && categories.length > 0 && (
              <>共 {categories.length} 个分类，浏览所有讨论主题</>
            )}
            {!loading && categories.length === 0 && <>还没有创建任何分类</>}
          </p>
        </div>
      </div>

      {loading ? (
        <Loading text='加载中...' className='flex-row py-16' />
      ) : categories.length === 0 ? (
        <div className='text-center py-16 bg-card border border-border rounded-lg'>
          <Tag className='h-16 w-16 text-muted-foreground/50 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-foreground mb-2'>
            暂无分类
          </h3>
          <p className='text-sm text-muted-foreground'>还没有创建任何分类</p>
        </div>
      ) : (
        <>
          {/* 总体统计 */}
          {/* <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
            <div className='bg-card border border-border rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground mb-1'>总分类数</p>
                  <p className='text-2xl font-bold text-foreground'>
                    {categories.length}
                  </p>
                </div>
                <Tag className='h-8 w-8 text-primary/60' />
              </div>
            </div>
            <div className='bg-card border border-border rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground mb-1'>总话题数</p>
                  <p className='text-2xl font-bold text-foreground'>
                    {categories.reduce((sum, cat) => sum + (cat.topicCount || 0), 0)}
                  </p>
                </div>
                <MessageSquare className='h-8 w-8 text-chart-2/60' />
              </div>
            </div>
            <div className='bg-card border border-border rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground mb-1'>总浏览数</p>
                  <p className='text-2xl font-bold text-foreground'>
                    {categories.reduce((sum, cat) => sum + (cat.viewCount || 0), 0).toLocaleString()}
                  </p>
                </div>
                <Eye className='h-8 w-8 text-chart-3/60' />
              </div>
            </div>
          </div> */}

          {/* 分类展示 - 列表视图 */}
          <div className='bg-card border border-border rounded-lg overflow-hidden'>
            {/* 列表头部 */}
            <div className='px-4 py-2.5 bg-muted/30 border-b border-border'>
              <div className='grid grid-cols-12 gap-4 text-xs font-semibold text-muted-foreground'>
                <div className='col-span-5'>分类</div>
                <div className='col-span-4 hidden md:block'>最新话题</div>
                <div className='col-span-3 text-center'>统计</div>
              </div>
            </div>

            {/* 分类项目 */}
            <div className='divide-y divide-border'>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className='px-4 py-4 hover:bg-accent/50 transition-colors group'
                >
                  <div className='grid grid-cols-12 gap-4 items-center'>
                    {/* 左侧：分类信息 */}
                    <div className='col-span-5'>
                      <div className='flex items-center gap-2 mb-2'>
                        <div
                          className='w-3 h-3 rounded-sm shrink-0'
                          style={{ backgroundColor: category.color }}
                        />
                        <Link
                          href={`/categories/${category.slug}`}
                          className='font-semibold text-foreground hover:text-primary transition-colors'
                        >
                          {category.name}
                        </Link>
                      </div>
                      {category.description && (
                        <p className='text-sm text-muted-foreground line-clamp-2 ml-5'>
                          {category.description}
                        </p>
                      )}
                      {/* 子分类 */}
                      {category.subcategories &&
                        category.subcategories.length > 0 && (
                          <div className='flex items-center gap-2 flex-wrap mt-2 ml-5'>
                            {category.subcategories.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/categories/${sub.slug}`}
                                className='inline-block'
                              >
                                <Badge
                                  variant='outline'
                                  className='text-xs cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors'
                                >
                                  {sub.name}
                                </Badge>
                              </Link>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* 中间：最新话题 */}
                    <div className='col-span-4 hidden md:block'>
                      {category.latestTopic ? (
                        <Link
                          href={`/topic/${category.latestTopic.id}`}
                          className='block'
                        >
                          <p className='text-sm text-foreground line-clamp-1 hover:text-primary transition-colors mb-1'>
                            {category.latestTopic.title}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            <Time
                              date={category.latestTopic.updatedAt}
                              fromNow
                            />
                          </p>
                        </Link>
                      ) : (
                        <p className='text-sm text-muted-foreground'>
                          暂无话题
                        </p>
                      )}
                    </div>

                    {/* 右侧：统计信息 */}
                    <div className='col-span-3'>
                      <div className='flex flex-col gap-1.5 text-xs text-muted-foreground'>
                        <div className='flex items-center justify-center gap-1.5'>
                          <MessageSquare className='h-3.5 w-3.5' />
                          <span className='font-medium'>
                            {category.topicCount || 0}
                          </span>
                          <span className='hidden sm:inline'>话题</span>
                        </div>
                        <div className='flex items-center justify-center gap-1.5'>
                          <Eye className='h-3.5 w-3.5' />
                          <span className='font-medium'>
                            {category.viewCount || 0}
                          </span>
                          <span className='hidden sm:inline'>浏览</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
