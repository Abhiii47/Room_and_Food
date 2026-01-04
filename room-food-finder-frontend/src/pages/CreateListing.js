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
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="glass-panel p-6 md:p-8 rounded-2xl">
                    <h1 className="text-3xl font-bold mb-6">
                        {isEdit ? 'Edit Listing' : 'Create New Listing'}
                    </h1>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                                placeholder="e.g., Cozy Room near Campus"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                                placeholder="Describe your listing..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                                >
                                    <option value="room">Room</option>
                                    <option value="food">Food</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Price (₹/month)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                                    placeholder="5000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                                placeholder="Full address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Location Coordinates</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    name="lat"
                                    value={formData.lat}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                                    placeholder="Latitude"
                                />
                                <input
                                    type="text"
                                    name="lng"
                                    value={formData.lng}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                                    placeholder="Longitude"
                                />
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    className="btn btn-outline flex items-center gap-2"
                                >
                                    <MapPin size={18} />
                                    Use Current
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Coordinates help users find your listing on the map. Click "Use Current" to auto-fill.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Amenities (comma-separated)</label>
                            <input
                                type="text"
                                name="amenities"
                                value={formData.amenities}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                                placeholder="WiFi, AC, Geyser, Security"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                                placeholder="furnished, student-friendly, near-campus"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Images (up to 6)
                            </label>
                            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                >
                                    <Upload size={32} className="text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Click to upload images
                                    </span>
                                </label>
                            </div>
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-xl"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 btn btn-primary py-3 rounded-xl font-bold"
                            >
                                {loading ? 'Saving...' : isEdit ? 'Update Listing' : 'Create Listing'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="btn btn-outline py-3 rounded-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateListing;

