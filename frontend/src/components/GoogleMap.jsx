// src/components/GoogleMap.jsx  (replace)
import React, { useCallback, useMemo, useState } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import LottieEmpty from './LottieEmpty'

const containerStyle = { width: '100%', height: '100%', minHeight: '280px' }

export default function GoogleMapComponent({ listings = [], center = null, zoom = null }) {
  // API key from environment variable - Vite will replace this at build time
  // The key is NOT exposed in source code, only in the built bundle (which is normal for frontend)
  // Google Maps API keys are meant to be client-side but should have HTTP referrer restrictions
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  
  // Debug: Check if key is loaded (only in development)
  if (import.meta.env.DEV) {
    if (apiKey && apiKey !== 'your_google_maps_api_key_here') {
      console.log('✅ Google Maps API key loaded from environment')
    } else {
      console.warn('⚠️ Google Maps API key not found. Create .env file with VITE_GOOGLE_MAPS_API_KEY')
    }
  }
  
  // if there's no key, don't even attempt to load the JS API — show placeholder
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return (
      <div className="w-full h-72 md:h-80 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-dashed border-slate-300">
        <div className="text-center p-6">
          <div className="text-4xl mb-3">🗺️</div>
          <h4 className="font-bold text-lg text-slate-700 mb-2">Map Not Configured</h4>
          <p className="text-sm text-slate-600 mb-1">To enable the map, you need to:</p>
          <ol className="text-xs text-slate-500 text-left max-w-sm mx-auto mt-3 space-y-1 list-decimal list-inside">
            <li>Create a <code className="bg-white px-1 rounded">.env</code> file in the frontend folder</li>
            <li>Add: <code className="bg-white px-1 rounded">VITE_GOOGLE_MAPS_API_KEY=your_actual_key</code></li>
            <li>Restart the dev server (<code className="bg-white px-1 rounded">npm run dev</code>)</li>
          </ol>
          <p className="text-xs text-slate-400 mt-4">
            Check <code className="bg-white px-1 rounded">.env.example</code> for reference
          </p>
        </div>
      </div>
    )
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places'] // Load Places library for LocationSearch to use
  })

  const defaultCenter = useMemo(() => ({ lat: 19.075983, lng: 72.877655 }), [])
  const mapCenter = useMemo(() => {
    if (center) return center
    if (listings.length > 0) return { lat: listings[0].lat, lng: listings[0].lng }
    return defaultCenter
  }, [center, listings, defaultCenter])
  
  const mapZoom = useMemo(() => {
    if (zoom !== null) return zoom
    return listings.length > 0 ? 12 : 10
  }, [zoom, listings])
  
  const [selected, setSelected] = useState(null)
  const onMarkerClick = useCallback((listing) => setSelected(listing), [])
  const onMapClick = useCallback(() => setSelected(null), [])

  if (loadError) {
    return (
      <div className="w-full h-72 md:h-80 rounded-lg overflow-hidden flex items-center justify-center bg-red-50 border-2 border-red-200">
        <div className="text-center p-6">
          <div className="text-3xl mb-2">⚠️</div>
          <div className="text-sm font-semibold text-red-600 mb-1">Map Failed to Load</div>
          <div className="text-xs text-red-500 space-y-1">
            <p>Possible issues:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Invalid API key</li>
              <li>API key restrictions (HTTP referrer)</li>
              <li>Billing not enabled in Google Cloud Console</li>
              <li>Maps JavaScript API not enabled</li>
            </ul>
            <p className="mt-3 text-slate-600">
              Check the browser console for detailed error messages
            </p>
          </div>
        </div>
      </div>
    )
  }
  if (!isLoaded) {
    return (
      <div className="w-full h-72 md:h-80 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
          <div className="text-sm text-slate-600 font-medium">Loading Google Maps…</div>
          <div className="text-xs text-slate-400 mt-1">Please wait</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-72 md:h-80 rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={mapZoom}
        onClick={onMapClick}
        options={{ 
          streetViewControl: false, 
          mapTypeControl: false, 
          fullscreenControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
      >
        {listings.map((l, i) => (
          <Marker key={i} position={{ lat: Number(l.lat), lng: Number(l.lng) }} onClick={() => onMarkerClick(l)} />
        ))}

        {selected && (
          <InfoWindow position={{ lat: Number(selected.lat), lng: Number(selected.lng) }} onCloseClick={() => setSelected(null)}>
            <div className="max-w-xs">
              <h4 className="font-semibold">{selected.title}</h4>
              <p className="text-sm text-slate-600">{selected.price}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
