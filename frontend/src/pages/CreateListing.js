import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, MapPin } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { createListing, updateListing, getListingById } from '../api/listings';
import '../styles/Form.css';

const CreateListing = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        price: '',
        type: 'room',
        lat: '',
        lng: '',
        amenities: '',
        tags: '',
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingListing, setLoadingListing] = useState(isEdit);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'provider' && user.role !== 'admin') {
            navigate('/');
            return;
        }

        if (isEdit) {
            fetchListing();
        }
    }, [id, user, navigate, isEdit]);

    const fetchListing = async () => {
        try {
            const listing = await getListingById(id);
            setFormData({
                title: listing.title || '',
                description: listing.description || '',
                address: listing.address || '',
                price: listing.price || '',
                type: listing.type || 'room',
                lat: listing.lat || '',
                lng: listing.lng || '',
                amenities: listing.amenities ? listing.amenities.join(', ') : '',
                tags: listing.tags ? listing.tags.join(', ') : '',
            });
            if (listing.images && listing.images.length > 0) {
                setImagePreviews(listing.images);
            }
        } catch (err) {
            console.error('Failed to fetch listing:', err);
            setError('Failed to load listing');
        } finally {
            setLoadingListing(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 6) {
            setError('Maximum 6 images allowed');
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        lat: position.coords.latitude.toFixed(6),
                        lng: position.coords.longitude.toFixed(6),
                    });
                },
                (err) => {
                    console.error('Geolocation error:', err);
                    setError('Unable to get location. Please enter manually.');
                }
            );
        } else {
            setError('Geolocation is not supported by your browser.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.title || !formData.address) {
                setError('Title and address are required');
                setLoading(false);
                return;
            }

            // Prepare data
            const listingData = {
                ...formData,
                price: formData.price ? Number(formData.price) : undefined,
                lat: formData.lat ? Number(formData.lat) : undefined,
                lng: formData.lng ? Number(formData.lng) : undefined,
                amenities: formData.amenities
                    ? formData.amenities.split(',').map(a => a.trim()).filter(a => a)
                    : [],
                tags: formData.tags
                    ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
                    : [],
                images: images.length > 0 ? images : undefined,
            };

            if (isEdit) {
                await updateListing(id, listingData);
            } else {
                await createListing(listingData);
            }

            navigate('/dashboard/provider');
        } catch (err) {
            console.error('Failed to save listing:', err);
            setError(err.response?.data?.message || 'Failed to save listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingListing) {
        return <div className="min-h-screen bg-background p-8 text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-primary transition-colors group"
                >
                    <div className="p-2 rounded-full bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-medium">Back to Dashboard</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Header & Sidebar Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                {isEdit ? 'Edit Listing' : 'Create New Listing'}
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                {isEdit ? 'Update your property details.' : 'Share your space or food service with thousands of students and professionals.'}
                            </p>
                        </div>

                        <div className="glass-card p-6 rounded-2xl border border-white/10 hidden lg:block">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <span className="bg-emerald-500/20 text-emerald-500 p-1.5 rounded-lg"><Upload size={16} /></span>
                                Quick Tips
                            </h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    Provide a catchy title to attract more views.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    Upload high-quality images of the room or food.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    Pinpoint your exact location for better search results.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl">
                            {error && (
                                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl flex items-center gap-3">
                                    <div className="p-2 bg-red-500/20 rounded-full shrink-0"><X size={16} /></div>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Section 1: Basic Info */}
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold border-b border-border/50 pb-2">Basic Details</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 ml-1">Title <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 focus:bg-background focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-muted-foreground/50"
                                                placeholder="e.g. Spacious Studio near University"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5 ml-1">Type <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <select
                                                        name="type"
                                                        value={formData.type}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 focus:bg-background focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                                                    >
                                                        <option value="room">🏡 Room / Hostel</option>
                                                        <option value="food">🍽️ Food / Tiffin</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5 ml-1">Price (₹/month)</label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    min="0"
                                                    className="w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 focus:bg-background focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                                                    placeholder="5000"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 ml-1">Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={4}
                                                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 focus:bg-background focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 resize-none"
                                                placeholder="Describe the amenities, rules, and vibe..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Location */}
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold border-b border-border/50 pb-2">Location</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 ml-1">Address <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-3.5 text-muted-foreground" size={18} />
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/50 bg-secondary/30 focus:bg-background focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                                                    placeholder="Complete address including city & pincode"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="text-sm font-semibold text-primary">Map Coordinates</label>
                                                <button
                                                    type="button"
                                                    onClick={getCurrentLocation}
                                                    className="btn btn-xs btn-primary rounded-lg flex items-center gap-1.5"
                                                >
                                                    <MapPin size={14} /> Auto-Detect
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    name="lat"
                                                    value={formData.lat}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm"
                                                    placeholder="Latitude"
                                                />
                                                <input
                                                    type="text"
                                                    name="lng"
                                                    value={formData.lng}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm"
                                                    placeholder="Longitude"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2 opacity-80">
                                                * Essential for "Near Me" search. Click Auto-Detect while at the location.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Extra Info */}
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold border-b border-border/50 pb-2">Features & Media</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 ml-1">Amenities</label>
                                            <input
                                                type="text"
                                                name="amenities"
                                                value={formData.amenities}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 focus:bg-background focus:ring-2 focus:ring-primary/50"
                                                placeholder="WiFi, AC, Parking..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 ml-1">Tags</label>
                                            <input
                                                type="text"
                                                name="tags"
                                                value={formData.tags}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 focus:bg-background focus:ring-2 focus:ring-primary/50"
                                                placeholder="Students, Girls Only..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-3 ml-1">Photos (Max 6)</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {/* Upload Button */}
                                            <div className="col-span-2 md:col-span-1 relative group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    id="image-upload"
                                                    disabled={images.length >= 6}
                                                />
                                                <label
                                                    htmlFor="image-upload"
                                                    className={`w-full aspect-square flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${images.length >= 6
                                                            ? 'border-border bg-secondary/50 opacity-50 cursor-not-allowed'
                                                            : 'border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary'
                                                        }`}
                                                >
                                                    <div className="p-3 bg-primary/10 text-primary rounded-full group-hover:scale-110 transition-transform">
                                                        <Upload size={24} />
                                                    </div>
                                                    <span className="text-xs font-semibold text-primary">Add Photos</span>
                                                </label>
                                            </div>

                                            {/* Previews */}
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative aspect-square group">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover rounded-2xl shadow-sm border border-border/50"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="bg-red-500/90 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6 border-t border-border/50">
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="flex-1 btn btn-outline py-4 rounded-xl text-base font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] btn btn-primary py-4 rounded-xl text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                                    >
                                        {loading ? 'Publishing...' : isEdit ? 'Update Details' : 'Publish Listing'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateListing;

