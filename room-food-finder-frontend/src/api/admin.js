import apiClient from './apiClient';

export const getAdminStats = async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
};

export const getAdminUsers = async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
};

export const getAdminListings = async () => {
    const response = await apiClient.get('/admin/listings');
    return response.data;
};

export const getAdminBookings = async () => {
    const response = await apiClient.get('/admin/bookings');
    return response.data;
};

export const getAdminReviews = async () => {
    const response = await apiClient.get('/admin/reviews');
    return response.data;
};

export const deleteAdminUser = async (userId) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
};

export const deleteAdminListing = async (listingId) => {
    const response = await apiClient.delete(`/admin/listings/${listingId}`);
    return response.data;
};

export const deleteAdminBooking = async (bookingId) => {
    const response = await apiClient.delete(`/admin/bookings/${bookingId}`);
    return response.data;
};

export const deleteAdminReview = async (reviewId) => {
    const response = await apiClient.delete(`/admin/reviews/${reviewId}`);
    return response.data;
};

export const updateUserRole = async (userId, role) => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
};

