import React from 'react';
import './MainLayout.css';
import CollectionList from './CollectionList';

// MainLayout Component: Primary layout wrapper for the application
// Core Features:
// - Provides main structural container
// - Houses the CollectionList component
// - Manages overall page layout and styling

const MainLayout = () => {
    return (
        <div className="main-layout">
            <div className="content">
                <CollectionList />
            </div>
        </div>
    );
};

export default MainLayout;