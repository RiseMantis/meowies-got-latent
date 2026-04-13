'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react';
import './ayo.css';

function SearchBar(){
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    console.log(search);
  }

  return(
    <div id='search-box'>
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search your next Spot'
          id='search-inp'
        />
        <button onClick={handleSearch} id='search-btn'></button>
    </div>
  )
}

function WnC(){

  useEffect(() => {
    const L = require('leaflet');

    const myMap = L.map("myMap", {
      center: [0, 0],
      zoom: 5,
      zoomControl: false,
      tapHold: true
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(myMap)

    L.marker([1,1]).addTo(myMap)
    .bindPopup("Pop-up at cords 1, 1. <p>this is said to be customizable</p>.")
    .openPopup()

    setTimeout(() => {
      myMap.invalidateSize()
    }, 1000)

    return () => {
      myMap.remove()
    }
  }, []);

  return(
    <main>
      <SearchBar />
      <div id="myMap">

      </div>
    </main>
  )
}

export default WnC;