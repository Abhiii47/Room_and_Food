// src/components/ListingCard.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import ImageLightbox from "./ImageLightbox";

function unsplashFor(title,id){
  const sig = encodeURIComponent((title||id||Math.random()).slice(0,20));
  return `https://source.unsplash.com/collection/190727/800x600?sig=${sig}`;
}

export default function ListingCard({ listing={}, onBook=()=>{} }){
  const [previewOpen,setPreviewOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imageUrl = (listing.imageUrl && String(listing.imageUrl).trim())
    ? (listing.imageUrl.startsWith('http') ? listing.imageUrl : (import.meta.env.VITE_API_URL?.replace('/api','')||'') + listing.imageUrl)
    : unsplashFor(listing.title, listing._id || listing.id);

  return (
    <>
      <motion.article whileHover={{ y:-8 }} transition={{ type:'spring', stiffness:260, damping:22 }} className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl overflow-hidden card-hover border border-slate-200 dark:border-slate-700">
        <div className="relative">
          {!imgLoaded && <div className="w-full h-40 sm:h-48 bg-slate-100 dark:bg-slate-700 animate-pulse" />}
          <img
            src={imageUrl}
            alt={listing.title || 'Listing image'}
            loading="lazy"
            className="listing-img"
            onClick={()=>setPreviewOpen(true)}
            style={{ cursor:'pointer', display: imgLoaded ? 'block' : 'none' }}
            onLoad={()=>setImgLoaded(true)}
            onError={(e)=>{ 
              e.currentTarget.onerror = null; 
              // Use a data URL as fallback instead of external placeholder service
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23e2e8f0" width="800" height="600"/%3E%3Ctext fill="%2394a3b8" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
              setImgLoaded(true);
            }}
          />
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay: 0.08 }} className="price-badge text-xs sm:text-sm">₹{listing.price ?? "—"}</motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay: 0.12 }} className="rating-badge text-xs">⭐ {listing.rating ?? "4.6"}</motion.div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div style={{minWidth:0}} className="flex-1">
              <h3 className="font-semibold text-base sm:text-lg truncate text-slate-800 dark:text-slate-100">{listing.title || "Untitled place"}</h3>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">{listing.address || listing.description || "Address not provided"}</div>
              <div className="mt-2 sm:mt-3 flex gap-1.5 sm:gap-2 flex-wrap">
                {listing.meal && <span className="chip text-xs">{listing.meal}</span>}
                {Array.isArray(listing.amenities) && listing.amenities.slice(0,3).map((a,i)=>(<span key={i} className="chip text-xs">{a}</span>))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 sm:gap-3 flex-shrink-0">
              <button onClick={()=>onBook(listing)} className="brand-btn text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap">Book</button>
              <div className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">Host</div>
            </div>
          </div>
        </div>
      </motion.article>

      <ImageLightbox open={previewOpen} onClose={()=>setPreviewOpen(false)} src={imageUrl} title={listing.title} />
    </>
  );
}
