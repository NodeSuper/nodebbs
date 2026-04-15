import { Suspense } from 'react';
import { getTemplate } from '@/templates';
import { VIEWS } from '@/templates/constants';
import { Loading } from '@/components/common/Loading';

/**
 * 搜索页面入口
 * 使用 Suspense 包裹客户端组件以支持 useSearchParams
 */
export default function SearchPage() {
  const SearchView = getTemplate(VIEWS.SearchView);

  return (
    <Suspense fallback={<Loading text='加载中...' />}>
      <SearchView />
    </Suspense>
  );
}
