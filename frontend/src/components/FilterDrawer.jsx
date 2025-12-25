// src/components/FilterDrawer.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FilterDrawer({ open=false, onClose=()=>{}, onApply=()=>{} }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-black/30 z-30" />
          <motion.aside 
            initial={{x:'100%'}} 
            animate={{x:0}} 
            exit={{x:'100%'}} 
            transition={{type:'spring', damping: 25, stiffness: 200}} 
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-slate-800 z-50 shadow-2xl p-4 sm:p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">Filters</h4>
              <button 
                onClick={onClose} 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                aria-label="Close filters"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Price range</label>
                <div className="mt-2 flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="input w-full px-3 py-2 text-sm" 
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="input w-full px-3 py-2 text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Meal type</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="chip hover:scale-105">Veg</button>
                  <button className="chip hover:scale-105">Non-veg</button>
                  <button className="chip hover:scale-105">With Mess</button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={onApply} className="brand-btn w-full">Apply filters</button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
