"use client";
import { useState } from 'react';
import './store.css';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet'
import dynamic from 'next/dynamic';

const PickMap = dynamic(() => import('./PickMap'), { 
  ssr: false,
  loading: () => <div>Loading Map...</div>
});

function RegisterPage() {
  const [storeLocation, setStoreLocation] = useState("")
  const [storeName, setStoreName] = useState("");
  const [openMap, setOpenMap] = useState(false);

  const handleLocPick = (latlng : L.LatLng) => {
    setStoreLocation(`${latlng.lat}, ${latlng.lng}`);
    setOpenMap(false)
  }

  return(
    <main>

      {
        openMap && 
        (
          <div>
            <PickMap onPick={handleLocPick} />
            <button onClick={() => setOpenMap(false)}> Close </button>
          </div>
        )
      }

      <div id='regis-form'>
        <div>
          <div>Your Store's Name:</div>
          <input 
            type='text'
            value={storeName}
            onChange={(e) => {setStoreName(e.target.value)}}
            placeholder='Store Name'
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
          />
        </div>

        <div id='location-inp'>
          <div>Your Store's Location:</div>
          <input 
            type='text'
            value={storeLocation}
            onChange={(e) => {setStoreLocation(e.target.value)}}
            placeholder='Location'
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            style={{
              border: 'none'
            }}
          />
          <button onClick={() => setOpenMap(true)}> Pick </button>
        </div>

        <div>

        </div>
      </div>
    </main>
  )
}

export default RegisterPage