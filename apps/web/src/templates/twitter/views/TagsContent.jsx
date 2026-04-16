'use client';

import { useState } from 'react';
import Link from '@/components/common/Link';
import { Search } from 'lucide-react';
import { formatCompactNumber } from '@/lib/utils';

/**
 * TagsView 的客户端交互部分（搜索过滤 + 标签列表）
 */
export default function TagsContent({ tags = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = tags.filter((tag) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      tag.name.toLowerCase().includes(q) ||
      tag.slug.toLowerCase().includes(q) ||
      (tag.description && tag.description.toLowerCase().includes(q))
    );
  });

  return (
    <>
      {/* 搜索框 */}
      <div className='px-4 py-3 border-b border-border'>
        <div className='relative'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
          <input
            type='text'
            placeholder='搜索标签'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full h-[42px] pl-11 pr-4 rounded-full bg-muted/50 border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
          />
        </div>
      </div>

      {filteredTags.length > 0 ? (
        <div>
          {filteredTags.map((tag, i) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className='block px-4 py-3 hover:bg-accent/30 transition-colors border-b border-border'
            >
              <div className='flex items-center justify-between'>
                <div className='min-w-0'>
                  <div className='text-[13px] text-muted-foreground'>{i + 1} · 话题标签</div>
                  <div className='font-bold text-[15px] mt-0.5'>#{tag.name}</div>
                  <div className='text-[13px] text-muted-foreground mt-0.5'>
                    {formatCompactNumber(tag.topicCount || 0)} 个话题
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className='text-center py-20'>
          <Search className='h-10 w-10 text-muted-foreground/30 mx-auto mb-4' />
          <p className='font-bold'>没有找到相关标签</p>
          <p className='text-sm text-muted-foreground mt-1'>尝试更换搜索关键词</p>
        </div>
      )}
    </>
  );
}
