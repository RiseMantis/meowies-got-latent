'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react';
import './ayo.css';
import SearchBar from './searchBar';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Map = dynamic(() => import('@/app/wac/Map'), {ssr: false})

function WnC(){
  
  return(
    <main>
      <SearchBar />
      <Map />
      <div>
        <Link href="/wac/register-store">
          <div>
            Register Store
          </div>
        </Link>
      </div>
      
    </main>
  )
}

export default WnC;