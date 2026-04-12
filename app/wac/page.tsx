'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react';
import './ayo.css';

import L from 'leaflet';

function WnC(){

  useEffect(() => {
    const myMap = L.map("myMap", {
      center: [0, 0],
      zoom: 5,
      zoomControl: false,
      tapHold: true
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(myMap)

    setTimeout(() => {
      myMap.invalidateSize()
    }, 1000)

    return () => {
      myMap.remove()
    }
  }, []);
  

  return(
    <main>
      <div>
        yoyoy
      </div>

      <div id="myMap">

      </div>
    </main>
  )
}

export default WnC;