import './ayo.css';
import { useMapStore } from '@/store/mapStore';

export function SearchOptions({ data }) {
  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation); 

  return (
    <div id="search-ops">
      {data.map(place => (
        <div
          key={place.placeId}
          className='search-item'
          onClick={() => setSelectedLocation(place)}  
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{place.name}</span>
            <span>{place.address}</span>
          </div>
        </div>
      ))}
    </div>
  )
}