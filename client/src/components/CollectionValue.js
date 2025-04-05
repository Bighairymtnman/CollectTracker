import React from 'react';
import './CollectionValue.css';

// CollectionValue Component: Calculates and displays total monetary value of a collection
// Core Features:
// - Aggregates value data from collection items
// - Handles JSON parsing of item data
// - Formats currency display with proper decimals
// Props:
// - items: Array of collection items containing value data

const CollectionValue = ({ items }) => {
    // Calculate total value by reducing all item values
    const totalValue = items.reduce((sum, item) => {
        let itemData = {};
        
        // Parse item data if it exists
        if (item.data) {
            try {
                itemData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
            } catch (e) {
                console.log('Error parsing item data:', e);
                itemData = {};
            }
        }

        // Extract and sum value, defaulting to 0 if not found
        const value = parseFloat(itemData.value) || 0;
        return sum + value;
    }, 0);

    return (
        <div className="collection-value">
            <h2>Collection Value</h2>
            <div className="value-amount">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
        </div>
    );
};

export default CollectionValue;