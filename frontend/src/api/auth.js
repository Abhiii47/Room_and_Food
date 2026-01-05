import apiClient from './apiClient';

export const registerUser = async (userData) => {
    try {
        // Map userType to role for backend compatibility
        const { userType, ...rest } = userData;
        const role = userType === 'vendor' ? 'provider' : 'user';
        const response = await apiClient.post('/auth/register', { ...rest, role });
        return response.data;
    } catch (err) {
        if (err.response && err.response.data.message) {
            throw err.response.data.message;
        }
        throw "Registration failed. Please try again.";
    }
};

export const loginUser = async (userData) => {
    try {
        const response = await apiClient.post('/auth/login', userData);
        if (response.data && response.data.token && response.data.user) {
            // Store token and user in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (err) {
        console.error('Login API error:', err);
        if (err.response) {
            // Server responded with error
            const errorMessage = err.response.data?.message || err.response.statusText || 'Login failed';
            throw new Error(errorMessage);
        } else if (err.request) {
            // Request made but no response
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        } else {
            // Error setting up request
            throw new Error(err.message || 'Login failed. Please try again.');
        }
    }
};

export const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};
