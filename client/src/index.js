// index.js: Application Entry Point
// Core Features:
// - React application initialization
// - DOM rendering setup
// - Performance monitoring configuration

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Create root element for React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application within StrictMode for additional development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize performance monitoring
// Options:
// - Console logging: reportWebVitals(console.log)
// - Analytics endpoint: custom implementation
// Learn more: https://bit.ly/CRA-vitals
reportWebVitals();