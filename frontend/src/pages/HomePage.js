import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, MapPin, Coffee, Home, Filter, Map as MapIcon, Grid, Sun, Moon, Star } from 'lucide-react';
import apiClient from '../api/apiClient';
import MapComponent from '../components/MapComponent';
import '../styles/Listings.css';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
    const containerRef = useRef(null);
    const sidebarRef = useRef(null);
    const searchBarRef = useRef(null);
    const listingsRef = useRef(null);
    const heroRef = useRef(null);
    const [activeTab, setActiveTab] = useState('all');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Listings on Mount - No login required
    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get('/listings');
                // Listings are public and don't require authentication
                if (res.data && Array.isArray(res.data)) {
                    setListings(res.data);
                } else {
                    setListings([]);
                }
            } catch (err) {
                console.error("Failed to fetch listings:", err);
                // Even if there's an error, set empty array so UI doesn't break
                setListings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    // Filtering Logic
    // Filtering Logic
    const filteredListings = listings.filter(item => {
        const matchesTab = activeTab === 'all' || item.type === activeTab;
        const query = searchQuery.toLowerCase().trim();

        if (!query) return matchesTab;

        // Expanded search criteria
        const matchesSearch =
            (item.title && item.title.toLowerCase().includes(query)) ||
            (item.address && item.address.toLowerCase().includes(query)) ||
            (item.city && item.city.toLowerCase().includes(query)) || // Check city specifically
            (item.state && item.state.toLowerCase().includes(query)) ||
            (item.zip && item.zip.includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query)) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query))) ||
            (item.amenities && item.amenities.some(am => am.toLowerCase().includes(query)));

        return matchesTab && matchesSearch;
    });

    // GSAP Scroll Animations
    useEffect(() => {
        if (loading) return;

        const ctx = gsap.context(() => {
            // Hero section animation
            if (heroRef.current) {
                gsap.from(heroRef.current, {
                    y: 30,
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.out'
                });
            }

            // Sidebar animation - only on initial load, not scroll
            if (sidebarRef.current) {
                gsap.from(sidebarRef.current, {
                    x: -50,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    delay: 0.2
                });
            }

            // Search bar animation - only on initial load
            if (searchBarRef.current) {
                gsap.from(searchBarRef.current, {
                    y: 30,
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                    delay: 0.3
                });
            }


            // Listings grid animation with scroll trigger
            // run only ONCE when the component mounts or view mode changes, NOT when filtering changes
            if (listingsRef.current && !loading) {
                const listingCards = listingsRef.current.querySelectorAll('.listing-card');
                if (listingCards.length > 0) {
                    // Check if we already animated them to avoid re-animating on every keystroke
                    if (!listingsRef.current.dataset.animated) {
                        gsap.from(listingCards, {
                            y: 60,
                            opacity: 0,
                            scale: 0.9,
                            duration: 0.8,
                            stagger: {
                                amount: 0.6,
                                from: 'start'
                            },
                            ease: 'back.out(1.2)',
                            scrollTrigger: {
                                trigger: listingsRef.current,
                                start: 'top 75%',
                                toggleActions: 'play none none none',
                                once: true
                            },
                            onComplete: () => {
                                if (listingsRef.current) listingsRef.current.dataset.animated = "true";
                            }
                        });
                    }
                }
            }

            // Animate category buttons on hover
            const categoryButtons = containerRef.current?.querySelectorAll('[class*="categories"] button, .space-y-2 button');
            if (categoryButtons) {
                categoryButtons.forEach((btn) => {
                    btn.addEventListener('mouseenter', () => {
                        gsap.to(btn, {
                            scale: 1.05,
                            duration: 0.2,
                            ease: 'power2.out'
                        });
                    });
                    btn.addEventListener('mouseleave', () => {
                        gsap.to(btn, {
                            scale: 1,
                            duration: 0.2,
                            ease: 'power2.out'
                        });
                    });
                });
            }
        }, containerRef);

        return () => {
            ctx.revert();
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [loading, viewMode, filteredListings.length]);



    const categories = [
        { id: 'all', label: 'All', icon: <Filter size={18} /> },
        { id: 'room', label: 'Rooms', icon: <Home size={18} /> },
        { id: 'food', label: 'Food', icon: <Coffee size={18} /> },
    ];

    // Geolocation Search
    const handleNearMe = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchListingsByLocation(latitude, longitude);
                setSearchQuery("Current Location");
            },
            () => {
                alert("Unable to retrieve your location");
                setLoading(false);
            }
        );
    };

    const fetchListingsByLocation = async (lat, lng) => {
        try {
            setLoading(true);
            // Call backend with coordinates
            const res = await apiClient.get('/listings', {
                params: { lat, lng, radius: 50 } // 50km radius
            });
            if (res.data && Array.isArray(res.data)) {
                setListings(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch nearby listings:", err);
        } finally {
            setLoading(false);
        }
    };

    // Modified search handler to capture Enter key
    const handleSearch = async (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setLoading(true);
            // Try to geocode the query first using OpenStreetMap logic
            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
                const geoData = await geoRes.json();

                if (geoData && geoData.length > 0) {
                    // Found a location match!
                    const { lat, lon } = geoData[0];
                    await fetchListingsByLocation(lat, lon);
                } else {
                    // Fallback to text filtering locally if not a location
                    // Re-fetch all to ensure we have clear list to filter locally
                    const res = await apiClient.get('/listings');
                    setListings(res.data || []);
                }
            } catch (err) {
                console.error("Geocoding failed, falling back to text search", err);
                const res = await apiClient.get('/listings');
                setListings(res.data || []);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 md:p-6 lg:p-8 transition-colors duration-300">
            {/* Hero Section */}
            <div ref={heroRef} className="max-w-7xl mx-auto mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Find Your Perfect Room & Food
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Discover amazing rooms and food services near you
                </p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Sidebar Controls */}
                <aside ref={sidebarRef} className="dashboard-item lg:col-span-1 z-20">
                    <div className="glass-panel p-6 rounded-2xl sticky top-24 h-fit">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-primary">✨</span> Discover
                        </h2>

                        {/* Filters */}
                        <div className="space-y-2 mb-8">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === cat.id
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {cat.icon}
                                    <span className="font-medium">{cat.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* View Toggle */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">View Mode</h3>
                            <div className="flex bg-secondary/50 p-1 rounded-xl">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Grid size={16} /> List
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <MapIcon size={16} /> Map
                                </button>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                            <h3 className="font-semibold mb-2">Quick Stats</h3>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Active Listings</span>
                                <span className="font-bold stat-number">{listings.length}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Active Rooms</span>
                                <span className="font-bold stat-number text-emerald-500">
                                    {listings.filter(l => l.type === 'room').length}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Active Food Spots</span>
                                <span className="font-bold stat-number text-orange-500">
                                    {listings.filter(l => l.type === 'food').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-3 space-y-6">

                    {/* Search Bar */}
                    <div ref={searchBarRef} className="dashboard-item glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:max-w-lg z-10">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                placeholder="Search by city, area, or zip code... (Press Enter)"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        </div>
                        <button
                            onClick={handleNearMe}
                            className="btn btn-outline flex items-center gap-2 whitespace-nowrap"
                        >
                            <MapPin size={18} /> Near Me
                        </button>
                    </div>

                    {/* Dynamic Content: List vs Map */}
                    {viewMode === 'list' ? (
                        <div ref={listingsRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredListings.length > 0 ? (
                                filteredListings.map(item => (
                                    <div key={item._id} className="dashboard-item group">
                                        <div className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-white/10 h-full flex flex-col">
                                            <div className="relative h-48 bg-muted overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                                <img src={item.imageUrl || "https://images.unsplash.com/photo-1522771753033-d47455c69786?auto=format&fit=crop&w=800&q=80"} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                <span className={`absolute top-4 right-4 z-20 badge badge-default border-none text-white ${item.type === 'food' ? 'bg-orange-500' : 'bg-emerald-500'}`}>
                                                    {item.type === 'food' ? 'Food' : 'Room'}
                                                </span>
                                                <div className="absolute bottom-4 left-4 z-20 text-white">
                                                    <p className="text-lg font-bold truncate pr-4">{item.title}</p>
                                                    <p className="text-sm opacity-90 flex items-center gap-1"><MapPin size={14} /> {item.address || "Location not specified"}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col justify-between">
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {item.amenities && item.amenities.slice(0, 3).map((tag, i) => (
                                                        <span key={i} className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground">{tag}</span>
                                                    ))}
                                                </div>
                                                {item.distance !== undefined && (
                                                    <div className="mb-2 text-xs font-semibold text-primary flex items-center gap-1">
                                                        <MapPin size={12} /> {item.distance.toFixed(1)} km away
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                    <div>
                                                        <span className="text-2xl font-bold text-primary">₹{item.price}</span>
                                                        {item.averageRating && item.averageRating > 0 && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                                <span className="text-sm font-semibold">{item.averageRating.toFixed(1)}</span>
                                                                <span className="text-xs text-muted-foreground">({item.reviewCount || 0})</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Link to={`/listings/${item._id}`} className="btn btn-sm btn-outline rounded-lg hover:bg-primary hover:text-white transition-colors">
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center text-muted-foreground">
                                    {searchQuery ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-lg font-semibold">Coming soon to your city or not available yet.</p>
                                            <p className="text-sm opacity-70">We are expanding rapidly! Check back later for listings in "{searchQuery}".</p>
                                        </div>
                                    ) : (
                                        "No listings available at the moment."
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Map View */
                        <div className="dashboard-item h-[600px] w-full">
                            {filteredListings.length > 0 ? (
                                <MapComponent listings={filteredListings} />
                            ) : (
                                <div className="h-full flex items-center justify-center glass-panel rounded-2xl">
                                    <p className="text-muted-foreground">No listings to display on map</p>
                                </div>
                            )}
                        </div>
                    )}

                </main >
            </div >
        </div >
    );
};

export default HomePage;
