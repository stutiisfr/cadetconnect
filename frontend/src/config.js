// Dynamic API Base Configuration for Local Dev & Production Deployments
export const getApiUrl = (endpoint) => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Custom environment variable override if provided
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}${path}`;
  }

  // Automatic fallback for Vercel / Netlify production deployments
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return `https://cadetconnect-api.onrender.com${path}`;
  }

  // Default relative path for local dev proxy
  return path;
};
