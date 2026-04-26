"use client";
import { useState } from 'react';
import './store.css';
import L from 'leaflet';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PickMap = dynamic(() => import('./PickMap'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', fontFamily: 'Outfit, sans-serif', color: '#94a3b8'
    }}>
      Loading Map...
    </div>
  )
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

  const handleLocPick = (latlng: L.LatLng) => {
    setStoreLocation(`${latlng.lat}, ${latlng.lng}`);
    setOpenMap(false)
  }

  const handleSubmit = async (e: any) => {
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
    <main className="register-page">
      {/* ── Map picker overlay ── */}
      {openMap && (
        <div className="map-overlay">
          <div className="map-modal">
            <div className="map-modal-header">
              <span>📍 Tap to pick a location</span>
              <button className="map-close-btn" onClick={() => setOpenMap(false)}>✕</button>
            </div>
            <PickMap onPick={handleLocPick} />
          </div>
        </div>
      )}

      {/* ── Registration card ── */}
      <div className="register-card">

        <Link href="/wac" className="back-link">← Back to map</Link>

        {/* Header */}
        <div className="register-header">
          <span className="paw-icon">🐾</span>
          <h1>Register a Spot</h1>
          <p>Add a cozy new place for the community</p>
        </div>

        {/* Store Name */}
        <div className="form-group">
          <label className="form-label">Store Name</label>
          <input 
            type="text"
            className="form-input"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="e.g. Paws & Coffee"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

        {/* Location */}
        <div className="form-group">
          <label className="form-label">Location Coordinates</label>
          <div className="location-row">
            <input 
              type="text"
              className="form-input"
              value={storeLocation}
              onChange={(e) => setStoreLocation(e.target.value)}
              placeholder="Pick on map or type lat, lng"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              readOnly
            />
            <button className="pick-btn" onClick={() => setOpenMap(true)}>
              📍 Pick
            </button>
          </div>
        </div>

        {/* Address */}
        <div className="form-group">
          <label className="form-label">Street Address</label>
          <input 
            type="text"
            className="form-input"
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            placeholder="e.g. 42 Bandra West, Mumbai"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

        {/* Tags */}
        <div className="tags-section">
          <label className="form-label">Vibe Tags</label>
          <div className="tags-grid">
            <div className="tag-group">
              <span className="tag-label">🔇 Sound</span>
              <select className="tag-select" title="Sound Tag" value={soundTag} onChange={(e) => setSoundTag(e.target.value)}>
                <option value="Quiet">Quiet</option>
                <option value="Somewhat Quiet">Somewhat Quiet</option>
                <option value="Noisy">Noisy</option>
              </select>
            </div>

            <div className="tag-group">
              <span className="tag-label">💡 Lighting</span>
              <select className="tag-select" title="Light Tag" value={lightTag} onChange={(e) => setLightTag(e.target.value)}>
                <option value="Dim">Dim</option>
                <option value="Medium">Medium</option>
                <option value="Bright">Bright</option>
              </select>
            </div>

            <div className="tag-group">
              <span className="tag-label">👥 Crowd</span>
              <select className="tag-select" title="Crowd Tag" value={crowdTag} onChange={(e) => setCrowdTag(e.target.value)}>
                <option value="Less Crowded">Less Crowded</option>
                <option value="Medium Crowd">Medium Crowd</option>
                <option value="Generally Crowded">Generally Crowded</option>
              </select>
            </div>

            <div className="tag-group">
              <span className="tag-label">🌸 Aroma</span>
              <select className="tag-select" title="Aroma Tag" value={aromaTag} onChange={(e) => setAromaTag(e.target.value)}>
                <option value="No Aroma">No Aroma</option>
                <option value="Mild Aroma">Mild Aroma</option>
                <option value="Strong Aroma">Strong Aroma</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button className="submit-btn" onClick={handleSubmit}>
          Register This Spot 🐾
        </button>
        <div className='flex flex-col h-5'></div>
      </div>
    </main>
  )
}

export default RegisterPage