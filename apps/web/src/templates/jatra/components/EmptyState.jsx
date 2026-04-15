import Link from '@/components/common/Link';
import { BookOpen, Plus } from 'lucide-react';

export default function EmptyState({ message = '暂无话题', actionLabel = '发布第一个话题' }) {
  return (
    <div className='text-center py-16'>
      <BookOpen className='h-10 w-10 text-muted-foreground/30 mx-auto mb-4' />
      <div className='text-base font-semibold mb-1'>{message}</div>
      <p className='text-sm text-muted-foreground mb-4'>还没有人发布话题</p>
      <Link href='/create' className='text-primary text-sm font-semibold hover:underline'>
        {actionLabel}
      </Link>
    </div>
  );
}
