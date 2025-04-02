const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Relative path in production
  : 'http://localhost:5000/api';  // Full URL in development

export default API_BASE_URL; 