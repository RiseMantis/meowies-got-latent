'use client'

import { useState } from 'react';
import './ayo.css';

import {useMapStore} from '@/store/mapStore';
import { SearchOptions } from './SearchOptions';

interface SearchResult{
  address:string
  createdAt:string
  id:string
  lat: number
  lon: number
  name: string
  placeId: string
}



function SearchBar(){
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const {setSearchResults, setSelectedLocation} = useMapStore();
  const [searchData, setSearchData] = useState<SearchResult[]>([]);

  const handleSearch = async (e) => {
    e.preventDefault() // apparently this stops default browser behaviour, like reloading page when inputting values

    if(!search.trim()){
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`)
    const data = await res.json();

    console.log('API response:', data);  // check what's coming back

    if (Array.isArray(data)) {
      console.log(data);
      setSearchResults(data);
      setSearchData(data);
    } else {
      console.error('API error:', data);
      setLoading(false);
      return;
    }
    
    setLoading(false);
  }

  // for enter key on mobile
  const handleKeyDown = (e) => {
    if(e.key === 'Enter'){
      handleSearch(e);
    }
  }

  return(
    <div id="all-search">
      <div id='search-box'>
          <input
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search your next Spot'
            id='search-inp'

            // setup more aimed for mobile
            spellCheck={false}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'

            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch} id='search-btn' disabled={loading}>
            {loading ? 'zzz' : ''}
          </button>
      </div>

      <div>
        {
          (searchData.length !== 0) &&
          (
            <SearchOptions data={searchData}/>
          )
        }
      </div>
    </div>
  )
}

export default SearchBar