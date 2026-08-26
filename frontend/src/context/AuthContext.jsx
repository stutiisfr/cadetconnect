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

  const loginWithGoogle = async (googleData) => {
    setLoading(true);
    try {
      const data = await safeFetchJson('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleData)
      });
      if (!data.success) throw new Error(data.error || 'Google authentication failed');

      setToken(data.token);
      setUser(data.user);
      setRoleProfile(data.roleProfile);
      localStorage.setItem('cadetconnect_token', data.token);
      localStorage.setItem('cadetconnect_user', JSON.stringify(data.user));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const loginWithLinkedIn = async (linkedinData) => {
    setLoading(true);
    try {
      const data = await safeFetchJson('/api/auth/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkedinData)
      });
      if (!data.success) throw new Error(data.error || 'LinkedIn authentication failed');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('cadetconnect_token', data.token);
      localStorage.setItem('cadetconnect_user', JSON.stringify(data.user));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const loginWithFacebook = async (facebookData) => {
    setLoading(true);
    try {
      const data = await safeFetchJson('/api/auth/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facebookData)
      });
      if (!data.success) throw new Error(data.error || 'Facebook authentication failed');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('cadetconnect_token', data.token);
      localStorage.setItem('cadetconnect_user', JSON.stringify(data.user));
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
      if (!data.success) throw new Error(data.error || 'Invalid verification code');

      setToken(data.token);
      setUser(data.user);
      setRoleProfile(data.roleProfile);
      localStorage.setItem('cadetconnect_token', data.token);
      localStorage.setItem('cadetconnect_user', JSON.stringify(data.user));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const data = await safeFetchJson('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!data.success) throw new Error(data.error || 'Forgot password request failed');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    try {
      const data = await safeFetchJson('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      if (!data.success) throw new Error(data.error || 'Password reset failed');
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
      loginWithLinkedIn,
      loginWithFacebook,
      sendMobileOtp,
      verifyMobileOtp,
      forgotPassword,
      resetPassword,
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
