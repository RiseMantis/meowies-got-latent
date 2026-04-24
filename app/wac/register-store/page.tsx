"use client";
import { useState } from 'react';
import './store.css';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet'
import dynamic from 'next/dynamic';
import { parse } from 'path';
import { useRouter } from 'next/navigation';

const PickMap = dynamic(() => import('./PickMap'), { 
  ssr: false,
  loading: () => <div>Loading Map...</div>
});

function RegisterPage() {
  const router = useRouter();
  const [storeLocation, setStoreLocation] = useState("")
  const [storeName, setStoreName] = useState("");
  const [openMap, setOpenMap] = useState(false);
  const [storeAddress, setStoreAddress] = useState("");
  const [soundTag, setSoundTag] = useState("Quiet");
  const [lightTag, setLightTag] = useState("Dim");
  const [crowdTag, setCrowdTag] = useState("Less Crowded");
  const [aromaTag, setAromaTag] = useState("No Aroma");

  const handleLocPick = (latlng : L.LatLng) => {
    setStoreLocation(`${latlng.lat}, ${latlng.lng}`);
    setOpenMap(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [latStr, lonStr] = storeLocation.replace(/[()]/g, '').split(',');

    const res = await fetch('/api/locations/register', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        name: storeName,
        address: storeAddress,
        lat: parseFloat(latStr),
        lon: parseFloat(lonStr),
        sound: soundTag,
        light: lightTag,
        crowd: crowdTag,
        aroma: aromaTag
      })
    })
    if (res.ok) {
      alert("Location registered successfully!");
      router.push('/wac');
    } else {
      alert("Failed to register location.");
    }
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
          <div>Your Store's Address:</div>
            <input 
              type='text'
              value={storeAddress}
              onChange={(e) => {setStoreAddress(e.target.value)}}
              placeholder='Store Name'
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
            />
        </div>

        <div>
          <div>Tags:</div>

          <select title='Sound Tag' onChange={(e) => setSoundTag(e.target.value)}>
            <option> Quiet </option>
            <option> Somewhat Quiet </option>
            <option> Noisy </option>
          </select>

          <select title='Light Tag' onChange={(e) => setLightTag(e.target.value)}>
            <option> Dim </option>
            <option> Medium </option>
            <option> Bright </option>
          </select>          

          <select title='Crowd Tag' onChange={(e) => setCrowdTag(e.target.value)}>
            <option> Less Crowded </option>
            <option> Mdeium Crowd </option>
            <option> Generally Crowded </option>
          </select>

          <select title='Aroma Tag' onChange={(e) => setAromaTag(e.target.value)}>
            <option> No Aroma </option>
            <option> Mild Aroma </option>
            <option> Strong Aroma </option>
          </select>
        </div>
        <button onClick={handleSubmit}> Submit </button>
      </div>
    </main>
  )
}

export default RegisterPage