import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './AddItemForm.css';
import API_BASE_URL from '../config';

// AddItemForm Component: Handles the creation of new items within a collection
// Props:
// - collectionType: Determines which form fields to display (books, records, or generic)
// - onItemAdded: Callback function triggered when a new item is successfully created
const AddItemForm = ({ collectionType, onItemAdded }) => {
    // Get collection ID from URL parameters
    const { id: collectionId } = useParams();

    // State Management
    // Controls modal visibility and form data
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [customFields, setCustomFields] = useState([]);

    // Predefined fields for book collections
    // Each field object defines the input type and validation requirements
    const bookFields = [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'published', label: 'Published', type: 'text' },
        { name: 'edition', label: 'Edition', type: 'text' },
        { name: 'publisher', label: 'Publisher', type: 'text' },
        { name: 'obtainedFrom', label: 'Obtained From', type: 'text' },
        { name: 'uniqueFeatures', label: 'Unique Features', type: 'text' },
        { name: 'personalNote', label: 'Personal Note', type: 'textarea' },
        { name: 'translationMethod', label: 'Translation Method', type: 'text' },
        { name: 'translationOverview', label: 'Translation Overview', type: 'textarea' },
        { name: 'description', label: 'General Description', type: 'textarea' },
        { name: 'coverImage', label: 'Cover Image', type: 'file', accept: 'image/*' }
    ];

    // Predefined fields for record collections
    // Specialized fields for vinyl record cataloging
    const recordFields = [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'condition', label: 'Condition', type: 'text' },
        { name: 'value', label: 'Value', type: 'number' },
        { name: 'label', label: 'Label', type: 'text' },
        { name: 'matrixNumber', label: 'Matrix #', type: 'text' },
        { name: 'variation', label: 'Variation', type: 'text' },
        { name: 'country', label: 'Country', type: 'text' },
        { name: 'pressing', label: 'Pressing', type: 'text' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
        { name: 'description', label: 'General Description', type: 'textarea' },
        { name: 'coverImage', label: 'Cover Image', type: 'file', accept: 'image/*' }
    ];

    // Basic fields for generic collections
    // Minimal fields for general item cataloging
    const genericFields = [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' }
    ];

    // Allows users to add custom fields to their form
    // Prompts user for field name and adds it to customFields state
    const addCustomField = () => {
        const fieldName = prompt('Enter field name:');
        if (fieldName) {
            setCustomFields([...customFields, {
                name: fieldName.toLowerCase().replace(/\s+/g, '_'),
                label: fieldName,
                type: 'text'
            }]);
        }
    };

    // Returns appropriate fields based on collection type
    // Determines which set of fields to display in the form
    const getFieldsByType = () => {
        switch(collectionType) {
            case 'books':
                return bookFields;
            case 'records':
                return recordFields;
            case 'custom':
                return [...genericFields, ...customFields];
            default:
                return genericFields;
        }
    };

    // Handles form submission and API interaction
    // Processes form data and sends it to the server
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Log initial form data for debugging
            console.log('Full formData before processing:', formData);
            
            // Create FormData object for handling file uploads
            const formDataToSend = new FormData();
            const { title, description, coverImage, ...otherFields } = formData;
            
            // Process additional fields into a data object
            const dataObject = {};
            Object.keys(otherFields).forEach(key => {
                if (otherFields[key]) {
                    dataObject[key] = otherFields[key];
                }
            });

            // Log processed data for debugging
            console.log('Data object being sent:', dataObject);
            console.log('Complete submission data:', {
                title,
                description,
                type: collectionType,
                data: dataObject
            });

            // Append all form data to FormData object
            formDataToSend.append('title', title);
            formDataToSend.append('description', description || '');
            formDataToSend.append('type', collectionType);
            formDataToSend.append('data', JSON.stringify(dataObject));
            
            // Handle cover image if provided
            if (coverImage) {
                formDataToSend.append('coverImage', coverImage);
            }

            // Log final FormData contents for debugging
            console.log('FormData contents:');
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // Send POST request to create new item
            const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/items`, {
                method: 'POST',
                body: formDataToSend
            });

            if (!response.ok) {
                throw new Error('Failed to create item');
            }

            // Process successful response
            const newItem = await response.json();
            console.log('Server response:', newItem);
            
            // Update UI and reset form
            onItemAdded(newItem);
            setIsModalOpen(false);
            setFormData({});
        } catch (error) {
            console.error('Error creating item:', error);
        }
    };

    return (
        <div>
            {/* Main trigger button to open modal */}
            <button
                className="add-item-button"
                onClick={() => setIsModalOpen(true)}
            >
                Add {collectionType === 'books' ? 'Book' :
                     collectionType === 'records' ? 'Record' : 'Item'}
            </button>

            {/* Modal Form - Only rendered when isModalOpen is true */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Add New {collectionType === 'books' ? 'Book' :
                                    collectionType === 'records' ? 'Record' : 'Item'}</h2>
                        <form onSubmit={handleSubmit}>
                            {/* Dynamic form fields based on collection type */}
                            {getFieldsByType().map(field => (
                                <div key={field.name} className="form-group">
                                    <label>{field.label}:</label>
                                    {/* Render appropriate input type based on field configuration */}
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={formData[field.name] || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                [field.name]: e.target.value
                                            })}
                                            required={field.required}
                                        />
                                    ) : field.type === 'file' ? (
                                        <input
                                            type="file"
                                            accept={field.accept}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                [field.name]: e.target.files[0]
                                            })}
                                        />
                                    ) : (
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

                            {/* Custom field button for custom collection types */}
                            {collectionType === 'custom' && (
                                <button
                                    type="button"
                                    className="add-field-button"
                                    onClick={addCustomField}
                                >
                                    + Add Field
                                </button>
                            )}

                            {/* Form Action Buttons */}
                            <div className="button-group">
                                <button type="submit">Add Item</button>
                                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddItemForm;