// src/components/CreateListingModal.jsx
import React, { useState } from "react";

export default function CreateListingModal({ open=false, onClose=()=>{}, onCreated=()=>{} }){
  const [title,setTitle] = useState(''); const [price,setPrice] = useState(''); const [address,setAddress]=useState('');
  const [type,setType] = useState('room'); const [lat,setLat]=useState(''); const [lng,setLng]=useState(''); 
  const [file,setFile]=useState(null); const [preview,setPreview]=useState(null); const [loading,setLoading]=useState(false);

  const handleFile = e => {
    const f = e.target.files?.[0]; if(!f) return; setFile(f);
    const r = new FileReader(); r.onload = ()=> setPreview(r.result); r.readAsDataURL(f);
  };

  const submit = async ()=> {
    if (!title || !lat || !lng) {
      alert('Please fill in title, latitude, and longitude');
      return;
    }
    setLoading(true);
    try{
      const form = new FormData(); 
      form.append('title', title); 
      if (price) form.append('price', price); 
      form.append('address', address); 
      form.append('type', type); // Explicitly set type
      form.append('lat', lat); 
      form.append('lng', lng);
      // Use 'images' field name to match backend expectation
      if(file) form.append('images', file);
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(baseURL + '/listings', { 
        method:'POST', 
        headers: token ? { Authorization: `Bearer ${token}` } : {}, 
        body:form 
      });
      if(!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          const text = await res.text();
          errorData = { message: text };
        }
        throw new Error(errorData.message || `Failed: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      onCreated(data); 
      onClose();
      setTitle(''); setPrice(''); setAddress(''); setType('room'); setFile(null); setPreview(null); setLat(''); setLng('');
    }catch(e){ 
      alert(e.message || e || 'Failed to create listing');
    } finally { setLoading(false) }
  };

  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="bg-white rounded-2xl p-6 z-10 w-[92%] max-w-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Create Listing</h3>
        <div className="grid gap-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="input" />
          <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address" className="input" />
          
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Listing Type *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('room')}
                className={`px-3 py-2 rounded-lg font-medium transition-all text-sm border-2 ${
                  type === 'room'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
                }`}
              >
                🏠 Room
              </button>
              <button
                type="button"
                onClick={() => setType('food')}
                className={`px-3 py-2 rounded-lg font-medium transition-all text-sm border-2 ${
                  type === 'food'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
                }`}
              >
                🍽️ Food
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input value={lat} onChange={e=>setLat(e.target.value)} placeholder="Latitude" className="input" />
            <input value={lng} onChange={e=>setLng(e.target.value)} placeholder="Longitude" className="input" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Image</label>
            <input type="file" accept="image/*" onChange={handleFile} className="mt-2" />
            {preview && <img src={preview} className="w-40 h-28 object-cover rounded-md mt-2" alt="preview" />}
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button onClick={submit} className="brand-btn">{loading ? 'Creating...' : 'Create listing'}</button>
            <button onClick={onClose} className="px-3 py-1 rounded-md border">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}
