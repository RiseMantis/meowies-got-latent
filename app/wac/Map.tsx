'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { useEffect, useState, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import L, { LatLngExpression, map } from 'leaflet'
import './ayo.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

if (typeof window !== "undefined") {
  // @ts-ignore
  window.L = L;
}

import 'leaflet-routing-machine';

const nearbyIcon2 = L.icon({
  iconUrl: '/nearbyIcon.png',   // just the public path, no import needed
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})

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

function MapClickHandler({onMapClick, onNearbyFetch, activeFilters}: { onMapClick: (latlng: L.LatLng) => void, onNearbyFetch: (places: any[]) => void, activeFilters: string[] }) {
  useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      const shortLat = lat.toFixed(2);
      const shortLon = lon.toFixed(2);

      // Reverse geocode for a short address
      let shortAddr = `${shortLat}, ${shortLon}`;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          { headers: { 'User-Agent': 'WalksAndChill github.com/RiseMantis' } }
        );
        const data = await res.json();
        if (data.display_name) {
          const parts = data.display_name.split(',');
          shortAddr = parts.slice(0, 3).join(',').trim();
        }
      } catch (_) {}

      L.popup({ className: 'compact-popup', maxWidth: 200 })
        .setLatLng(e.latlng)
        .setContent(`<b style="font-size:12px">${shortAddr}</b><br/><span style="font-size:10px;color:#64748b">${shortLat}, ${shortLon}</span>`)
        .openOn(e.target);

      onMapClick(e.latlng);

      // Fetch nearby locations
      try {
        const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
        if (activeFilters.length) {
          params.set('filters', activeFilters.join(','));
        }
        const res = await fetch(`/api/locations/nearby?${params.toString()}`);
        if (res.ok) {
          const places = await res.json();
          onNearbyFetch(places);
        }
      } catch (err) {
        console.error('Nearby fetch error:', err);
      }
    },
  })
  return null
}

const nearbyIcon = L.divIcon({
  html: `<div style="font-size: 18px; filter: drop-shadow(0px 2px 4px rgba(100,116,139,0.3)); text-align: center; cursor: pointer;">📍</div>`,
  className: 'custom-nearby-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const filterLabelMap: Record<string, string> = {
  quiet: 'Quiet',
  aroma: 'Aroma',
  crowd: 'Crowd',
  lighting: 'Lighting'
};

const createRatingMarkerIcon = (place: any, activeFilters: string[]) => {
  const lines = activeFilters.map((filter) => {
    const label = filterLabelMap[filter] || filter;
    const value = place.avgRatings?.[filter] ?? place[filter];
    const formatted = typeof value === 'number' ? value.toFixed(1) : value ? String(value) : '—';

    return `<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;line-height:1.2;padding:0 4px;margin-top:2px;">` +
      `<span style="color:#334155;">${label}</span>` +
      `<span style="font-weight:700;color:#0f172a;">${formatted}</span>` +
      `</div>`;
  }).join('');

  return L.divIcon({
    html: `<div style="background:#ffffff;border:1px solid rgba(148,163,184,0.35);border-radius:18px;box-shadow:0 10px 24px rgba(15,23,42,0.14);padding:8px 10px;min-width:92px;text-align:left;">` +
      `<div style="font-size:14px;line-height:1;text-align:center;margin-bottom:6px;">🐾</div>` +
      `${lines}` +
      `</div>`,
    className: 'custom-filter-marker',
    iconSize: [110, 28 + activeFilters.length * 18],
    iconAnchor: [55, 18 + activeFilters.length * 18]
  });
};

function Map() {
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([19.076, 72.877])
  const [mapZoom, setMapZoom] = useState(10);
  const searchResults = useMapStore((s) => s.searchResults);
  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation);
  const routeEnd = useMapStore((s: any) => s.routeEnd);
  const activeFilters = useMapStore((s: any) => s.activeFilters);

  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null)
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);

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

  const fetchNearbyPlaces = useCallback(async (lat: number, lon: number) => {
    try {
      const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
      if (activeFilters.length) {
        params.set('filters', activeFilters.join(','));
      }
      const res = await fetch(`/api/locations/nearby?${params.toString()}`);
      if (res.ok) {
        const places = await res.json();
        setNearbyPlaces(places);
      }
    } catch (err) {
      console.error('Nearby fetch error:', err);
    }
  }, [activeFilters]);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyPlaces(userLocation.lat, userLocation.lng);
    }
  }, [userLocation, fetchNearbyPlaces]);

  const handleMapClick = (latlng: L.LatLng) => {
    // Optional: we leave this to fly to coordinates, but we no longer route automatically
  }

  const handleNearbyFetch = (places: any[]) => {
    setNearbyPlaces(places);
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
        <MapClickHandler onMapClick={handleMapClick} onNearbyFetch={handleNearbyFetch} activeFilters={activeFilters} />

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

        {console.log('nearbyPlaces:', nearbyPlaces)}

        {nearbyPlaces.map((place: any, idx: number) => {
          const placeIcon = activeFilters.length && place.avgRatings
            ? createRatingMarkerIcon(place, activeFilters)
            : nearbyIcon2;

          return (
            <Marker
              key={`nearby-${place.placeId || place.id || idx}`}
              position={[place.lat, place.lon]}
              icon={placeIcon}
              eventHandlers={{
                click: () => setSelectedLocation(place),
              }}
            >
              <Popup>
                <b style={{ fontSize: '12px' }}>{place.name}</b>
                {place.isRegistered && <span style={{ fontSize: '9px', color: '#22c55e', marginLeft: '4px' }}>✓ Registered</span>}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </>
  )
}

export default Map;