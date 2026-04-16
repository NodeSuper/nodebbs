'use client';

import { useSearch } from '@/hooks/useSearch';
import { SearchContent as SharedSearchContent } from '@/app/(main)/search/components/SearchContent';

/**
 * SearchView 的客户端交互部分
 */
export default function SearchContent() {
  const {
    searchQuery,
    searchType,
    setSearchType,
    loading,
    searchResults,
    loadTypePage,
  } = useSearch();

  return (
    <SharedSearchContent
      searchQuery={searchQuery}
      searchType={searchType}
      onSearchTypeChange={setSearchType}
      loading={loading}
      searchResults={searchResults}
      onLoadPage={loadTypePage}
    />
  );
}
