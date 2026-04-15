'use client';

import { useSearch } from '@/hooks/useSearch';
import { SearchContent } from '@/app/(main)/search/components/SearchContent';
import StickyHeader from '../components/StickyHeader';

export default function SearchView() {
  const {
    searchQuery,
    searchType,
    setSearchType,
    loading,
    searchResults,
    loadTypePage,
  } = useSearch();

  return (
    <div>
      <StickyHeader title='搜索' showBack={false} />
      <SearchContent
        searchQuery={searchQuery}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
        loading={loading}
        searchResults={searchResults}
        onLoadPage={loadTypePage}
      />
    </div>
  );
}
