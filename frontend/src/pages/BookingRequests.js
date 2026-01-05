import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, MapPin, Calendar, User, Mail } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { getBookingRequests, respondToBooking } from '../api/bookings';
import '../styles/Listings.css';

const BookingRequests = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState({});

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

        fetchRequests();
    }, [user, navigate]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getBookingRequests();
            setRequests(data);
        } catch (err) {
            console.error('Failed to fetch booking requests:', err);
            setError('Failed to load booking requests. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (bookingId, approve) => {
        try {
            setProcessing({ ...processing, [bookingId]: true });
            await respondToBooking(bookingId, approve);
            // Refresh the list
            await fetchRequests();
        } catch (err) {
            console.error('Failed to respond to booking:', err);
            alert('Failed to ' + (approve ? 'approve' : 'reject') + ' booking. Please try again.');
        } finally {
            setProcessing({ ...processing, [bookingId]: false });
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            requested: { label: 'Pending', icon: <Clock size={16} />, className: 'bg-yellow-500' },
            approved: { label: 'Approved', icon: <CheckCircle size={16} />, className: 'bg-green-500' },
            rejected: { label: 'Rejected', icon: <XCircle size={16} />, className: 'bg-red-500' },
            cancelled: { label: 'Cancelled', icon: <XCircle size={16} />, className: 'bg-gray-500' },
        };

        const config = statusConfig[status] || statusConfig.requested;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-medium ${config.className}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-7xl mx-auto text-center">Loading booking requests...</div>
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Booking Requests</h1>
                    <p className="text-muted-foreground">Manage booking requests for your listings</p>
                </div>

                {requests.length === 0 ? (
                    <div className="glass-panel p-12 rounded-2xl text-center">
                        <h2 className="text-2xl font-bold mb-4">No Booking Requests Yet</h2>
                        <p className="text-muted-foreground mb-6">
                            You will see booking requests from students here when they book your listings.
                        </p>
                        <Link to="/dashboard/provider" className="btn btn-primary">
                            View My Listings
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request._id} className="glass-panel p-6 rounded-2xl border border-white/10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Booking Info */}
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold mb-2">
                                                    {request.listing?.title || 'Listing'}
                                                </h3>
                                                {getStatusBadge(request.status || 'requested')}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <User size={18} />
                                                <span className="font-medium">{request.user?.name || 'Unknown User'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail size={18} />
                                                <span>{request.user?.email || 'N/A'}</span>
                                            </div>
                                            {request.fromDate && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar size={18} />
                                                    <span>From: {new Date(request.fromDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {request.toDate && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar size={18} />
                                                    <span>To: {new Date(request.toDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            Requested on: {new Date(request.createdAt).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-3">
                                        {request.status === 'requested' && (
                                            <>
                                                <button
                                                    onClick={() => handleRespond(request._id, true)}
                                                    disabled={processing[request._id]}
                                                    className="btn btn-primary flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle size={18} />
                                                    {processing[request._id] ? 'Processing...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(request._id, false)}
                                                    disabled={processing[request._id]}
                                                    className="btn btn-outline text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center gap-2"
                                                >
                                                    <XCircle size={18} />
                                                    {processing[request._id] ? 'Processing...' : 'Reject'}
                                                </button>
                                            </>
                                        )}
                                        {request.listing && (
                                            <Link
                                                to={`/listings/${request.listing._id}`}
                                                className="btn btn-outline text-center"
                                            >
                                                View Listing
                                            </Link>
                                        )}
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

export default BookingRequests;

