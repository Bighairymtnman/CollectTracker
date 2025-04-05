import React, { useState } from 'react';
import CategoryModal from './CategoryModal';
import './ItemCard.css';
import EditItemModal from './EditItemModal';
import PhotoGalleryModal from './PhotoGalleryModal';
import API_BASE_URL from '../config';

// ItemCard Component: Displays and manages individual collection items
// Core Features:
// - Displays item details with image
// - Manages item categories
// - Handles item editing and deletion
// - Provides photo gallery functionality
// Props:
// - item: Item data object
// - type: Collection type (books, records, etc.)
// - categories: Available categories
// - onUpdateCategories: Category update handler
// - onDelete: Item deletion handler
// - onRefresh: Data refresh handler

const ItemCard = ({ item, type, categories, onUpdateCategories, onDelete, onRefresh }) => {
    // Debug logging
    console.log('Item details:', {
        id: item.id,
        collection_id: item.collection_id,
        title: item.title
    });

    // Modal and UI state management
    const [showDetails, setShowDetails] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showGalleryModal, setShowGalleryModal] = useState(false);
    
    // Field configurations for different item types
    const bookFields = [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'published', label: 'Published', type: 'text' },
        { name: 'edition', label: 'Edition', type: 'text' },
        { name: 'publisher', label: 'Publisher', type: 'text' },
        { name: 'obtainedFrom', label: 'Obtained From', type: 'text' },
        { name: 'uniqueFeatures', label: 'Unique Features', type: 'text' },
        { name: 'personalNote', label: 'Personal Note', type: 'textarea' },
        { name: 'translationMethod', label: 'Translation Method', type: 'text' },
        { name: 'translationOverview', label: 'Translation Overview', type: 'textarea' },
        { name: 'description', label: 'General Description', type: 'textarea' }
    ];

    const recordFields = [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'condition', label: 'Condition', type: 'text' },
        { name: 'value', label: 'Value', type: 'number' },
        { name: 'label', label: 'Label', type: 'text' },
        { name: 'matrixNumber', label: 'Matrix #', type: 'text' },
        { name: 'variation', label: 'Variation', type: 'text' },
        { name: 'country', label: 'Country', type: 'text' },
        { name: 'pressing', label: 'Pressing', type: 'text' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
        { name: 'description', label: 'General Description', type: 'textarea' }
    ];

    // Event handlers for item management
    const handleCategoryUpdate = async (newCategories) => {
        await onUpdateCategories(item.id, newCategories);
        setShowCategoryModal(false);
    };

    const handleEdit = () => {
        setShowEditModal(true);
        setShowMenu(false);
    };

    const handleSaveEdit = async (updatedItem) => {
        await onRefresh();
        setShowEditModal(false);
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
        setShowMenu(false);
    };

    // Handle item deletion with API interaction
    const handleDelete = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections/${item.collection_id}/items/${item.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                onDelete(item.id);
                setShowDeleteConfirm(false);
                onRefresh();
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    // Render detailed item information modal
    const renderDetailModal = () => {
        const fields = type === 'books' ? bookFields : type === 'records' ? recordFields : [];
        let itemData = {};
        
        // Parse and handle nested JSON data
        try {
            if (item.data) {
                if (typeof item.data === 'string') {
                    itemData = JSON.parse(item.data);
                    if (typeof itemData === 'string') {
                        itemData = JSON.parse(itemData);
                    }
                } else {
                    itemData = item.data;
                }
            }
        } catch (error) {
            console.log('Data parsing error:', error);
            itemData = {};
        }
        return (
            <div className="item-modal-overlay" onClick={() => setShowDetails(false)}>
                <div className="item-modal-content" onClick={e => e.stopPropagation()}>
                    {/* Modal header with title and close button */}
                    <div className="modal-header">
                        <h2>{item.title}</h2>
                        <button onClick={() => setShowDetails(false)}>×</button>
                    </div>
                    
                    {/* Modal body with dynamic field rendering */}
                    <div className="modal-body">
                        {fields.map(field => {
                            const value = field.name === 'description' ? item.description : itemData[field.name];
                            if (field.name !== 'title' && field.name !== 'coverImage') {
                                return (
                                    <div key={field.name} className="detail-row">
                                        <strong>{field.label}:</strong>
                                        <span>{value || ''}</span>
                                    </div>
                                );
                            }
                            return null;
                        })}
                        
                        {/* Category display section */}
                        {item.categories && item.categories.length > 0 && (
                            <div className="detail-row">
                                <strong>Categories:</strong>
                                <span>{item.categories.map(cat => cat.name).join(', ')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    return (
        <>
            <div className="item-card">
                {/* Item menu dropdown */}
                <div className="item-menu">
                    <button
                        className="menu-trigger"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                    >
                        ⋮
                    </button>
                    {showMenu && (
                        <div className="menu-dropdown">
                            <button onClick={handleEdit}>Edit</button>
                            <button onClick={handleDeleteClick}>Delete</button>
                            <button onClick={() => setShowMenu(false)}>Cancel</button>
                        </div>
                    )}
                </div>

                {/* Item image display */}
                <div className="item-image">
                    {item.image_id ? (
                        <img
                            key={Date.now()}
                            src={`${API_BASE_URL}/collections/items/${item.id}/image?t=${Date.now()}`}
                            alt={item.title}
                        />
                    ) : (
                        <div className="placeholder-image">
                            {type === 'books' ? '📚' : type === 'records' ? '💿' : '📦'}
                        </div>
                    )}
                </div>

                {/* Item information section */}
                <div className="item-info">
                    <h3>{item.title}</h3>
                    <div className="item-details">
                        <p>{item.description || ''}</p>
                        <div className="item-categories">
                            {item.categories?.map(category => (
                                <span key={category.id} className="category-tag">
                                    {category.name}
                                </span>
                            ))}
                        </div>
                        <div className="item-actions">
                            <button
                                className="details-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDetails(true);
                                }}
                            >
                                Details
                            </button>
                            <button
                                className="gallery-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowGalleryModal(true);
                                }}
                            >
                                Gallery
                            </button>
                            <button
                                className="category-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCategoryModal(true);
                                }}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conditional modal rendering */}
            {showDetails && renderDetailModal()}
            {showCategoryModal && (
                <CategoryModal
                    item={item}
                    categories={categories}
                    currentCategories={item.categories || []}
                    onClose={() => setShowCategoryModal(false)}
                    onSave={handleCategoryUpdate}
                />
            )}
            {showDeleteConfirm && (
                <div className="delete-confirm-modal">
                    <div className="delete-confirm-content">
                        <h3>Delete Item?</h3>
                        <p>Are you sure you want to delete "{item.title}"?</p>
                        <div className="button-group">
                            <button onClick={handleDelete}>Yes, Delete</button>
                            <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {showEditModal && (
                <EditItemModal
                    item={item}
                    type={type}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveEdit}
                />
            )}
            {showGalleryModal && (
                <PhotoGalleryModal
                    item={item}
                    onClose={() => setShowGalleryModal(false)}
                    onRefresh={onRefresh}
                />
            )}
        </>
    );
};

export default ItemCard;