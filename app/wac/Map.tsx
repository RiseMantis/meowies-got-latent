'use client'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L, { LatLngExpression, map } from 'leaflet'
import './ayo.css'

function GoToLocation(){
  const map = useMap()
  const selectedLocation = useMapStore((s) => s.selectedLocation)

  useEffect(() => {
    if(selectedLocation){
      map.flyTo([selectedLocation.lat, selectedLocation.lon], 16, {
        duration: 1.5
      })
    }
  }, [selectedLocation, map])

  return null
}

function MapClickHandler() {
  useMapEvents({
    click: (e) => {
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`You clicked at ${e.latlng.toString()}`)
        .openOn(e.target); // e.target is the map instance
    },
  })
  return null
}

function Map() {
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([19.076, 72.877])
  const [mapZoom, setMapZoom] = useState(10);
  const searchResults = useMapStore((s) => s.searchResults);
  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation);

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

        <GoToLocation />
        <MapClickHandler />

        {searchResults.map((loc) => (
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