// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

export default function Navbar({ user=null, onLogout=()=>{} }){
  const loc = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header initial={{y:-10,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.35}} className="w-full bg-gradient-to-r from-amber-50/90 via-emerald-50/90 to-blue-50/90 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b-2 border-amber-200/30 dark:border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500 via-emerald-500 to-blue-500 dark:from-amber-400 dark:via-emerald-400 dark:to-blue-400 text-white dark:text-slate-900 font-bold shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12 relative overflow-hidden">
              <span className="relative z-10 text-xl sm:text-2xl">🏠</span>
              <div className="absolute inset-0 bg-white/20 dark:bg-slate-900/20 animate-sparkle"></div>
            </div>
            <div className="hidden sm:block">
              <div className="text-base sm:text-lg font-bold leading-4 rainbow-text">Room & Food Finder</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Find stays & meals nearby</div>
            </div>
            <div className="sm:hidden">
              <div className="text-sm font-bold rainbow-text">R&F Finder</div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          <Link className={`text-sm px-3 xl:px-4 py-2 rounded-xl font-medium transition-all ${loc.pathname==='/' ? 'text-amber-600 dark:text-amber-400 font-bold bg-white/70 dark:bg-slate-700/70 shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`} to="/">Home</Link>
          <Link className={`text-sm px-3 xl:px-4 py-2 rounded-xl font-medium transition-all ${loc.pathname==='/listings' ? 'text-amber-600 dark:text-amber-400 font-bold bg-white/70 dark:bg-slate-700/70 shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`} to="/listings">Listings</Link>
          {user && (
            <Link className={`text-sm px-3 xl:px-4 py-2 rounded-xl font-medium transition-all ${loc.pathname==='/bookings' ? 'text-amber-600 dark:text-amber-400 font-bold bg-white/70 dark:bg-slate-700/70 shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`} to="/bookings">My Bookings</Link>
          )}
          {user && (user.role === 'provider' || user.role === 'admin') && (
            <>
              <Link className={`text-sm px-3 xl:px-4 py-2 rounded-xl font-medium transition-all ${loc.pathname==='/dashboard' ? 'text-amber-600 dark:text-amber-400 font-bold bg-white/70 dark:bg-slate-700/70 shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`} to="/dashboard">Dashboard</Link>
              <Link className={`text-sm px-3 xl:px-4 py-2 rounded-xl font-medium transition-all ${loc.pathname==='/create' ? 'text-amber-600 dark:text-amber-400 font-bold bg-white/70 dark:bg-slate-700/70 shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`} to="/create">Create</Link>
            </>
          )}
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-xs xl:text-sm text-slate-700 dark:text-slate-300 hidden xl:block">Hi, <span className="font-medium">{user.name || user.username || (user.email?.split?.('@')?.[0])}</span></div>
              <button onClick={onLogout} className="px-2 xl:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-xs xl:text-sm">Sign out</button>
            </div>
          ) : (
            <Link to="/login" className="brand-btn text-xs xl:text-sm px-3 xl:px-5">Sign in</Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          {!user && (
            <Link to="/login" className="brand-btn text-xs px-3 py-2">Sign in</Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/70 dark:bg-slate-700/70 border-2 border-amber-200 dark:border-emerald-500/30 text-slate-700 dark:text-slate-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-amber-200/30 dark:border-emerald-500/20"
          >
            <nav className="px-4 py-4 space-y-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md">
              <Link
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-medium transition-all ${loc.pathname==='/' ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-emerald-900/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                to="/"
              >
                Home
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-medium transition-all ${loc.pathname==='/listings' ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-emerald-900/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                to="/listings"
              >
                Listings
              </Link>
              {user && (
                <>
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-medium transition-all ${loc.pathname==='/bookings' ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-emerald-900/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    to="/bookings"
                  >
                    My Bookings
                  </Link>
                  {(user.role === 'provider' || user.role === 'admin') && (
                    <>
                      <Link
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl font-medium transition-all ${loc.pathname==='/dashboard' ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-emerald-900/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        to="/dashboard"
                      >
                        Dashboard
                      </Link>
                      <Link
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl font-medium transition-all ${loc.pathname==='/create' ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-emerald-900/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        to="/create"
                      >
                        Create Listing
                      </Link>
                    </>
                  )}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                    <div className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">Hi, <span className="font-medium text-slate-700 dark:text-slate-300">{user.name || user.username || (user.email?.split?.('@')?.[0])}</span></div>
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-medium"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function ThemeToggle(){
  const [mode,setMode] = React.useState(()=> {
    const saved = localStorage.getItem('rff-theme');
    if (saved) return saved;
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  
  React.useEffect(()=>{ 
    if(mode==='dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('rff-theme', mode); 
  }, [mode]);
  
  return (
    <button 
      onClick={()=>setMode(m => m==='light'?'dark':'light')} 
      className="px-3 py-1.5 rounded-xl border-2 border-amber-200 dark:border-emerald-500/30 bg-white/80 dark:bg-slate-700/80 text-sm font-medium text-amber-700 dark:text-emerald-300 hover:bg-amber-50 dark:hover:bg-emerald-900/20 transition-all"
      aria-label="Toggle theme"
    >
      {mode==='light'?'🌙 Dark':'☀️ Light'}
    </button>
  );
}
