import React from 'react';
import CategoryItem from './CategoryItem';
import './Sidebar.css';

// Sidebar Component: Manages collection categories and descriptions
// Core Features:
// - Category list management (add, edit, delete)
// - Category selection handling
// - Collection description editing
// Props:
// - categories: Array of available categories
// - selectedCategory: Currently selected category ID
// - setSelectedCategory: Category selection handler
// - onAddCategory: New category creation handler
// - onEditCategory: Category edit handler
// - onDeleteCategory: Category deletion handler
// - showAddCategory: Controls add category form visibility
// - setShowAddCategory: Toggle add category form
// - newCategoryName: New category input value
// - setNewCategoryName: New category name update handler
// - description: Collection description text
// - onDescriptionChange: Description update handler
// - collectionName: Name of current collection

const Sidebar = ({
    categories,
    selectedCategory,
    setSelectedCategory,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
    showAddCategory,
    setShowAddCategory,
    newCategoryName,
    setNewCategoryName,
    description,
    onDescriptionChange,
    collectionName
}) => {
    // Handle description text updates
    const handleDescriptionChange = (e) => {
        const newValue = e.target.value;
        onDescriptionChange(newValue);
    };
    
    return (
        <div className="sidebar-container">
            {/* Categories Section */}
            <div className="sidebar-section">
                <div className="categories-header">
                    <h3>Categories</h3>
                    <button
                        className="add-category-button"
                        onClick={() => setShowAddCategory(true)}
                    >
                        +
                    </button>
                </div>

                {/* Category List */}
                <div className="categories-list">
                    <div
                        className={`category-item ${!selectedCategory ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All Items
                    </div>
                    {categories.map(category => (
                        <CategoryItem
                            key={category.id}
                            category={category}
                            onEdit={onEditCategory}
                            onDelete={onDeleteCategory}
                            isSelected={selectedCategory === category.id}
                            onSelect={() => setSelectedCategory(category.id)}
                        />
                    ))}
                </div>

                {/* Add Category Form */}
                {showAddCategory && (
                    <form onSubmit={onAddCategory} className="add-category-form">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category name"
                            autoFocus
                        />
                        <div className="button-group">
                            <button type="submit">Add</button>
                            <button
                                type="button"
                                onClick={() => setShowAddCategory(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Description Section */}
            <div className="sidebar-section description-section">
                <h3>Description</h3>
                <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Add a description for your collection..."
                    className="description-textarea"
                    rows="4"
                />
            </div>
        </div>
    );
};

export default Sidebar;