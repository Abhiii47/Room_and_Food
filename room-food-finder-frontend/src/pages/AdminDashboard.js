import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Home, Calendar, Star, Trash2, Edit, Shield, UserCheck } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { 
    getAdminStats, 
    getAdminUsers, 
    getAdminListings, 
    getAdminBookings, 
    getAdminReviews,
    deleteAdminUser,
    deleteAdminListing,
    deleteAdminBooking,
    deleteAdminReview,
    updateUserRole
} from '../api/admin';
import '../styles/Listings.css';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'admin') {
            setError('Access denied. Admin access required.');
            setLoading(false);
            return;
        }
        loadData();
    }, [user, navigate, activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'stats') {
                const data = await getAdminStats();
                setStats(data);
            } else if (activeTab === 'users') {
                const data = await getAdminUsers();
                setUsers(data);
            } else if (activeTab === 'listings') {
                const data = await getAdminListings();
                setListings(data);
            } else if (activeTab === 'bookings') {
                const data = await getAdminBookings();
                setBookings(data);
            } else if (activeTab === 'reviews') {
                const data = await getAdminReviews();
                setReviews(data);
            }
        } catch (err) {
            console.error('Failed to load admin data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            if (type === 'user') {
                await deleteAdminUser(id);
                setUsers(users.filter(u => u._id !== id));
            } else if (type === 'listing') {
                await deleteAdminListing(id);
                setListings(listings.filter(l => l._id !== id));
            } else if (type === 'booking') {
                await deleteAdminBooking(id);
                setBookings(bookings.filter(b => b._id !== id));
            } else if (type === 'review') {
                await deleteAdminReview(id);
                setReviews(reviews.filter(r => r._id !== id));
            }
        } catch (err) {
            alert(`Failed to delete ${type}. Please try again.`);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert('Failed to update user role. Please try again.');
        }
    };

    if (loading && activeTab === 'stats') {
        return <div className="min-h-screen bg-background p-8 text-center">Loading...</div>;
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

    const tabs = [
        { id: 'stats', label: 'Statistics', icon: <Shield size={18} /> },
        { id: 'users', label: 'Users', icon: <Users size={18} /> },
        { id: 'listings', label: 'Listings', icon: <Home size={18} /> },
        { id: 'bookings', label: 'Bookings', icon: <Calendar size={18} /> },
        { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <Shield size={32} className="text-primary" />
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">Manage all users, listings, bookings, and reviews</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-primary text-primary-foreground shadow-lg'
                                    : 'bg-secondary hover:bg-secondary/80'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="glass-panel p-6 rounded-2xl">
                    {activeTab === 'stats' && stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold">Total Users</h3>
                                    <Users className="text-primary" size={24} />
                                </div>
                                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {stats.activeUsers} users, {stats.activeProviders} providers
                                </p>
                            </div>
                            <div className="glass-card p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold">Total Listings</h3>
                                    <Home className="text-primary" size={24} />
                                </div>
                                <p className="text-3xl font-bold">{stats.totalListings}</p>
                            </div>
                            <div className="glass-card p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold">Total Bookings</h3>
                                    <Calendar className="text-primary" size={24} />
                                </div>
                                <p className="text-3xl font-bold">{stats.totalBookings}</p>
                            </div>
                            <div className="glass-card p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold">Total Reviews</h3>
                                    <Star className="text-primary" size={24} />
                                </div>
                                <p className="text-3xl font-bold">{stats.totalReviews}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-4">Name</th>
                                        <th className="text-left p-4">Email</th>
                                        <th className="text-left p-4">Role</th>
                                        <th className="text-left p-4">Created</th>
                                        <th className="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} className="border-b border-border/50">
                                            <td className="p-4">{u.name || 'N/A'}</td>
                                            <td className="p-4">{u.email}</td>
                                            <td className="p-4">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                    className="bg-background border border-border rounded px-2 py-1"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="provider">Provider</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleDelete('user', u._id)}
                                                    className="btn btn-sm btn-outline text-red-500 hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'listings' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-4">Title</th>
                                        <th className="text-left p-4">Owner</th>
                                        <th className="text-left p-4">Type</th>
                                        <th className="text-left p-4">Price</th>
                                        <th className="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listings.map(l => (
                                        <tr key={l._id} className="border-b border-border/50">
                                            <td className="p-4">
                                                <Link to={`/listings/${l._id}`} className="text-primary hover:underline">
                                                    {l.title}
                                                </Link>
                                            </td>
                                            <td className="p-4">{l.owner?.name || l.owner?.email || 'N/A'}</td>
                                            <td className="p-4">{l.type || 'N/A'}</td>
                                            <td className="p-4">₹{l.price || 'N/A'}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleDelete('listing', l._id)}
                                                    className="btn btn-sm btn-outline text-red-500 hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'bookings' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-4">Listing</th>
                                        <th className="text-left p-4">User</th>
                                        <th className="text-left p-4">Status</th>
                                        <th className="text-left p-4">Created</th>
                                        <th className="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b._id} className="border-b border-border/50">
                                            <td className="p-4">{b.listing?.title || 'N/A'}</td>
                                            <td className="p-4">{b.user?.name || b.user?.email || 'N/A'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-sm ${
                                                    b.status === 'approved' ? 'bg-green-500' :
                                                    b.status === 'rejected' ? 'bg-red-500' :
                                                    b.status === 'cancelled' ? 'bg-gray-500' :
                                                    'bg-yellow-500'
                                                } text-white`}>
                                                    {b.status || 'requested'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {new Date(b.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleDelete('booking', b._id)}
                                                    className="btn btn-sm btn-outline text-red-500 hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-4">Listing</th>
                                        <th className="text-left p-4">User</th>
                                        <th className="text-left p-4">Rating</th>
                                        <th className="text-left p-4">Comment</th>
                                        <th className="text-left p-4">Created</th>
                                        <th className="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map(r => (
                                        <tr key={r._id} className="border-b border-border/50">
                                            <td className="p-4">{r.listing?.title || 'N/A'}</td>
                                            <td className="p-4">{r.user?.name || r.user?.email || 'N/A'}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1">
                                                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                                    {r.rating}
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-xs truncate">{r.comment || 'N/A'}</td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleDelete('review', r._id)}
                                                    className="btn btn-sm btn-outline text-red-500 hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

