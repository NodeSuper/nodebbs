'use client';

import { useSearch } from '@/hooks/useSearch';
import { SearchContent } from '@/app/(main)/search/components/SearchContent';

export default function SearchViewContent() {
  const {
    searchQuery,
    searchType,
    setSearchType,
    loading,
    searchResults,
    loadTypePage,
  } = useSearch();

  return (
    <div className='overflow-hidden'>
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
