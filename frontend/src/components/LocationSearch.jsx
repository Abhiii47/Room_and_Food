// src/components/LocationSearch.jsx
import React, { useState, useRef, useEffect } from 'react'
import { FiSearch, FiMapPin, FiX } from 'react-icons/fi'

export default function LocationSearch({ onLocationSelect, placeholder = "Search by city, college or locality" }) {
  const [searchValue, setSearchValue] = useState('')
  const [predictions, setPredictions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  // If no API key, show a simple input without autocomplete
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return (
      <div className="relative flex-1">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          className="input w-full pl-12 pr-12"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && searchValue.trim()) {
              // Basic text search - you can enhance this later
              onLocationSelect?.({ name: searchValue, address: searchValue })
            }
          }}
        />
        {searchValue && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10"
            aria-label="Clear search"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>
    )
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Check if Google Maps is loaded (will be loaded by GoogleMap component)
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsReady(true)
        return true
      }
      return false
    }
    
    // Check immediately
    if (checkGoogleMaps()) return
    
    // Also check periodically in case it loads later
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval)
      }
    }, 500)
    
    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchValue(value)
    
    if (value.length > 2 && isGoogleMapsReady && typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
      try {
        const service = new window.google.maps.places.AutocompleteService()
        service.getPlacePredictions(
          {
            input: value,
            types: ['(cities)', 'establishment'],
            componentRestrictions: { country: 'in' } // Restrict to India, remove if you want global
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setPredictions(predictions)
              setShowSuggestions(true)
            } else {
              setPredictions([])
              setShowSuggestions(false)
            }
          }
        )
      } catch (error) {
        console.warn('Google Places API error:', error)
        setPredictions([])
        setShowSuggestions(false)
      }
    } else {
      setPredictions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (prediction) => {
    if (isGoogleMapsReady && typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
      try {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'))
        service.getDetails(
          {
            placeId: prediction.place_id,
            fields: ['geometry', 'formatted_address', 'name']
          },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
              const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address,
                name: place.name
              }
              setSearchValue(place.formatted_address || place.name)
              setShowSuggestions(false)
              onLocationSelect?.(location)
            }
          }
        )
      } catch (error) {
        console.warn('Google Places API error:', error)
      }
    }
  }

  const clearSearch = () => {
    setSearchValue('')
    setPredictions([])
    setShowSuggestions(false)
    onLocationSelect?.(null)
  }

  return (
    <div className="relative flex-1 w-full" ref={suggestionsRef}>
      <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        className="input w-full pl-12 pr-12"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleInputChange}
        onFocus={() => predictions.length > 0 && setShowSuggestions(true)}
      />
      {searchValue && (
        <button
          onClick={clearSearch}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10"
          aria-label="Clear search"
        >
          <FiX className="w-5 h-5" />
        </button>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-amber-200/30 dark:border-emerald-500/30 overflow-hidden z-[100] max-h-80 overflow-y-auto">
          {predictions.map((prediction, index) => (
            <button
              key={prediction.place_id || index}
              onClick={() => handleSuggestionClick(prediction)}
              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-amber-50 hover:to-emerald-50 dark:hover:from-amber-900/20 dark:hover:to-emerald-900/20 transition-all flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
            >
              <FiMapPin className="text-amber-500 dark:text-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 dark:text-slate-200">{prediction.structured_formatting.main_text}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{prediction.structured_formatting.secondary_text}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

