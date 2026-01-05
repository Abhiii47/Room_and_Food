import React, { useState, useEffect, useContext } from 'react';
import { Star, Edit2, Trash2 } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { getReviewsByListing, createReview, updateReview, deleteReview } from '../api/reviews';

const Reviews = ({ listingId }) => {
    const { user } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [formData, setFormData] = useState({ rating: 5, comment: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReviews();
    }, [listingId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getReviewsByListing(listingId);
            setReviews(data);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingReview) {
                await updateReview(editingReview._id, formData);
            } else {
                await createReview({ listingId, ...formData });
            }
            setFormData({ rating: 5, comment: '' });
            setShowForm(false);
            setEditingReview(null);
            fetchReviews();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to save review');
        }
    };

    const handleEdit = (review) => {
        setEditingReview(review);
        setFormData({ rating: review.rating, comment: review.comment || '' });
        setShowForm(true);
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await deleteReview(reviewId);
            fetchReviews();
        } catch (err) {
            alert('Failed to delete review. Please try again.');
        }
    };

    const userReview = reviews.find(r => user && (r.user._id === user._id || r.user === user._id));
    const canReview = user && !userReview && !showForm;

    if (loading) {
        return <div className="text-center py-4">Loading reviews...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Reviews ({reviews.length})</h3>
                {canReview && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-sm btn-primary"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {/* Review Form */}
            {(showForm || editingReview) && (
                <div className="glass-panel p-6 rounded-xl border border-border/50">
                    <h4 className="font-semibold mb-4">{editingReview ? 'Edit Review' : 'Write a Review'}</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(rating => (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating })}
                                        className={`${formData.rating >= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                    >
                                        <Star size={24} className={formData.rating >= rating ? 'fill-current' : ''} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Comment</label>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                                placeholder="Share your experience..."
                            />
                        </div>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary">
                                {editingReview ? 'Update Review' : 'Submit Review'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingReview(null);
                                    setFormData({ rating: 5, comment: '' });
                                }}
                                className="btn btn-outline"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => {
                        const isOwner = user && (review.user._id === user._id || review.user === user._id);
                        return (
                            <div key={review._id} className="glass-panel p-4 rounded-xl border border-border/50">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-semibold">{review.user?.name || 'Anonymous'}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {[1, 2, 3, 4, 5].map(rating => (
                                                <Star
                                                    key={rating}
                                                    size={16}
                                                    className={review.rating >= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(review)}
                                                className="p-1 text-primary hover:bg-primary/10 rounded"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {review.comment && (
                                    <p className="text-muted-foreground mt-2">{review.comment}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Reviews;

