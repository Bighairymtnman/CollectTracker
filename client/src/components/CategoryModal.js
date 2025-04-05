import React, { useState } from 'react';
import './CategoryModal.css';

// CategoryModal Component: Manages category assignments for collection items
// Props:
// - item: The collection item being categorized
// - categories: Array of available categories
// - onClose: Callback function to close the modal
// - onSave: Callback function to save category assignments
// - currentCategories: Array of categories currently assigned to the item
const CategoryModal = ({ item, categories, onClose, onSave, currentCategories = [] }) => {
    // State Management
    // Maintains a Set of selected category IDs
    // Initialized with currently assigned categories
    const [selectedCategories, setSelectedCategories] = useState(
        new Set(currentCategories.map(cat => cat.id))
    );

    // Toggles category selection
    // Adds or removes category ID from the selected set
    const toggleCategory = (categoryId) => {
        const newSelected = new Set(selectedCategories);
        if (newSelected.has(categoryId)) {
            newSelected.delete(categoryId);
        } else {
            newSelected.add(categoryId);
        }
        setSelectedCategories(newSelected);
    };
    
    // Handles saving category assignments
    // Converts Set to Array and passes to parent component
    const handleSave = () => {
        console.log('Selected categories before save:', Array.from(selectedCategories));
        onSave(Array.from(selectedCategories));
        onClose();
    };

    return (
        <div className="category-modal-overlay">
            <div className="category-modal">
                {/* Modal Header */}
                <h3>Assign Categories for "{item.title}"</h3>

                {/* Category Checkboxes */}
                <div className="categories-list">
                    {categories.map(category => (
                        <label key={category.id} className="category-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedCategories.has(category.id)}
                                onChange={() => toggleCategory(category.id)}
                            />
                            {category.name}
                        </label>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="button-group">
                    <button onClick={handleSave} className="save-button">Save</button>
                    <button onClick={onClose} className="cancel-button">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;