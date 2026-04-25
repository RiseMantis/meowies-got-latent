'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L, { LatLngExpression, map } from 'leaflet'
import './ayo.css'

import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

if (typeof window !== "undefined") {
  // @ts-ignore
  window.L = L;
}

import 'leaflet-routing-machine';

const pawIcon = L.divIcon({
  html: `<div style="font-size: 24px; filter: drop-shadow(0px 4px 8px rgba(100,116,139,0.3)); text-align: center; transition: transform 0.2s; cursor: pointer;">🐾</div>`,
  className: 'custom-paw-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15] // center anchor for a soft floating droplet/paw feel
});

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

import { useRef } from 'react';

function DoRouting({start, end}: { start: L.LatLng | null, end: L.LatLng | null}){
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  // Initialize routing control exactly once per map
  useEffect(() => {
    if(!map) return;

    const routingControl = (L as any).Routing.control({
      waypoints: [],
      routeWhileDragging: true,
      position: 'bottomleft',
      show: false, // Hide instruction panel for calm design
      lineOptions: {
        styles: [{color: '#a5b4fc', weight: 5, opacity: 0.8}]
      }
    }).addTo(map);

    routingControlRef.current = routingControl;

    return () => {
      try {
        if(map && routingControlRef.current) {
          map.removeControl(routingControlRef.current);
        }
      } catch (e) {
        console.warn("Routing machine cleanup:", e);
      }
    }
  }, [map]);

  // Update waypoints independently
  useEffect(() => {
    if (routingControlRef.current && start && end) {
      routingControlRef.current.setWaypoints([start, end]);
    } else if (routingControlRef.current) {
      routingControlRef.current.setWaypoints([]);
    }
  }, [start, end]);

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
  const routeEnd = useMapStore((s: any) => s.routeEnd);

  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null)

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
    // Optional: we leave this to fly to coordinates, but we no longer route automatically
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

        <DoRouting start={userLocation} end={routeEnd ? L.latLng(routeEnd.lat, routeEnd.lon) : null} />

        {searchResults.map((loc: any) => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lon]}
            icon={pawIcon}
            eventHandlers={{
              click: () => setSelectedLocation(loc),
            }}
          />
        ))}
      </MapContainer>
    </>
  )
}

export default Map;