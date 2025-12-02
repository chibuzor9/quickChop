import axios, { AxiosError, AxiosInstance } from 'axios';
import { Platform } from 'react-native';

// Platform-aware secure storage
// SecureStore doesn't work on web, so we use localStorage as fallback
const storage = {
    async getItem(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        const SecureStore = await import('expo-secure-store');
        return SecureStore.getItemAsync(key);
    },
    async setItem(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        const SecureStore = await import('expo-secure-store');
        await SecureStore.setItemAsync(key, value);
    },
    async deleteItem(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        const SecureStore = await import('expo-secure-store');
        await SecureStore.deleteItemAsync(key);
    },
};

// API Configuration
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

console.log('🔗 API URL:', API_URL); // Debug log

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000, // Increased timeout to 30 seconds
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await storage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${ token }`;
            }
        } catch (error) {
            console.warn('Failed to retrieve auth token:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // Handle 401 Unauthorized - clear token and redirect to login
        if (error.response?.status === 401) {
            try {
                await storage.deleteItem('authToken');
                // TODO: Redirect to login screen
            } catch (err) {
                console.error('Failed to clear auth token:', err);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

// Auth Service
export const authService = {
    async signup(data: {
        fullName: string;
        email: string;
        password: string;
        role: 'customer' | 'rider' | 'restaurant';
    }) {
        console.log('📤 Signup request:', { ...data, password: '***' });
        try {
            const response = await apiClient.post('/auth/signup', data);
            console.log('✅ Signup success:', response.data);
            if (response.data.token) {
                await storage.setItem('authToken', response.data.token);
            }
            return response.data;
        } catch (error: any) {
            console.error('❌ Signup error:', error.response?.data || error.message);
            throw error;
        }
    },

    async login(email: string, password: string) {
        console.log('📤 Login request:', email);
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            console.log('✅ Login success:', response.data);
            if (response.data.token) {
                await storage.setItem('authToken', response.data.token);
            }
            return response.data;
        } catch (error: any) {
            console.error('❌ Login error:', error.response?.data || error.message);
            throw error;
        }
    },

    async logout() {
        await storage.deleteItem('authToken');
    },

    async getProfile() {
        console.log('📤 Fetching current user profile...');
        try {
            const response = await apiClient.get('/auth/me');
            console.log('✅ Profile fetched:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get profile error:', error.response?.data || error.message);
            throw error;
        }
    },

    async updateProfile(data: { fullName?: string; phoneNumber?: string; address?: string; profileImage?: string }) {
        console.log('📤 Updating profile...');
        try {
            const response = await apiClient.put('/auth/profile', data);
            console.log('✅ Profile updated:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Update profile error:', error.response?.data || error.message);
            throw error;
        }
    },

    async resetPassword(email: string) {
        return apiClient.post('/auth/reset-password', { email });
    },
};

// Customer Service
export const customerService = {
    async getRestaurants(filters?: { cuisine?: string; rating?: number }) {
        console.log('📤 Fetching restaurants...');
        const response = await apiClient.get('/restaurants', {
            params: { ...filters, _t: Date.now() } // Cache buster
        });
        console.log('✅ Restaurants fetched:', response.data);
        return response.data;
    }, async getRestaurantDetails(restaurantId: string) {
        return apiClient.get(`/restaurants/${ restaurantId }`);
    },

    async getMenu(restaurantId: string) {
        return apiClient.get(`/restaurants/${ restaurantId }/menu`);
    },

    async placeOrder(orderData: any) {
        console.log('📤 Placing order:', orderData);
        try {
            const response = await apiClient.post('/orders', orderData);
            console.log('✅ Order placed:', response.data);
            return response;
        } catch (error: any) {
            console.error('❌ Place order error:', error.response?.data || error.message);
            throw error;
        }
    },

    async getOrders() {
        return apiClient.get('/orders');
    },

    async getOrderDetails(orderId: string) {
        return apiClient.get(`/orders/${ orderId }`);
    },

    async trackOrder(orderId: string) {
        return apiClient.get(`/orders/${ orderId }/track`);
    },

    async getProfile() {
        return apiClient.get('/customer/profile');
    },

    async updateProfile(data: any) {
        return apiClient.put('/customer/profile', data);
    },
};

// Rider Service
export const riderService = {
    async getAvailableDeliveries() {
        return apiClient.get('/rider/deliveries/available');
    },

    async getActiveDeliveries() {
        return apiClient.get('/rider/deliveries/active');
    },

    async acceptDelivery(deliveryId: string) {
        return apiClient.post(`/rider/deliveries/${ deliveryId }/accept`);
    },

    async completeDelivery(deliveryId: string, data?: any) {
        return apiClient.post(`/rider/deliveries/${ deliveryId }/complete`, data);
    },

    async getEarnings() {
        return apiClient.get('/rider/earnings');
    },

    async getEarningsHistory(filters?: { startDate?: string; endDate?: string }) {
        return apiClient.get('/rider/earnings/history', { params: filters });
    },

    async getDeliveryHistory() {
        return apiClient.get('/rider/deliveries/history');
    },

    async getProfile() {
        return apiClient.get('/rider/profile');
    },

    async updateProfile(data: any) {
        return apiClient.put('/rider/profile', data);
    },
};

// Restaurant Service
export const restaurantService = {
    async getDashboard() {
        return apiClient.get('/restaurant/dashboard');
    },

    async getOrders(filters?: { status?: string }) {
        return apiClient.get('/restaurant/orders', { params: filters });
    },

    async updateOrderStatus(orderId: string, data: { status: string }) {
        return apiClient.put(`/restaurant/orders/${ orderId }/status`, data);
    },

    async getMenu() {
        return apiClient.get('/restaurant/menu');
    },

    async addMenuItem(itemData: any) {
        return apiClient.post('/restaurant/menu', itemData);
    },

    async updateMenuItem(itemId: string, data: any) {
        return apiClient.put(`/restaurant/menu/${ itemId }`, data);
    },

    async deleteMenuItem(itemId: string) {
        return apiClient.delete(`/restaurant/menu/${ itemId }`);
    },

    async getAnalytics(filters?: { startDate?: string; endDate?: string }) {
        return apiClient.get('/restaurant/analytics', { params: filters });
    },

    async getProfile() {
        return apiClient.get('/restaurant/profile');
    },

    async updateProfile(data: any) {
        return apiClient.put('/restaurant/profile', data);
    },

    async getSettings() {
        return apiClient.get('/restaurant/settings');
    },

    async updateSettings(data: any) {
        return apiClient.put('/restaurant/settings', data);
    },

    async logout() {
        await storage.deleteItem('authToken');
    },
};

export type { AxiosError };

