import React, { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';

// Pages & Components
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import ListingDetails from './pages/ListingDetails';
import ProviderDashboard from './pages/ProviderDashboard';
import CreateListing from './pages/CreateListing';
import BookingRequests from './pages/BookingRequests';
import AdminDashboard from './pages/AdminDashboard';
import MyBookings from './components/MyBookings';
import Chat from './components/Chat';
import Header from './components/Header';
import PageTransition from './components/PageTransition';

import { AuthProvider } from './context/AuthContext';

import SmoothScroll from './components/SmoothScroll';

function App() {
    const location = useLocation();
    const mainRef = useRef(null);

    useEffect(() => {
        // Simple page transition effect
        gsap.fromTo(mainRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
    }, [location]);

    return (
        <AuthProvider>
            <SmoothScroll>
                <div className="app-container min-h-screen bg-background text-foreground flex flex-col">
                    <Header />
                    <main ref={mainRef} className="flex-1 w-full">
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/explore" element={<HomePage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/listings/:id" element={<ListingDetails />} />
                            <Route path="/listings/create" element={<CreateListing />} />
                            <Route path="/listings/:id/edit" element={<CreateListing />} />
                            <Route path="/bookings" element={<MyBookings />} />
                            <Route path="/dashboard/provider" element={<ProviderDashboard />} />
                            <Route path="/dashboard/booking-requests" element={<BookingRequests />} />
                            <Route path="/dashboard/admin" element={<AdminDashboard />} />
                            <Route path="/dashboard/chat" element={<Chat />} />
                        </Routes>
                    </main>
                </div>
            </SmoothScroll>
        </AuthProvider>
    );
}

export default App;
