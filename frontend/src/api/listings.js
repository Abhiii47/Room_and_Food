import apiClient from './apiClient';

export const getAllListings = async () => {
    const response = await apiClient.get('/listings');
    return response.data;
};

export const getListingById = async (id) => {
    const response = await apiClient.get(`/listings/${id}`);
    return response.data;
};

export const getProviderListings = async () => {
    const response = await apiClient.get('/listings/provider');
    return response.data;
};

export const createListing = async (listingData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(listingData).forEach(key => {
        if (key !== 'images' && listingData[key] !== undefined && listingData[key] !== null) {
            if (Array.isArray(listingData[key])) {
                formData.append(key, listingData[key].join(','));
            } else {
                formData.append(key, listingData[key]);
            }
        }
    });
    
    // Add images
    if (listingData.images && listingData.images.length > 0) {
        listingData.images.forEach((image) => {
            formData.append('images', image);
        });
    }
    
    const response = await apiClient.post('/listings', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateListing = async (id, listingData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(listingData).forEach(key => {
        if (key !== 'images' && listingData[key] !== undefined && listingData[key] !== null) {
            if (Array.isArray(listingData[key])) {
                formData.append(key, listingData[key].join(','));
            } else {
                formData.append(key, listingData[key]);
            }
        }
    });
    
    // Add new images if any
    if (listingData.images && listingData.images.length > 0) {
        listingData.images.forEach((image) => {
            formData.append('images', image);
        });
    }
    
    const response = await apiClient.put(`/listings/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteListing = async (id) => {
    const response = await apiClient.delete(`/listings/${id}`);
    return response.data;
};

