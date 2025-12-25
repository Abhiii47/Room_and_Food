// src/pages/CreateListing.jsx
import React, { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function CreateListing({ user }) {
  const [title,setTitle] = useState('')
  const [address,setAddress] = useState('')
  const [price,setPrice] = useState('')
  const [type,setType] = useState('room') // 'room' or 'food'
  const [lat,setLat] = useState('')
  const [lng,setLng] = useState('')
  const [images,setImages] = useState([])
  const [loading,setLoading] = useState(false)
  const navigate = useNavigate()

  const handleCreate = async () => {
    if (!user) return alert('Sign in as provider')
    if (!title || !lat || !lng) return alert('Please add title, lat and lng')
    setLoading(true)
    try {
      const form = new FormData()
      form.append('title', title)
      form.append('address', address)
      if (price) form.append('price', price)
      form.append('type', type) // Explicitly set type
      form.append('lat', lat)
      form.append('lng', lng)
      // Append all images with field name 'images' to match backend
      images.forEach(img => {
        form.append('images', img)
      })

      await API.post('/listings', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      alert('Created')
      navigate('/dashboard')
    } catch (e) { 
      const errorMsg = e.response?.data?.message || e.message || 'Failed to create listing'
      alert(errorMsg)
    }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Create Listing</h2>

        <div className="grid gap-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="input" required />
          <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address" className="input" />
          <input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price (₹)" className="input" />
          
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Listing Type *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('room')}
                className={`px-4 py-3 rounded-xl font-medium transition-all border-2 ${
                  type === 'room'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
                }`}
              >
                🏠 Room/Stay
              </button>
              <button
                type="button"
                onClick={() => setType('food')}
                className={`px-4 py-3 rounded-xl font-medium transition-all border-2 ${
                  type === 'food'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
                }`}
              >
                🍽️ Food/Mess
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input type="number" step="any" value={lat} onChange={e=>setLat(e.target.value)} placeholder="Latitude" className="input" required />
            <input type="number" step="any" value={lng} onChange={e=>setLng(e.target.value)} placeholder="Longitude" className="input" required />
          </div>

          <div>
            <label className="text-sm text-slate-600">Images (up to 6)</label>
            <input type="file" multiple accept="image/*" onChange={e=>setImages(Array.from(e.target.files || []).slice(0, 6))} className="mt-2" />
            {images.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <img key={idx} alt={`preview ${idx+1}`} src={URL.createObjectURL(img)} className="w-full h-24 object-cover rounded-md" />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={loading} className="brand-btn">
              {loading ? 'Creating…' : 'Create listing'}
            </button>
            <button onClick={()=>{ setTitle(''); setAddress(''); setPrice(''); setType('room'); setLat(''); setLng(''); setImages([]) }} className="px-3 py-1 rounded-md border">Reset</button>
          </div>
        </div>
      </div>
    </div>
  )
}
