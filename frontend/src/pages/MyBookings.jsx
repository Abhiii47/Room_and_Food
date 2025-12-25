// src/pages/MyBookings.jsx
import React, { useEffect, useState } from 'react'
import API from '../services/api'
import { Link } from 'react-router-dom'

export default function MyBookings({ user }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const res = await API.get('/bookings/user')
        setBookings(res.data ?? res)
      } catch (e) {
        console.error('Failed to load bookings:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">Loading bookings...</div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        {bookings.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">No bookings yet.</div>
        ) : (
          <ul className="space-y-3">
            {bookings.map(b => {
              const listing = b.listing || {}
              const listingTitle = listing.title || 'Unknown Listing'
              const listingId = typeof listing === 'object' ? listing._id : listing
              
              return (
                <li key={b._id || b.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <Link to={listingId ? `/listing/${listingId}` : '#'} className="block">
                    <div className="font-medium text-lg mb-2">{listingTitle}</div>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">From:</span> {formatDate(b.fromDate)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">To:</span> {formatDate(b.toDate)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        Status: <strong className={`capitalize ${
                          b.status === 'approved' ? 'text-green-600' :
                          b.status === 'rejected' ? 'text-red-600' :
                          b.status === 'cancelled' ? 'text-gray-600' :
                          'text-yellow-600'
                        }`}>{b.status}</strong>
                      </span>
                      {listing.price && (
                        <span className="text-sm font-medium text-gray-700">
                          ₹{listing.price}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
