import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, MapPin, DollarSign, Eye } from 'lucide-react';
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
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Listings</h1>
                        <p className="text-muted-foreground">Manage your rooms and food listings</p>
                    </div>
                    <Link
                        to="/listings/create"
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Create New Listing
                    </Link>
                </div>

                {listings.length === 0 ? (
                    <div className="glass-panel p-12 rounded-2xl text-center">
                        <h2 className="text-2xl font-bold mb-4">No Listings Yet</h2>
                        <p className="text-muted-foreground mb-6">
                            Start by creating your first listing for rooms or food services.
                        </p>
                        <Link to="/listings/create" className="btn btn-primary">
                            Create Your First Listing
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing) => (
                            <div key={listing._id} className="glass-card rounded-2xl overflow-hidden border border-white/10">
                                <div className="relative h-48 bg-muted overflow-hidden">
                                    <img
                                        src={listing.imageUrl || listing.images?.[0] || "https://images.unsplash.com/photo-1522771753033-d47455c69786?auto=format&fit=crop&w=800&q=80"}
                                        alt={listing.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <span className={`absolute top-4 right-4 z-20 badge badge-default border-none text-white ${listing.type === 'food' ? 'bg-orange-500' : 'bg-emerald-500'}`}>
                                        {listing.type === 'food' ? 'Food' : 'Room'}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-xl font-bold mb-2 truncate">{listing.title}</h3>
                                    {listing.address && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                                            <MapPin size={14} />
                                            {listing.address}
                                        </p>
                                    )}
                                    {listing.price && (
                                        <p className="text-lg font-bold text-primary mb-4 flex items-center gap-1">
                                            <DollarSign size={18} />
                                            ₹{listing.price}/month
                                        </p>
                                    )}
                                    <div className="flex gap-2 mt-4">
                                        <Link
                                            to={`/listings/${listing._id}`}
                                            className="flex-1 btn btn-sm btn-outline flex items-center justify-center gap-2"
                                        >
                                            <Eye size={16} />
                                            View
                                        </Link>
                                        <Link
                                            to={`/listings/${listing._id}/edit`}
                                            className="flex-1 btn btn-sm btn-outline flex items-center justify-center gap-2"
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(listing._id)}
                                            className="btn btn-sm btn-outline text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={16} />
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

