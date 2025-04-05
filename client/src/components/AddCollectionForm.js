import React, { useState } from 'react';
import './AddCollectionForm.css';
import API_BASE_URL from '../config';

// AddCollectionForm Component: Handles the creation of new collections through a modal interface
// Props:
// - onCollectionAdded: Callback function triggered when a new collection is successfully created
const AddCollectionForm = ({ onCollectionAdded }) => {
    // State Management
    // Controls the visibility of the modal form
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Manages form input values (collection name, type, and custom type if selected)
    const [formData, setFormData] = useState({
        name: '',
        type: 'generic',
        customType: ''
    });

    // Available collection types for the dropdown selection
    // 'custom' type allows users to define their own collection type
    const collectionTypes = [
        { value: 'generic', label: 'Generic' },
        { value: 'books', label: 'Books' },
        { value: 'records', label: 'Records' },
        { value: 'custom', label: 'Custom' }
    ];

    // Handles form submission and API interaction
    // Creates a new collection with the provided details
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Prepare data for API submission
            // If type is 'custom', use the customType value instead
            const submitData = {
                name: formData.name,
                type: formData.type === 'custom' ? formData.customType : formData.type
            };
            
            // Send POST request to create new collection
            const response = await fetch(`${API_BASE_URL}/collections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
            });

            const data = await response.json();
            
            // Notify parent component of new collection
            onCollectionAdded(data);
            
            // Reset form and close modal
            setIsModalOpen(false);
            setFormData({ name: '', type: 'generic', customType: '' });
        } catch (error) {
            console.error('Error adding collection:', error);
        }
    };

    return (
        <div className="add-collection-container">
            {/* Main trigger button to open the modal */}
            <button
                className="add-button"
                onClick={() => setIsModalOpen(true)}
            >
                + Add Collection
            </button>

            {/* Modal Form - Only rendered when isModalOpen is true */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Add New Collection</h2>
                        <form onSubmit={handleSubmit}>
                            {/* Collection Name Input */}
                            <div className="form-group">
                                <label>Collection Name:</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>

                            {/* Collection Type Dropdown */}
                            <div className="form-group">
                                <label>Collection Type:</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    {collectionTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Type Input - Only shown when 'custom' type is selected */}
                            {formData.type === 'custom' && (
                                <div className="form-group">
                                    <label>Custom Type Name:</label>
                                    <input
                                        type="text"
                                        value={formData.customType}
                                        onChange={(e) => setFormData({...formData, customType: e.target.value})}
                                        required
                                    />
                                </div>
                            )}

                            {/* Form Action Buttons */}
                            <div className="button-group">
                                <button type="submit">Create Collection</button>
                                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddCollectionForm;