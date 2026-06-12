import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Set base URL for API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure Axios authorization header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      const fetchProfile = async () => {
        try {
          const res = await axios.get(`${API_URL}/auth/me`);
          setUser(res.data);
        } catch (err) {
          console.error('Session verification failed:', err);
          logout();
        } finally {
          setLoading(false);
        }
      };
      
      fetchProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Handle User Login
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Login failed';
    }
  };

  // Handle User Registration
  const register = async (username, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Registration failed';
    }
  };

  // Handle User Logout
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
