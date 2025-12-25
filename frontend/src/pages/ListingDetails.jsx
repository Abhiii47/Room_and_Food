// src/pages/ListingDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import ImageLightbox from "../components/ImageLightbox";
import BookingModal from "../components/BookingModal";

export default function ListingDetails({ user }) {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(()=> {
    let mounted = true;
    (async ()=> {
      try {
        const res = await API.get(`/listings/${id}`);
        if (mounted) setListing(res.data ?? res);
      } catch (e) {
        try {
          const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const r = await fetch(base + `/listings/${id}`);
          if (r.ok && mounted) setListing(await r.json());
        } catch {}
      } finally { mounted && setLoading(false) }
    })();
    return ()=> mounted = false;
  }, [id]);

  const handleConfirm = async ({ listing, from, to }) => {
    try {
      await API.post('/bookings', { listingId: listing._id || listing.id, fromDate: from, toDate: to });
      alert('Booking requested');
      setModalOpen(false);
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  if (loading) return <div className="p-6 bg-white rounded-2xl shadow-lg">Loading…</div>;
  if (!listing) return <div className="p-6 bg-white rounded-2xl shadow-lg">Listing not found</div>;

  const images = listing.images?.length ? listing.images : (listing.imageUrl ? [listing.imageUrl] : []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {images.map((src, i)=>(
                <img key={i} src={src.startsWith('http') ? src : (import.meta.env.VITE_API_URL?.replace('/api','')||'') + src} onClick={()=>setPreviewOpen(true)} className="w-full h-56 object-cover rounded-lg cursor-pointer" />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold">{listing.title}</h2>
            <p className="text-slate-600 mt-2">{listing.address}</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-400">Price</div>
                <div className="font-semibold mt-1">₹{listing.price}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-400">Host</div>
                <div className="font-semibold mt-1">{listing.hostName || listing.owner || 'Host'}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-400">Type</div>
                <div className="font-semibold mt-1">{listing.meal || listing.type || 'Room'}</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Amenities</h4>
              <div className="flex gap-2 flex-wrap">
                {Array.isArray(listing.amenities) && listing.amenities.map((a,i)=>(<span key={i} className="chip">{a}</span>))}
              </div>
            </div>

            <div className="mt-6">
              <button onClick={()=> setModalOpen(true)} className="brand-btn">Book now</button>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h4 className="font-semibold">Location</h4>
            <div className="h-48 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 mt-3">Map (disabled)</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h4 className="font-semibold">Host Info</h4>
            <div className="mt-3">
              <div className="font-medium">{listing.hostName || listing.owner || 'Host'}</div>
              <div className="text-sm text-slate-500 mt-1">{listing.hostContact || ''}</div>
            </div>
          </div>
        </aside>
      </div>

      <ImageLightbox open={previewOpen} onClose={()=>setPreviewOpen(false)} src={images[0]} title={listing.title} />
      <BookingModal open={modalOpen} listing={listing} onClose={()=>setModalOpen(false)} onConfirm={handleConfirm} />
    </div>
  );
}
