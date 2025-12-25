// src/App.jsx
import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Listings from './pages/Listings'
import CreateListing from './pages/CreateListing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import MyBookings from './pages/MyBookings'
import ListingDetails from './pages/ListingDetails'
import API from './services/api'

function readInitialUser(){ try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null } }

export default function App(){
  const [user,setUser] = useState(readInitialUser())
  const navigate = useNavigate()

  useEffect(()=>{ (async()=>{ try{ await API.get('/listings').catch(()=>{}) }catch{} })() },[])

  const handleLogout = ()=>{ 
    localStorage.removeItem('user'); 
    localStorage.removeItem('token'); 
    setUser(null); 
    navigate('/login')
  }

  // pass user and logout handler into Navbar
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 relative z-10 scroll-smooth">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/listings" element={<Listings user={user} />} />
          <Route path="/create" element={<CreateListing user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/login" element={<Login setUser={(u)=>{ localStorage.setItem('user', JSON.stringify(u)); setUser(u)}} />} />
          <Route path="/bookings" element={<MyBookings user={user} />} />
          <Route path="/listing/:id" element={<ListingDetails user={user} />} />
        </Routes>
      </main>
    </div>
  )
}





