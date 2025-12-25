// src/components/ImageLightbox.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageLightbox({ open=false, onClose=()=>{}, src='', title='' }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="lightbox-backdrop" />
          <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:10,opacity:0}} transition={{type:'spring'}} className="fixed z-60 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-4xl">
            <div className="lightbox-content">
              <img src={src} alt={title} className="w-full h-[520px] object-cover" />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{title}</div>
                  <div className="text-sm text-slate-500">Image preview</div>
                </div>
                <button onClick={onClose} className="px-3 py-1 rounded-md border">Close</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

