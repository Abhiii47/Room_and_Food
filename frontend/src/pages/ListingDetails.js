import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { createBooking } from '../api/bookings';
import AuthContext from '../context/AuthContext';
import { MapPin, ArrowLeft, Calendar, CheckCircle, Star } from 'lucide-react';
import Reviews from '../components/Reviews';
import '../styles/Listings.css'; // Reuse existing styles

const ListingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingDates, setBookingDates] = useState({ fromDate: '', toDate: '' });
    const [bookingStatus, setBookingStatus] = useState(null); // 'loading', 'success', 'error'

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await apiClient.get(`/listings/${id}`);
                setListing(res.data);
            } catch (err) {
                console.error("Error fetching listing:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setBookingStatus('loading');
            await createBooking({
                listingId: id,
                fromDate: bookingDates.fromDate,
                toDate: bookingDates.toDate
            });
            setBookingStatus('success');
            setTimeout(() => navigate('/bookings'), 2000);
        } catch (err) {
            console.error("Booking failed:", err);
            setBookingStatus('error');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!listing) return <div className="p-8 text-center">Listing not found.</div>;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft size={20} /> Back to Listings
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-panel p-2 rounded-2xl overflow-hidden">
                            <img
                                src={listing.imageUrl || "https://images.unsplash.com/photo-1522771753033-d47455c69786?auto=format&fit=crop&w=1200&q=80"}
                                alt={listing.title}
                                className="w-full h-96 object-cover rounded-xl"
                            />
                        </div>

                        <div className="glass-panel p-8 rounded-2xl">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin size={18} /> {listing.address || "Location not specified"}
                                    </p>
                                </div>
                                <span className="text-2xl font-bold text-primary">₹{listing.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                            </div>

                            <div className="divider my-6 border-t border-border/50"></div>

                            <h3 className="text-xl font-semibold mb-3">Description</h3>
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                {listing.description || "No description provided."}
                            </p>

                            <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {listing.amenities && listing.amenities.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Rating Display */}
                            {listing.averageRating && listing.averageRating > 0 && (
                                <div className="flex items-center gap-2 mb-6 pt-6 border-t border-border/50">
                                    <div className="flex items-center gap-1">
                                        <Star size={20} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-xl font-bold">{listing.averageRating.toFixed(1)}</span>
                                    </div>
                                    <span className="text-muted-foreground">
                                        ({listing.reviewCount || 0} {listing.reviewCount === 1 ? 'review' : 'reviews'})
                                    </span>
                                </div>
                            )}

                            {/* Reviews Section */}
                            <Reviews listingId={listing._id} />
                        </div>
                    </div>

                    {/* Sidebar Booking Form */}
                    <div className="lg:col-span-1">
                        <div className="glass-panel p-6 rounded-2xl sticky top-24">
                            {/* Check if user is the owner of this listing */}
                            {user && listing.owner && (user._id === listing.owner || user._id === listing.owner._id) ? (
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-4">Your Listing</h3>
                                    <p className="text-muted-foreground mb-4">
                                        This is your listing. You cannot book your own listings.
                                    </p>
                                    <Link
                                        to="/dashboard/provider"
                                        className="btn btn-primary w-full"
                                    >
                                        Manage My Listings
                                    </Link>
                                    <Link
                                        to="/dashboard/booking-requests"
                                        className="btn btn-outline w-full mt-3"
                                    >
                                        View Booking Requests
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold mb-4">Book this {listing.type}</h3>

                                    {bookingStatus === 'success' ? (
                                        <div className="bg-green-100 text-green-800 p-4 rounded-xl flex flex-col items-center text-center">
                                            <CheckCircle size={48} className="mb-2" />
                                            <p className="font-bold">Booking Requested!</p>
                                            <p className="text-sm">Redirecting to your bookings...</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleBooking} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">From</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                                    <input
                                                        type="date"
                                                        required
                                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                                                        value={bookingDates.fromDate}
                                                        onChange={(e) => setBookingDates({ ...bookingDates, fromDate: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">To</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                                    <input
                                                        type="date"
                                                        required
                                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                                                        value={bookingDates.toDate}
                                                        onChange={(e) => setBookingDates({ ...bookingDates, toDate: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {bookingStatus === 'error' && (
                                                <div className="text-red-500 text-sm">Booking failed. Please try again.</div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={bookingStatus === 'loading'}
                                                className="w-full btn btn-primary py-3 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                                            >
                                                {bookingStatus === 'loading' ? 'Processing...' : 'Request Booking'}
                                            </button>

                                            {!user && (
                                                <p className="text-xs text-center text-muted-foreground mt-2">
                                                    You need to <Link to="/login" className="text-primary underline">sign in</Link> to book.
                                                </p>
                                            )}
                                        </form>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetails;
