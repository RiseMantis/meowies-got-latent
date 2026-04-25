'use client'

import { useState, useEffect } from 'react';
import { useMapStore } from '@/store/mapStore';
import { SearchOptions } from './SearchOptions';
import { Search, Loader2, X } from 'lucide-react';

interface SearchResult {
  address: string;
  createdAt: string;
  id: string;
  lat: number;
  lon: number;
  name: string;
  placeId: string;
}

function SearchBar() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const setSearchResults = useMapStore((s: any) => s.setSearchResults);
  const searchResults = useMapStore((s: any) => s.searchResults);
  const [searchData, setSearchData] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = async (searchTerm?: string | React.FormEvent, eFormEvent?: React.FormEvent) => {
    // Determine if the first argument is an event or a string
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
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setSearchResults(data);
        setSearchData(data);
      } else {
        console.error('API error:', data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input for autocomplete
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.trim().length >= 2) {
        handleSearch(search);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

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
      </div>

      {/* Search Options Dropdown */}
      {searchData.length > 0 && search.length > 0 && (
        <SearchOptions data={searchData} onSelect={() => setSearchData([])} />
      )}
    </div>
  );
}

export default SearchBar;