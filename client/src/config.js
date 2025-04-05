// config.js: Application Configuration Management
// Core Features:
// - Environment-based API URL configuration
// - Development vs Production mode detection
// - Centralized API endpoint management

// Check if application is running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Set API base URL based on environment
// Development: Full localhost URL
// Production: Relative API path
const API_BASE_URL = isDevelopment ? 'http://localhost:5000/api' : '/api';

export default API_BASE_URL;