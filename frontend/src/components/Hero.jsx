// src/components/Hero.jsx
import React from "react";
import { motion } from "framer-motion";
import LocationSearch from "./LocationSearch";

export default function Hero({ onSearch=()=>{}, onLocationSelect }){
  return (
    <section className="hero-wrapper relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 mb-6 sm:mb-10 bg-gradient-to-br from-amber-50 via-emerald-50 to-blue-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 overflow-hidden border-2 border-amber-200/30 dark:border-emerald-500/20 shadow-2xl unicorn-glow">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
        <div>
          <motion.h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight sm:leading-snug rainbow-text sparkle" initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{delay:0.05}}>
            ✨ Find comfortable stays & tasty meals nearby
          </motion.h1>
          <motion.p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 sm:mt-3" initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{delay:0.12}}>
            Fast search, map view and provider dashboard — made for students and working professionals.
          </motion.p>

          <motion.div className="mt-6 flex flex-col sm:flex-row gap-3 relative z-20" initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{delay:0.2}}>
            <div className="flex-1 relative z-30">
              <LocationSearch 
                onLocationSelect={(location) => {
                  onLocationSelect?.(location)
                  if (location) onSearch()
                }}
                placeholder="Search by city, college or locality"
              />
            </div>
            <button className="shadcn-button-primary flex-shrink-0" onClick={onSearch}>
              Search
            </button>
          </motion.div>

          <motion.div className="mt-3 sm:mt-4 flex gap-2 items-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex-wrap" initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{delay:0.25}}>
            <span className="chip text-xs">Veg</span>
            <span className="chip text-xs">Non-veg</span>
            <span className="chip text-xs">With Mess</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 sm:ml-4 hidden sm:inline">Popular: Pune · Mumbai · Bangalore</span>
          </motion.div>
        </div>

        <div className="relative hidden lg:block">
          <motion.div className="glass-card p-4 sm:p-5 floaty" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:0.18}}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-amber-600 dark:text-emerald-400 font-semibold">Top pick</div>
                <div className="text-base sm:text-lg font-semibold mt-1 text-slate-800 dark:text-slate-100">Cozy apartment</div>
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">Near campus — quick commute</div>
                <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3">
                  <button className="brand-btn text-xs sm:text-sm px-3 sm:px-5 py-2">Book now</button>
                  <button className="px-2 sm:px-3 py-1.5 rounded-xl border-2 border-amber-200 dark:border-emerald-500/30 text-amber-700 dark:text-emerald-300 hover:bg-amber-50 dark:hover:bg-emerald-900/20 transition-all text-xs sm:text-sm">Details</button>
                </div>
              </div>
              <div className="w-32 sm:w-40 h-24 sm:h-28 overflow-hidden rounded-xl shadow-sm">
                <img src="https://source.unsplash.com/collection/190727/400x300?sig=hero" className="w-full h-full object-cover" alt="Top pick listing" />
              </div>
            </div>
          </motion.div>

          <div className="gradient-orb"></div>
        </div>
      </div>
    </section>
  );
}
