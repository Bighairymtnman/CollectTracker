// App.js: Root component for the CollectTracker application
// Core Features:
// - Implements React Router for navigation
// - Provides main application structure
// - Manages primary route definitions

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainLayout from './components/MainLayout';
import CollectionPage from './components/CollectionPage';

// App Component: Primary application wrapper
// Routes:
// - "/" : Main collection list view (MainLayout)
// - "/collection/:id" : Individual collection view (CollectionPage)
function App() {
  return (
    <Router>
      <div className="App">
        {/* Application Header */}
        <header className="App-header">
          <h1>CollectTracker</h1>
        </header>
        
        {/* Route Definitions */}
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/collection/:id" element={<CollectionPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;