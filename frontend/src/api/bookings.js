import apiClient from './apiClient';

export const getMyBookings = async () => {
    const response = await apiClient.get('/bookings/user');
    return response.data;
};

export const getBookingRequests = async () => {
    const response = await apiClient.get('/bookings/requests');
    return response.data;
};

export const createBooking = async (bookingData) => {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
};

export const respondToBooking = async (id, approve) => {
    const response = await apiClient.post(`/bookings/${id}/respond`, { approve });
    return response.data;
};

export const cancelBooking = async (id) => {
    const response = await apiClient.post(`/bookings/${id}/cancel`);
    return response.data;
};
