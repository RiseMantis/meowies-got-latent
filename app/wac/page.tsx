'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react';
import './ayo.css';
import SearchBar from './searchBar';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/app/wac/Map'), {ssr: false})

function WnC(){
  
  return(
    <main>
      <SearchBar />
      <Map />
    </main>
  )
}

export default WnC;