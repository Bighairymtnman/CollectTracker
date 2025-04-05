import React from 'react';
import './SearchSortControls.css';

// SearchSortControls Component: Manages search and sorting functionality
// Core Features:
// - Provides search input with customizable placeholder
// - Handles dynamic sort options
// - Real-time search and sort updates
// Props:
// - searchTerm: Current search value
// - onSearchChange: Search input handler
// - sortOption: Current sort selection
// - onSortChange: Sort selection handler
// - sortOptions: Array of available sort options
// - searchPlaceholder: Custom placeholder text

const SearchSortControls = ({
    searchTerm,
    onSearchChange,
    sortOption,
    onSortChange,
    sortOptions,
    searchPlaceholder
}) => {
    return (
        <div className="search-and-sort">
            {/* Search input section */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Sort selection dropdown */}
            <div className="sort-container">
                <select
                    value={sortOption}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="sort-select"
                >
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default SearchSortControls;