'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L, { LatLngExpression, map } from 'leaflet'
import './ayo.css'
import { error } from 'console'

import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

if (typeof window !== "undefined") {
  // @ts-ignore
  window.L = L;
}

import 'leaflet-routing-machine';

function GoToLocation({onMapClick}: { onMapClick: (latlng: L.LatLng) => void }){
  const map = useMap()
  const selectedLocation = useMapStore((s) => s.selectedLocation)

  useEffect(() => {
    if(selectedLocation){
      map.flyTo([selectedLocation.lat, selectedLocation.lon], 16, {
        duration: 1.5
      })
      onMapClick(L.latLng(selectedLocation.lat, selectedLocation.lon))
    }
  }, [selectedLocation, map])

  return null
}

const getLocation = () => {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const {latitude, longitude} = position.coords;

      console.log(`User's Coords: ${latitude}, ${longitude}`)
    },
    (error) => {
      console.error(`Error in getting location: ${error.message}`)
    }
    )
    return navigator.geolocation
  }
  else{
    console.log("Geolocation not supported");
    return null
  }
}

function DoRouting({start, end}: { start: L.LatLng | null, end: L.LatLng | null}){
  const map = useMap();

  useEffect(() => {
    if(!map || !start || !end){
      return;
    }

    const routingControl = (L as any).Routing.control({
      waypoints: [start, end],
      routeWhileDragging: true,
      position: 'bottomleft',
      lineOptions: {
        styles: [
          {color: 'blue', weight: 4}
        ]
      }
    }).addTo(map)

    return () => {
      if(map) map.removeControl(routingControl);
    }
  }, [map, start, end])

  return null;
}

function MapClickHandler({onMapClick}: { onMapClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`You clicked at ${e.latlng.toString()}`)
        .openOn(e.target);
      
      onMapClick(e.latlng)
    },
  })
  return null
}

function Map() {
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([19.076, 72.877])
  const [mapZoom, setMapZoom] = useState(10);
  const searchResults = useMapStore((s) => s.searchResults);
  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation);

  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null)
  const [routeEnd, setRouteEnd] = useState<L.LatLng | null>(null)

  useEffect(() => {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation(L.latLng(latitude, longitude))
        console.log("got your cords")
      },
      (error) => {
        console.error(`Error on User Location: ${error}`)
      }
      )
    }
  }, [])

  const handleMapClick = (latlng: L.LatLng) => {
    setRouteEnd(latlng)
    console.log("Routing...")
  }

  return (
    <>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        id='myMap'
        
        zoomControl={false}
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='© OpenStreetMap contributors'
        />

        <GoToLocation onMapClick={handleMapClick}/>
        <MapClickHandler onMapClick={handleMapClick}/>

        <DoRouting start={userLocation} end={routeEnd} />

        {searchResults.map((loc: any) => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lon]}
            eventHandlers={{
              click: () => setSelectedLocation(loc),
            }}
          >
            <Popup>
              <strong>{loc.name}</strong>
              <br />
              <small>{loc.address}</small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  )
}

export default Map;