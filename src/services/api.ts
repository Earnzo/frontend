import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management functions
const getToken = () => localStorage.getItem('access_token');
const setToken = (token: string) => localStorage.setItem('access_token', token);
const removeToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Add token to requests automatically
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/register/', { email, password });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login/', { email, password });
    if (response.data.access) {
      setToken(response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile/');
    return response.data;
  },

  logout: () => {
    removeToken();
  }
};

// Wallet API calls
export const walletAPI = {
  getWallet: async () => {
    const response = await apiClient.get('/wallet/');
    return response.data;
  },
  

  getTransactions: async () => {
    const response = await apiClient.get('/wallet/transactions/');
    return response.data;
  },

  // NEW: Top-up functions
  topupWallet: async (amount: number) => {
    const response = await apiClient.post('/wallet/topup/', { amount });
    return response.data;
  },

  createRazorpayOrder: async (amount: number) => {
    const response = await apiClient.post('/wallet/create-order/', { amount });
    return response.data;
  },
   createUPIOrder: async (amount: number) => {
    const response = await apiClient.post('/wallet/create-upi-order/', { amount });
    return response.data;
  },
  submitPayment: async (data: { amount: number; transaction_id: string; upi_ref_id?: string }) => {
    const response = await apiClient.post('/wallet/submit-payment/', data);
    return response.data;
  },
  
  getPaymentRequests: async () => {
    const response = await apiClient.get('/wallet/payment-requests/');
    return response.data;
  },
  
  approvePayment: async (paymentId: number) => {
    const response = await apiClient.post(`/wallet/approve-payment/${paymentId}/`);
    return response.data;
  },
  
  getPendingPayments: async () => {
    const response = await apiClient.get('/wallet/pending-payments/');
    return response.data;
  }


};

// Stakes API calls
export const stakesAPI = {
  createStake: async (amount: number, duration_days: number = 60) => {
    const response = await apiClient.post('/stakes/create/', { amount, duration_days });
    return response.data;
  },

  getStakes: async () => {
    const response = await apiClient.get('/stakes/');
    return response.data;
  },

  getStakeDetail: async (id: string) => {
    const response = await apiClient.get(`/stakes/${id}/`);
    return response.data;
  }
};

export { getToken, setToken, removeToken };
