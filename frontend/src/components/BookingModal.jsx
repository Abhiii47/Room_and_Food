// src/components/BookingModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingModal({ open=false, listing=null, onClose=()=>{}, onConfirm=()=>{} }) {
  const [from,setFrom] = useState('');
  const [to,setTo] = useState('');

  useEffect(()=> {
    if (!open) { setFrom(''); setTo(''); }
  }, [open]);

  const submit = () => {
    if (!from || !to) return alert('Select from and to dates');
    onConfirm({ listing, from, to });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />
          <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:10,opacity:0}} transition={{type:'spring'}} className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-lg">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Book: {listing?.title}</h3>
                  <div className="text-sm text-slate-500">{listing?.address}</div>
                </div>
                <button onClick={onClose} className="text-slate-500">Close</button>
              </div>

              <div className="grid gap-3">
                <label className="text-sm text-slate-600">From</label>
                <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="px-4 py-2 rounded-lg border" />
                <label className="text-sm text-slate-600">To</label>
                <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="px-4 py-2 rounded-lg border" />

                <div className="flex items-center gap-3 mt-4">
                  <button onClick={submit} className="brand-btn">Confirm booking</button>
                  <button onClick={onClose} className="px-3 py-1 rounded-md border">Cancel</button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

