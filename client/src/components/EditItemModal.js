import React, { useState, useEffect } from 'react';
import './EditItemModal.css';
import API_BASE_URL from '../config';

// EditItemModal Component: Manages editing of collection items with type-specific forms
// Core Features:
// - Dynamic form generation based on item type (books, records, generic)
// - Handles file uploads for cover images
// - Manages complex nested JSON data structures
// - Provides type-specific field validation
// Props:
// - item: Current item being edited
// - type: Type of collection item (books, records, generic)
// - onClose: Callback to close the modal
// - onSave: Callback after successful save

const EditItemModal = ({ item, type, onClose, onSave }) => {
    // Manages the form's current state including all field values
    const [formData, setFormData] = useState({});

    // Field configurations for each collection type
    // Each field object defines: name, label, type, and whether it's required
    const bookFields = [
        // Core book details
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'published', label: 'Published', type: 'text' },
        { name: 'edition', label: 'Edition', type: 'text' },
        { name: 'publisher', label: 'Publisher', type: 'text' },
        // Additional book metadata
        { name: 'obtainedFrom', label: 'Obtained From', type: 'text' },
        { name: 'uniqueFeatures', label: 'Unique Features', type: 'text' },
        { name: 'personalNote', label: 'Personal Note', type: 'textarea' },
        // Translation specific fields
        { name: 'translationMethod', label: 'Translation Method', type: 'text' },
        { name: 'translationOverview', label: 'Translation Overview', type: 'textarea' },
        // General fields
        { name: 'description', label: 'General Description', type: 'textarea' },
        { name: 'coverImage', label: 'Cover Image', type: 'file', accept: 'image/*' }
    ];

    // Record-specific fields including condition and value tracking
    const recordFields = [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'condition', label: 'Condition', type: 'text' },
        { name: 'value', label: 'Value', type: 'number' },
        // Record-specific metadata
        { name: 'label', label: 'Label', type: 'text' },
        { name: 'matrixNumber', label: 'Matrix #', type: 'text' },
        { name: 'variation', label: 'Variation', type: 'text' },
        { name: 'country', label: 'Country', type: 'text' },
        { name: 'pressing', label: 'Pressing', type: 'text' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
        { name: 'description', label: 'General Description', type: 'textarea' },
        { name: 'coverImage', label: 'Cover Image', type: 'file', accept: 'image/*' }
    ];

    // Basic fields for generic collection items
    const genericFields = [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' }
    ];

    // Initialize form with existing item data
    useEffect(() => {
        let itemData = {};
        // Handle potential nested JSON data
        try {
            if (item.data) {
                itemData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
                // Handle double-stringified data
                if (typeof itemData === 'string') {
                    itemData = JSON.parse(itemData);
                }
            }
        } catch (e) {
            console.log('Data parsing failed:', e);
            itemData = {};
        }
        
        // Combine base item data with parsed custom fields
        setFormData({
            title: item.title || '',
            description: item.description || '',
            ...itemData
        });
    }, [item]);
    
    // Return appropriate fields based on collection type
    const getFieldsByType = () => {
        switch(type) {
            case 'books': return bookFields;
            case 'records': return recordFields;
            default: return genericFields;
        }
    };

    // Handle form submission and API update
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { title, description, coverImage, ...otherFields } = formData;
            
            // Prepare FormData for multipart submission
            const formDataToSend = new FormData();
            formDataToSend.append('title', title);
            formDataToSend.append('description', description || '');
            
            // Clean and append additional fields as JSON
            const cleanedFields = Object.fromEntries(
                Object.entries(otherFields).filter(([_, value]) => value !== null && value !== undefined)
            );
            formDataToSend.append('data', JSON.stringify(cleanedFields));

            // Handle cover image if provided
            if (coverImage) {
                formDataToSend.append('coverImage', coverImage);
            }

            // Submit update to API
            const response = await fetch(`${API_BASE_URL}/collections/${item.collection_id}/items/${item.id}`, {
                method: 'PUT',
                body: formDataToSend
            });

            if (!response.ok) throw new Error('Failed to update item');

            const updatedItem = await response.json();
            updatedItem.image_timestamp = Date.now(); // Force image refresh
            onSave(updatedItem);
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };
    
    // Render form with dynamic fields based on type
    return (
        <div className="modal-overlay">
            <div className="modal">
                {/* Dynamic title based on item type */}
                <h2>Edit {type === 'books' ? 'Book' : type === 'records' ? 'Record' : 'Item'}</h2>
                <form onSubmit={handleSubmit}>
                    {/* Map through fields based on collection type */}
                    {getFieldsByType().map(field => (
                        <div key={field.name} className="form-group">
                            <label>{field.label}:</label>
                            {/* Render appropriate input based on field type */}
                            {field.type === 'textarea' ? (
                                // Textarea for long-form content
                                <textarea
                                    value={formData[field.name] || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        [field.name]: e.target.value
                                    })}
                                    required={field.required}
                                />
                            ) : field.type === 'file' ? (
                                // File input for images
                                <input
                                    type="file"
                                    accept={field.accept}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        [field.name]: e.target.files[0]
                                    })}
                                />
                            ) : (
                                // Standard input for text, numbers, etc.
                                <input
                                    type={field.type}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        [field.name]: e.target.value
                                    })}
                                    required={field.required}
                                />
                            )}
                        </div>
                    ))}
                    {/* Form action buttons */}
                    <div className="button-group">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditItemModal;