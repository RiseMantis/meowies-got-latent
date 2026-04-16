"use client";

import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './store.css'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});

function LocationPicker({ onPick }: { onPick: (latlng: L.LatLng) => void }) {
  const map = useMapEvents({
    click: (e) => {
      onPick(e.latlng);
    }
  });

  setTimeout(() => {
    map.invalidateSize();
  }, 100);

  return null;
}

export default function MapPicker({ onPick }: { onPick: (latlng: L.LatLng) => void }) {
  return (
    <MapContainer 
      center={[19.076, 72.877]} 
      zoom={13} 
      id='map-cont'
    >
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      <LocationPicker onPick={onPick} />
    </MapContainer>
  );
}