"use client";

import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './store.css'
import { useState } from 'react';

// Paw marker for picked location
const pawPickIcon = L.divIcon({
  html: `<div style="font-size: 28px; filter: drop-shadow(0px 4px 8px rgba(100,116,139,0.3)); text-align: center;">📍</div>`,
  className: 'custom-pick-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

function LocationPicker({ onPick, setPickedPos }: { onPick: (latlng: L.LatLng) => void, setPickedPos: (pos: L.LatLng) => void }) {
  const map = useMapEvents({
    click: (e) => {
      setPickedPos(e.latlng);
      onPick(e.latlng);
    }
  });

  setTimeout(() => {
    map.invalidateSize();
  }, 200);

  return null;
}

export default function MapPicker({ onPick }: { onPick: (latlng: L.LatLng) => void }) {
  const [pickedPos, setPickedPos] = useState<L.LatLng | null>(null);

  return (
    <MapContainer 
      center={[19.076, 72.877]} 
      zoom={13} 
      id='map-cont'
      zoomControl={false}
    >
      <TileLayer 
        url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />
      <LocationPicker onPick={onPick} setPickedPos={setPickedPos} />
      {pickedPos && (
        <Marker position={pickedPos} icon={pawPickIcon} />
      )}
    </MapContainer>
  );
}