import apiClient from './apiClient';

export const getReviewsByListing = async (listingId) => {
    const response = await apiClient.get(`/reviews/listing/${listingId}`);
    return response.data;
};

export const createReview = async (reviewData) => {
    const response = await apiClient.post('/reviews', reviewData);
    return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
    const response = await apiClient.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
};

export const deleteReview = async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
};

