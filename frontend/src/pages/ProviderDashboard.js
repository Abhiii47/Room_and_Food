import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, MapPin, Eye } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { getProviderListings, deleteListing } from '../api/listings';
import '../styles/Listings.css';

const ProviderDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is a provider
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'provider' && user.role !== 'admin') {
            setError('Access denied. Only providers can access this page.');
            setLoading(false);
            return;
        }

        fetchListings();
    }, [user, navigate]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const data = await getProviderListings();
            setListings(data);
        } catch (err) {
            console.error('Failed to fetch listings:', err);
            setError('Failed to load listings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) {
            return;
        }

        try {
            await deleteListing(id);
            setListings(listings.filter(listing => listing._id !== id));
        } catch (err) {
            console.error('Failed to delete listing:', err);
            alert('Failed to delete listing. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-7xl mx-auto text-center">Loading your listings...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-panel p-8 rounded-2xl text-center">
                        <p className="text-red-500">{error}</p>
                        <Link to="/" className="btn btn-primary mt-4">Go Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">My Listings</h1>
                        <p className="text-lg text-muted-foreground">Manage and track your property and food service listings.</p>
                    </div>
                    <Link
                        to="/listings/create"
                        className="btn btn-primary rounded-full px-6 py-3 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} />
                        <span className="font-semibold">Create New Listing</span>
                    </Link>
                </div>

                {listings.length === 0 ? (
                    <div className="glass-panel p-16 rounded-3xl text-center border border-dashed border-border/50 bg-secondary/20">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plus size={40} className="text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">No Listings Yet</h2>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                            You haven't posted any listings yet. Start attracting customers by adding your rooms or food services.
                        </p>
                        <Link to="/listings/create" className="btn btn-primary rounded-full px-8 py-3 text-lg">
                            Create Your First Listing
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {listings.map((listing) => (
                            <div key={listing._id} className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
                                {/* Image Section */}
                                <div className="relative h-56 bg-muted overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                                    <img
                                        src={listing.imageUrl || listing.images?.[0] || "https://images.unsplash.com/photo-1522771753033-d47455c69786?auto=format&fit=crop&w=800&q=80"}
                                        alt={listing.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-md border border-white/20 ${listing.type === 'food' ? 'bg-orange-500/90' : 'bg-emerald-500/90'}`}>
                                            {listing.type === 'food' ? 'Food & Dining' : 'Accommodation'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                                        {listing.price && (
                                            <div className="text-white">
                                                <p className="text-xs opacity-80 uppercase tracking-wider font-semibold">Price</p>
                                                <p className="text-2xl font-bold">₹{listing.price}<span className="text-sm font-normal opacity-70">/mo</span></p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-3 truncate leading-snug group-hover:text-primary transition-colors">{listing.title}</h3>

                                    {listing.address && (
                                        <p className="text-sm text-muted-foreground flex items-start gap-2 mb-6 line-clamp-2 min-h-[2.5em]">
                                            <MapPin size={16} className="mt-0.5 shrink-0" />
                                            {listing.address}
                                        </p>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <Link
                                            to={`/listings/${listing._id}`}
                                            className="col-span-1 btn btn-sm btn-outline rounded-xl hover:bg-secondary hover:text-foreground flex flex-col items-center justify-center py-3 h-auto gap-1 border-border/50"
                                            title="View Public Page"
                                        >
                                            <Eye size={18} />
                                            <span className="text-xs">View</span>
                                        </Link>
                                        <Link
                                            to={`/listings/${listing._id}/edit`}
                                            className="col-span-1 btn btn-sm btn-outline rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-primary flex flex-col items-center justify-center py-3 h-auto gap-1 border-border/50 transition-colors"
                                            title="Edit Listing"
                                        >
                                            <Edit size={18} />
                                            <span className="text-xs">Edit</span>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(listing._id)}
                                            className="col-span-1 btn btn-sm btn-outline rounded-xl hover:bg-red-500/10 hover:text-red-600 hover:border-red-200 text-red-500/80 flex flex-col items-center justify-center py-3 h-auto gap-1 border-border/50 transition-colors"
                                            title="Delete Listing"
                                        >
                                            <Trash2 size={18} />
                                            <span className="text-xs">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderDashboard;
