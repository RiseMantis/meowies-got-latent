'use client'

import { useState, useEffect, useCallback } from 'react';
import { useMapStore } from '@/store/mapStore';
import { SearchOptions } from './SearchOptions';
import { Search, Loader2, X, SlidersHorizontal } from 'lucide-react';

interface SearchResult {
  address: string;
  createdAt: string;
  id: string;
  lat: number;
  lon: number;
  name: string;
  placeId: string;
}

const filterOptions = [
  { key: 'quiet', label: 'Quiet', hint: 'Noise 4+' },
  { key: 'aroma', label: 'Aroma', hint: 'Aroma 4+' },
  { key: 'crowd', label: 'Crowd', hint: 'Crowd 4+' },
  { key: 'lighting', label: 'Lighting', hint: 'Lighting 4+' }
];

const filterConfig: Record<string, { field: string; threshold: number }> = {
  quiet: { field: 'soundTag', threshold: 4 },
  aroma: { field: 'aromaTag', threshold: 4 },
  crowd: { field: 'crowdTag', threshold: 4 },
  lighting: { field: 'lightTag', threshold: 4 }
};

type SearchItem = Record<string, string | number | undefined | null>;

interface MapStoreState {
  setSearchResults: (results: SearchResult[]) => void;
  activeFilters: string[];
  toggleFilter: (filter: string) => void;
  clearFilters: () => void;
}

function SearchBar() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const setSearchResults = useMapStore((s: MapStoreState) => s.setSearchResults);
  const activeFilters = useMapStore((s: MapStoreState) => s.activeFilters);
  const toggleFilter = useMapStore((s: MapStoreState) => s.toggleFilter);
  const clearFilters = useMapStore((s: MapStoreState) => s.clearFilters);
  const [searchData, setSearchData] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const applyFiltersToItems = useCallback((items: SearchItem[]) => {
    if (!activeFilters.length) return items;

    return items.filter((item) => {
      return activeFilters.every((filter) => {
        const config = filterConfig[filter];
        if (!config) return true;

        const rawValue = item[config.field];
        const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue);
        return !Number.isNaN(numericValue) && numericValue >= config.threshold;
      });
    });
  }, [activeFilters]);

  const handleSearch = useCallback(async (searchTerm?: string | React.FormEvent, eFormEvent?: React.FormEvent) => {
    let term = search;
    if (typeof searchTerm === 'string') {
      term = searchTerm;
    } else if (searchTerm && 'preventDefault' in searchTerm) {
      searchTerm.preventDefault();
    } else if (eFormEvent) {
      eFormEvent.preventDefault();
    }

    if (!term.trim()) return;

    setLoading(true);

    try {
      const params = new URLSearchParams({ q: term.trim() });
      if (activeFilters.length) {
        params.set('filters', activeFilters.join(','));
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        const filtered = applyFiltersToItems(data);
        setSearchResults(filtered);
        setSearchData(filtered);
      } else {
        console.error('API error:', data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, activeFilters, setSearchResults, applyFiltersToItems]);

  // Debounce search input for autocomplete
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [handleSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearch("");
    setSearchData([]);
    setSearchResults([]);
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90vw] max-w-lg z-[1000] flex flex-col gap-3">
      {/* Search Input Pill */}
      <div 
        className={`flex items-center justify-between w-full p-2 bg-white/85 dark:bg-slate-800/85 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 rounded-full transition-all duration-300 ${
          isFocused ? 'shadow-[0_8px_32px_rgba(100,116,139,0.2)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] scale-[1.02]' : 'shadow-[0_4px_16px_rgba(100,116,139,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
        }`}
      >
        <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 ml-4 shrink-0" />
        
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value === "") handleClear();
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search your next cozy spot..."
          spellCheck={false}
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent border-none outline-none px-3 text-slate-700 dark:text-slate-200 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal"
        />

        <button
          type="button"
          onClick={() => setFiltersOpen((prev) => !prev)}
          className="mr-2 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>

        {search && !loading && (
          <button 
            onClick={handleClear}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <button 
          onClick={() => handleSearch()} 
          disabled={loading || !search.trim()}
          className="flex items-center justify-center bg-[#a5b4fc] hover:bg-[#818cf8] disabled:bg-slate-200 disabled:opacity-50 text-white w-12 h-12 rounded-full transition-all shadow-md shrink-0"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
        {filtersOpen && (
          <div className="absolute right-0 top-full mt-3 w-52 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/95 shadow-2xl p-3 backdrop-blur-xl z-50">
            <div className="flex flex-col gap-2">
              {filterOptions.map((option) => {
                const active = activeFilters.includes(option.key);
                return (
                  <button
                    type="button"
                    key={option.key}
                    onClick={() => toggleFilter(option.key)}
                    className={`flex items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition-all ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{option.hint}</div>
                    </div>
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${active ? 'bg-white text-indigo-600' : 'bg-slate-300 text-slate-700'}`}>{active ? '✓' : '+'}</span>
                  </button>
                );
              })}
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearFilters();
                    setFiltersOpen(false);
                  }}
                  className="mt-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {activeFilters.map((filter) => {
            const option = filterOptions.find((item) => item.key === filter);
            if (!option) return null;
            return (
              <span key={filter} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm">
                {option.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Search Options Dropdown */}
      {searchData.length > 0 && search.length > 0 && (
        <SearchOptions data={searchData} onSelect={() => setSearchData([])} />
      )}
    </div>
  );
}

export default SearchBar;