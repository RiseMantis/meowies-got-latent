'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react';
import './ayo.css';
import SearchBar from './searchBar';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Map = dynamic(() => import('@/app/wac/Map'), {ssr: false})
import LocationDetailDrawer from '@/app/wac/LocationDetailDrawer';

function WnC(){
  
  return(
    <main>
      <SearchBar />
      <Map />
      <LocationDetailDrawer />
    </main>
  )
}

export default WnC;