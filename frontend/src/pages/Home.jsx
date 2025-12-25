// src/pages/Home.jsx
import React, { useEffect, useState, useRef, useMemo } from 'react'
import API from '../services/api'
import ListingCard from '../components/ListingCard'
import GoogleMapComponent from '../components/GoogleMap'
import SkeletonCard from '../components/SkeletonCard'
import LottieEmpty from '../components/LottieEmpty'
import FilterDrawer from '../components/FilterDrawer'
import BookingModal from '../components/BookingModal'
import Hero from '../components/Hero'
import LocationSearch from '../components/LocationSearch'
import { FiFilter, FiMapPin } from 'react-icons/fi'
import { Link } from 'react-router-dom'

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in km
}

export default function Home({ user }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [searchRadius, setSearchRadius] = useState(10) // km

  // modal state for booking
  const [modalOpen, setModalOpen] = useState(false)
  const [activeListing, setActiveListing] = useState(null)

  // reference used by hero CTA to scroll to listings
  const listingsRef = useRef(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await API.get('/listings')
        const data = res.data ?? res
        if (mounted) setListings(data)
      } catch (e) {
        try {
          const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
          const r = await fetch(base + '/listings')
          if (r.ok && mounted) setListings(await r.json())
        } catch {}
      } finally { mounted && setLoading(false) }
    }
    load()
    return () => mounted = false
  }, [])

  // open booking modal (instead of prompt)
  const handleBook = (listing) => {
    if (!user) return alert('Please sign in to book')
    setActiveListing(listing)
    setModalOpen(true)
  }

  // confirmed from BookingModal
  const onConfirmBooking = async ({ listing, from, to }) => {
    try {
      await API.post('/bookings', { listingId: listing._id || listing.id, fromDate: from, toDate: to })
      alert('Booking requested')
      setModalOpen(false)
    } catch (e) {
      alert(e.response?.data?.message || e.message)
    }
  }


  // Filter listings by location if a location is selected
  const filteredListings = useMemo(() => {
    if (!selectedLocation) return listings
    
    return listings.filter(listing => {
      const listingLat = Number(listing.lat || listing.latitude || 0)
      const listingLng = Number(listing.lng || listing.longitude || listing.lon || 0)
      
      if (!listingLat || !listingLng) return false
      
      const distance = calculateDistance(
        selectedLocation.lat,
        selectedLocation.lng,
        listingLat,
        listingLng
      )
      
      return distance <= searchRadius
    })
  }, [listings, selectedLocation, searchRadius])

  // Separate filtered listings by type
  const roomListings = useMemo(() => {
    const filtered = filteredListings.filter(l => {
      const listingType = (l.type || '').toLowerCase().trim()
      return listingType === 'room' || 
             listingType === 'stay' || 
             listingType.includes('room') ||
             listingType.includes('stay') ||
             (listingType === '' && !l.type)
    })
    return filtered
  }, [filteredListings])
  
  const foodListings = useMemo(() => {
    return filteredListings.filter(l => {
      const listingType = (l.type || '').toLowerCase().trim()
      return listingType === 'food' || 
             listingType === 'mess' || 
             listingType === 'tiffin' ||
             listingType.includes('food') ||
             listingType.includes('mess') ||
             listingType.includes('tiffin')
    })
  }, [filteredListings])

  // map points for GoogleMapComponent - use filtered listings
  const mapPoints = useMemo(() => {
    return filteredListings
      .filter(l => l.lat && l.lng)
      .map(l => ({
        lat: Number(l.lat || l.latitude || 0),
        lng: Number(l.lng || l.longitude || l.lon || 0),
        title: l.title,
        price: l.price
      }))
  }, [filteredListings])

  return (
    <>
      <Hero 
        onSearch={() => { listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
        onLocationSelect={(location) => {
          setSelectedLocation(location)
          if (location) {
            listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <section className="fancy-card p-4 sm:p-6 unicorn-glow relative z-10">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex-1 min-w-0 relative z-20">
                  <LocationSearch 
                    onLocationSelect={(location) => {
                      setSelectedLocation(location)
                      if (location) {
                        listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }}
                    placeholder="Search by city, college or locality"
                  />
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0 relative z-10">
                  {selectedLocation && (
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-100 to-emerald-100 dark:from-amber-900/30 dark:to-emerald-900/30 rounded-xl border-2 border-amber-300 dark:border-emerald-500/30 w-full sm:w-auto">
                      <FiMapPin className="text-amber-600 dark:text-emerald-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-amber-700 dark:text-emerald-300 truncate flex-1 min-w-0">
                        {selectedLocation.name || selectedLocation.address}
                      </span>
                      <button
                        onClick={() => setSelectedLocation(null)}
                        className="ml-2 text-amber-600 dark:text-emerald-400 hover:text-amber-800 dark:hover:text-emerald-200 transition-colors flex-shrink-0 text-lg"
                        aria-label="Clear location"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <button className="shadcn-button-primary text-xs sm:text-sm px-3 sm:px-4 py-2 flex-1 sm:flex-initial" title="Quick filters">
                    <FiFilter className="mr-1 sm:mr-2" /> <span className="hidden xs:inline">Filters</span><span className="xs:hidden">Filter</span>
                  </button>
                  <button 
                    onClick={() => setDrawerOpen(true)} 
                    className="shadcn-button-secondary text-xs sm:text-sm px-3 sm:px-4 py-2"
                  >
                    Advanced
                  </button>
                </div>
              </div>
              {selectedLocation && (
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                  <label className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 min-w-0">
                    <span className="whitespace-nowrap">Search Radius:</span>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(Number(e.target.value))}
                        className="flex-1 sm:max-w-xs accent-amber-500 dark:accent-emerald-500"
                      />
                      <span className="text-amber-600 dark:text-emerald-400 font-bold text-xs sm:text-sm whitespace-nowrap">{searchRadius} km</span>
                    </div>
                  </label>
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              )}
            </section>

            <section className="fancy-card sparkle p-4 sm:p-6">
              <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-bold rainbow-text">📍 Map View</h3>
                {selectedLocation && (
                  <span className="text-xs text-amber-600 dark:text-emerald-400 bg-amber-100 dark:bg-emerald-900/30 px-2 sm:px-3 py-1 rounded-full border border-amber-300 dark:border-emerald-500/30 whitespace-nowrap">
                    Showing {mapPoints.length} locations
                  </span>
                )}
              </div>
              <GoogleMapComponent 
                listings={mapPoints} 
                center={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : null}
                zoom={selectedLocation ? 13 : 12}
              />
            </section>

            {/* Rooms Section */}
            <section ref={listingsRef} className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-bold rainbow-text">🏠 Rooms & Stays</h2>
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-700/80 px-2 sm:px-3 py-1 rounded-full border border-amber-200 dark:border-emerald-500/30">
                  {roomListings.length} available
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (<SkeletonCard key={i} />))
                  : (roomListings.length === 0
                      ? <div className="col-span-full text-center py-12 text-slate-500">
                          <p className="text-lg mb-2">No rooms available yet</p>
                          <p className="text-sm">Be the first to list a room!</p>
                        </div>
                      : roomListings.map(l => (
                          <div key={l._id || l.id} className="relative group">
                            <Link to={`/listing/${l._id || l.id}`} className="block">
                              <ListingCard listing={l} onBook={handleBook} />
                            </Link>
                            {user && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleBook(l)
                                }}
                                className="absolute bottom-4 right-4 z-10 brand-btn text-sm px-4 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Book Now
                              </button>
                            )}
                          </div>
                        ))
                    )
                }
              </div>
            </section>

            {/* Food Section */}
            <section className="space-y-3 sm:space-y-4 mt-8 sm:mt-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-bold rainbow-text">🍽️ Food & Mess Services</h2>
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-700/80 px-2 sm:px-3 py-1 rounded-full border border-amber-200 dark:border-emerald-500/30">
                  {foodListings.length} available
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (<SkeletonCard key={`food-${i}`} />))
                  : (foodListings.length === 0
                      ? <div className="col-span-full text-center py-12 text-slate-500">
                          <p className="text-lg mb-2">No food services available yet</p>
                          <p className="text-sm">Be the first to list a mess or tiffin service!</p>
                        </div>
                      : foodListings.map(l => (
                          <div key={l._id || l.id} className="relative group">
                            <Link to={`/listing/${l._id || l.id}`} className="block">
                              <ListingCard listing={l} onBook={handleBook} />
                            </Link>
                            {user && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleBook(l)
                                }}
                                className="absolute bottom-4 right-4 z-10 brand-btn text-sm px-4 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Book Now
                              </button>
                            )}
                          </div>
                        ))
                    )
                }
              </div>
            </section>
          </div>

          <aside className="space-y-4 sm:space-y-6 hidden lg:block">
            <div className="fancy-card p-4 sm:p-6">
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 rainbow-text">Quick View</h4>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Rooms</div>
                  <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{roomListings.length}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Available stays</div>
                </div>
                <div className="border-t border-amber-200/50 dark:border-emerald-500/30 pt-3 sm:pt-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Food Services</div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{foodListings.length}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Mess & tiffin</div>
                </div>
              </div>
            </div>

            <div className="fancy-card p-4 sm:p-6">
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-slate-800 dark:text-slate-100">Recently Added</h4>
              <ul className="space-y-2 sm:space-y-3">
                {listings.slice(0, 5).map(l => (
                  <li key={l._id || l.id}>
                    <Link to={`/listing/${l._id || l.id}`} className="flex items-center gap-2 sm:gap-3 hover:bg-white/50 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-all">
                      <div className="w-12 sm:w-16 h-10 sm:h-12 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                        {l.imageUrl ? (
                          <img 
                            src={(import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000') + l.imageUrl} 
                            alt={l.title} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-200 to-emerald-200 dark:from-amber-800 dark:to-emerald-800"></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-medium truncate text-slate-800 dark:text-slate-200">{l.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">₹{l.price || 'N/A'}</div>
                        <div className="text-xs text-amber-600 dark:text-emerald-400 mt-1">
                          {l.type === 'food' || l.type?.toLowerCase().includes('food') ? '🍽️ Food' : '🏠 Room'}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {!user && (
              <div className="fancy-card p-4 sm:p-6 text-center">
                <h4 className="font-bold text-base sm:text-lg mb-2 text-slate-800 dark:text-slate-100">Ready to book?</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">Sign in to start booking rooms and food services</p>
                <Link to="/login" className="brand-btn inline-block text-xs sm:text-sm px-4 sm:px-5 py-2">
                  Sign In
                </Link>
              </div>
            )}
          </aside>

          <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onApply={() => { setDrawerOpen(false) }} />
        </div>
      </div>

      <BookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        listing={activeListing}
        onConfirm={(data) => onConfirmBooking({ listing: activeListing, from: data.from, to: data.to })}
      />
    </>
  )
}

