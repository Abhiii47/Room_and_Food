// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import CreateListingModal from "../components/CreateListingModal";
import { useToast } from "../components/ToastProvider";

export default function Dashboard({ user }) {
  const [myListings, setMyListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const toast = useToast();

  useEffect(()=> {
    let mounted = true;
    (async ()=> {
      // Only fetch provider data if user is a provider
      const isProvider = user?.role === 'provider' || user?.role === 'admin';
      
      if (isProvider) {
        try {
          // try API endpoint for provider's listings
          const res = await API.get("/listings/provider");
          if (mounted) setMyListings(res.data ?? res);
        } catch (e) {
          // fallback: load all and filter by owner if user present
          try {
            const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const r = await fetch(base + "/listings");
            if (r.ok) {
              const all = await r.json();
              if (mounted) {
                const userId = user?.id || user?._id;
                if (userId) {
                  setMyListings(all.filter(l => {
                    const ownerId = l.owner?._id || l.owner || l.hostId;
                    return ownerId?.toString() === userId?.toString();
                  }));
                } else {
                  setMyListings([]);
                }
              }
            }
          } catch (err) {
            console.error('Failed to load listings:', err);
            if (mounted) setMyListings([]);
          }
        }

        try {
          const rr = await API.get("/bookings/requests");
          if (rr?.data && mounted) setRequests(rr.data);
        } catch (e) {
          console.error('Failed to load booking requests:', e);
          if (mounted) setRequests([]);
        }
      } else {
        // For non-providers, show message or filter their own listings if any
        if (mounted) {
          setMyListings([]);
          setRequests([]);
        }
      }
      
      if (mounted) setLoading(false);
    })();
    return ()=> mounted = false;
  }, [user]);

  const handleApprove = async (reqId, approve=true) => {
    try {
      await API.post(`/bookings/${reqId}/respond`, { approve });
      toast.push("Updated booking request", { type: "success" });
      // remove request locally
      setRequests(prev => prev.filter(r => (r._id || r.id) !== reqId));
    } catch (e) {
      toast.push(e.response?.data?.message || e.message || "Failed to update request", { type: "error" });
    }
  };

  const handleCreateSuccess = (newItem) => {
    // Prepend newly created listing so provider sees it immediately
    setMyListings(prev => [newItem, ...prev]);
    toast.push("Listing created", { type: "success" });
  };

  const isProvider = user?.role === 'provider' || user?.role === 'admin';

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in to access the dashboard</h2>
          <p className="text-slate-500">You need to be logged in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  if (!isProvider) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Provider Access Required</h2>
          <p className="text-slate-500 mb-4">This dashboard is only available for providers.</p>
          <p className="text-sm text-slate-400">If you're a provider, please contact support or register with a provider account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Provider Dashboard</h2>

        {/* open modal instead of navigating away */}
        <button onClick={() => setCreateOpen(true)} className="brand-btn">Create Listing</button>
      </div>

      <section className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <h3 className="font-semibold mb-4">My Listings</h3>
        {loading ? (
          <div>Loading…</div>
        ) : myListings.length === 0 ? (
          <div className="text-slate-500">No listings yet — create one to get started.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myListings.map(l => (
              <div key={l._id || l.id} className="p-2">
                {/* From dashboard booking is not allowed; show toast instead of alert */}
                <ListingCard listing={l} onBook={() => toast.push('Please book from the listing detail page or allow bookings via public UI', { type: 'info' })} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="font-semibold mb-4">Booking Requests</h3>
        {requests.length === 0 ? (
          <div className="text-slate-500">No requests yet.</div>
        ) : (
          <ul className="space-y-4">
            {requests.map(r => (
              <li key={r._id || r.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Listing: {r.listingTitle || r.listing?.title}</div>
                  <div className="text-sm text-slate-500">From: {r.fromDate} — To: {r.toDate}</div>
                  <div className="text-sm text-slate-400">User: {r.userName || r.user?.name || r.user}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(r._id || r.id, true)} className="px-3 py-1 rounded-md bg-green-500 text-white">Approve</button>
                  <button onClick={() => handleApprove(r._id || r.id, false)} className="px-3 py-1 rounded-md border">Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Create Listing modal */}
      <CreateListingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(newItem) => {
          handleCreateSuccess(newItem);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}
