import React, { useState } from 'react';
import './CategoryItem.css';

// CategoryItem Component: Manages individual category display, editing, and deletion
// Props:
// - category: Object containing category data (id, name)
// - onEdit: Callback function for category name updates
// - onDelete: Callback function for category deletion
// - isSelected: Boolean indicating if category is currently selected
// - onSelect: Callback function when category is selected
const CategoryItem = ({ category, onEdit, onDelete, isSelected, onSelect }) => {
    // State Management
    // Controls visibility of context menu
    const [showMenu, setShowMenu] = useState(false);
    // Controls visibility of delete confirmation dialog
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    // Controls whether category is in edit mode
    const [isEditing, setIsEditing] = useState(false);
    // Stores the edited category name during updates
    const [editedName, setEditedName] = useState(category.name);

    // Initiates category name editing
    // Activates edit mode and hides context menu
    const handleEdit = () => {
        setIsEditing(true);
        setShowMenu(false);
    };

    // Saves edited category name
    // Triggers parent component update and exits edit mode
    const handleSave = () => {
        onEdit(category.id, editedName);
        setIsEditing(false);
    };

    // Initiates category deletion process
    // Shows confirmation dialog and hides context menu
    const handleDelete = () => {
        setShowDeleteConfirm(true);
        setShowMenu(false);
    };

    // Confirms and executes category deletion
    // Triggers parent component deletion and closes confirmation dialog
    const confirmDelete = () => {
        onDelete(category.id);
        setShowDeleteConfirm(false);
    };

    return (
        <div className={`category-item ${isSelected ? 'active' : ''}`}>
            {/* Edit Mode View */}
            {isEditing ? (
                <div className="category-edit">
                    <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        autoFocus
                    />
                    <div className="edit-buttons">
                        <button onClick={handleSave}>Save</button>
                        <button onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                /* Normal View */
                <div className="category-content">
                    {/* Category Name with Click Handler */}
                    <span
                        className="category-name"
                        onClick={onSelect}
                    >
                        {category.name}
                    </span>
                    {/* Context Menu Trigger Button */}
                    <button
                        className="menu-trigger"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                    >
                        ⋮
                    </button>
                    {/* Context Menu */}
                    {showMenu && (
                        <div className="category-menu">
                            <button onClick={handleEdit}>Edit</button>
                            <button onClick={handleDelete}>Delete</button>
                            <button onClick={() => setShowMenu(false)}>Cancel</button>
                        </div>
                    )}
                </div>
            )}
            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
                <div className="delete-confirm">
                    <p>Delete "{category.name}"?</p>
                    <div className="confirm-buttons">
                        <button onClick={confirmDelete}>Yes</button>
                        <button onClick={() => setShowDeleteConfirm(false)}>No</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryItem;