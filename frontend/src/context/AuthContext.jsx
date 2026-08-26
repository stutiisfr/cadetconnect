import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cadetconnect_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('cadetconnect_token') || null;
  });

  const [roleProfile, setRoleProfile] = useState(() => {
    const saved = localStorage.getItem('cadetconnect_role_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  const safeFetchJson = async (url, options = {}) => {
    const fullUrl = getApiUrl(url);
    const res = await fetch(fullUrl, options);
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned an unexpected non-JSON response. Please ensure backend server is online.');
    }
    return await res.json();
  };

  useEffect(() => {
    if (token) {
      // Validate current token with backend /api/auth/me
      safeFetchJson('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(data => {
          if (data.success) {
            setUser(data.user);
            setRoleProfile(data.roleProfile);
            localStorage.setItem('cadetconnect_user', JSON.stringify(data.user));
            if (data.roleProfile) {
              localStorage.setItem('cadetconnect_role_profile', JSON.stringify(data.roleProfile));
            }
          } else {
            // Token is no longer valid
            logout();
          }
        })
        .catch((err) => {
          console.warn('Token validation failed:', err.message);
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await safeFetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!data.success) throw new Error(data.error || 'Login failed');

      setToken(data.token);
      setUser(data.user);
      setRoleProfile(data.roleProfile);
      localStorage.setItem('cadetconnect_token', data.token);
      localStorage.setItem('cadetconnect_user', JSON.stringify(data.user));
      if (data.roleProfile) {
        localStorage.setItem('cadetconnect_role_profile', JSON.stringify(data.roleProfile));
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const registerCadet = async (payload) => {
    setLoading(true);
    try {
      const data = await safeFetchJson('/api/auth/register/cadet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!data.success) throw new Error(data.error || 'Registration failed');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('cadetconnect_token', data.token);
      localStorage.setItem('cadetconnect_user', JSON.stringify(data.user));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const registerAspirant = async (payload) => {
    setLoading(true);
    try {
      const data = await safeFetchJson('/api/auth/register/aspirant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!data.success) throw new Error(data.error || 'Registration failed');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('cadetconnect_token', data.token);
      localStorage.setItem('cadetconnect_user', JSON.stringify(data.user));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleData) => {
    setLoading(true);
    try {
      const data = await safeFetchJson('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleData)
      });
      if (!data.success) throw new Error(data.error || 'Google login failed');

      setToken(data.token);
      setUser(data.user);
      setRoleProfile(data.roleProfile);
      localStorage.setItem('cadetconnect_token', data.token);
      localStorage.setItem('cadetconnect_user', JSON.stringify(data.user));
      if (data.roleProfile) {
        localStorage.setItem('cadetconnect_role_profile', JSON.stringify(data.roleProfile));
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const sendMobileOtp = async (phone) => {
    setLoading(true);
    try {
      const data = await safeFetchJson('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (!data.success) throw new Error(data.error || 'Failed to send OTP');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const verifyMobileOtp = async (payload) => {
    setLoading(true);
    try {
      const data = await safeFetchJson('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!data.success) throw new Error(data.error || 'Invalid OTP code');

      setToken(data.token);
      setUser(data.user);
      setRoleProfile(data.roleProfile);
      localStorage.setItem('cadetconnect_token', data.token);
      localStorage.setItem('cadetconnect_user', JSON.stringify(data.user));
      if (data.roleProfile) {
        localStorage.setItem('cadetconnect_role_profile', JSON.stringify(data.roleProfile));
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const connectGoogle = async (googleData) => {
    if (!token) throw new Error('Authentication required');
    const data = await safeFetchJson('/api/auth/connect/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(googleData)
    });
    if (!data.success) throw new Error(data.error || 'Failed to connect Google account');
    setUser(data.user);
    localStorage.setItem('cadetconnect_user', JSON.stringify(data.user));
    return data;
  };

  const connectPhone = async (phone, otp) => {
    if (!token) throw new Error('Authentication required');
    const data = await safeFetchJson('/api/auth/connect/phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ phone, otp })
    });
    if (!data.success) throw new Error(data.error || 'Failed to link phone number');
    setUser(data.user);
    localStorage.setItem('cadetconnect_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRoleProfile(null);
    localStorage.removeItem('cadetconnect_token');
    localStorage.removeItem('cadetconnect_user');
    localStorage.removeItem('cadetconnect_role_profile');
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('cadetconnect_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      roleProfile, 
      loading, 
      login, 
      loginWithGoogle,
      sendMobileOtp,
      verifyMobileOtp,
      connectGoogle,
      connectPhone,
      registerCadet, 
      registerAspirant, 
      updateUserProfile,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
