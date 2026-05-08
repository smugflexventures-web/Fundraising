import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_URL = '/api';

// Create a centralized axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // Request interceptor: attach Authorization header automatically
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          config.headers.Authorization = `Bearer ${savedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: auto-logout on 401
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  // On mount: check saved token validity and fetch user
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(savedToken);
          fetchUser(savedToken);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, [logout]);

  const fetchUser = async (authToken) => {
    try {
      const response = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(response.data.data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    const { token: newToken, user: newUser } = response.data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return response.data;
  };

  const login = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    const { token: newToken, user: newUser } = response.data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return response.data;
  };

  const forgotPassword = async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  };

  const resetPassword = async (token, password, confirm_password) => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password,
      confirm_password,
    });
    return response.data;
  };

  const updateProfile = async (data) => {
    const response = await apiClient.put('/auth/profile', data);
    setUser(response.data.data.user);
    return response.data;
  };

  const changePassword = async (data) => {
    const response = await apiClient.put('/auth/change-password', data);
    return response.data;
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isDonor = user?.role === 'donor';

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isStudent,
    isDonor,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
