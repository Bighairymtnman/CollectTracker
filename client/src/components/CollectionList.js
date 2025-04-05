import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CollectionList.css';
import API_BASE_URL from '../config';

// CollectionList Component: Manages display and operations for all user collections

// Core Features:
// - Displays grid of collection cards with details
// - Handles collection creation, editing, and deletion
// - Provides search and sort functionality
// - Manages modal interfaces for actions
// State Management:
// - collections: Array of all user collections
// - filteredCollections: Array of filtered/sorted collections
// - searchTerm: Current search filter
// - sortOption: Current sort preference
// - showDeleteModal: Controls delete confirmation visibility
// - showAddModal: Controls add collection form visibility
// - editingCollection: Currently edited collection data

const CollectionList = () => {
    const navigate = useNavigate();

    // State Management
    // Core collection states
    const [collections, setCollections] = useState([]);
    const [filteredCollections, setFilteredCollections] = useState([]);
    
    // UI control states
    const [editingCollection, setEditingCollection] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [collectionToDelete, setCollectionToDelete] = useState(null);
    
    // Search and sort states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('name-asc');

    // Form data state for new collections
    const [formData, setFormData] = useState({
        name: '',
        type: 'generic',
        customType: ''
    });

    // Available collection types configuration
    const collectionTypes = [
        { value: 'generic', label: 'Generic' },
        { value: 'books', label: 'Books' },
        { value: 'records', label: 'Records' },
        { value: 'custom', label: 'Custom' }
    ];

    // Fetches collections from the API
    const fetchCollections = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections`);
            const data = await response.json();
            setCollections(data);
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    // Initial fetch of collections
    useEffect(() => {
        fetchCollections();
    }, []);


        // Sorting function for collections
    // Handles different sort options and returns sorted array
    const getSortedCollections = (collections) => {
        const sorted = [...collections];
        switch (sortOption) {
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case 'newest':
                return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            case 'most-items':
                return sorted.sort((a, b) => b.item_count - a.item_count);
            case 'least-items':
                return sorted.sort((a, b) => a.item_count - b.item_count);
            default:
                return sorted;
        }
    };

    // Filter and sort collections based on search term and sort option
    useEffect(() => {
        const filtered = Array.isArray(collections) ? collections.filter(collection =>
            collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collection.type.toLowerCase().includes(searchTerm.toLowerCase())
        ) : [];
        const sortedAndFiltered = getSortedCollections(filtered);
        setFilteredCollections(sortedAndFiltered);
    }, [searchTerm, collections, sortOption]);
    
    // Handles adding a new collection
    const handleAddCollection = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                name: formData.name,
                type: formData.type === 'custom' ? formData.customType : formData.type
            };
            const response = await fetch(`${API_BASE_URL}/collections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
            });
            const data = await response.json();
            setCollections([...collections, data]);
            setShowAddModal(false);
            setFormData({ name: '', type: 'generic', customType: '' });
        } catch (error) {
            console.error('Error adding collection:', error);
        }
    };


    // Navigation and Action Handlers
    
    
    // Navigates to individual collection view
    const handleCollectionClick = (id) => {
        navigate(`/collection/${id}`);
    };

    // Initiates collection edit mode
    const handleEdit = (e, collection) => {
        e.stopPropagation();
        setEditingCollection(collection);
    };

    // Saves edited collection name
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/collections/${editingCollection.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: editingCollection.name }),
            });
            if (response.ok) {
                const updatedCollection = await response.json();
                setCollections(collections.map(c =>
                    c.id === updatedCollection.id ? updatedCollection : c
                ));
                setEditingCollection(null);
            }
        } catch (error) {
            console.error('Error updating collection:', error);
        }
    };

    // Handles collection deletion
    const handleDelete = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections/${collectionToDelete.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setCollections(collections.filter(c => c.id !== collectionToDelete.id));
                setShowDeleteModal(false);
                setCollectionToDelete(null);
            }
        } catch (error) {
            console.error('Error deleting collection:', error);
        }
    };
    return (
        <div className="collections-container">
            {/* Header Section with Title and Quick Add Button */}
            <div className="collections-header">
                <h2>My Collections</h2>
                <button className="quick-add-button" onClick={() => setShowAddModal(true)}>+</button>
            </div>

            {/* Search and Sort Controls */}
            <div className="search-and-sort">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search collections..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="sort-container">
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="sort-select"
                    >
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="most-items">Most Items</option>
                        <option value="least-items">Least Items</option>
                    </select>
                </div>
            </div>

            {/* Collections Grid Display */}
            <div className="collections-grid">
                {/* Mapped Collection Cards */}
                {filteredCollections.map(collection => (
                    <div
                        key={collection.id}
                        className="collection-card"
                        onClick={() => handleCollectionClick(collection.id)}
                    >
                        <div className="card-header">
                            {editingCollection?.id === collection.id ? (
                                // Edit Mode Form
                                <form onSubmit={handleSaveEdit} onClick={e => e.stopPropagation()}>
                                    <input
                                        value={editingCollection.name}
                                        onChange={e => setEditingCollection({
                                            ...editingCollection,
                                            name: e.target.value
                                        })}
                                        autoFocus
                                    />
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => setEditingCollection(null)}>Cancel</button>
                                </form>
                            ) : (
                                // Display Mode
                                <>
                                    <h3>{collection.name}</h3>
                                    <div className="card-actions" onClick={e => e.stopPropagation()}>
                                        <button onClick={(e) => handleEdit(e, collection)}>Edit</button>
                                        <button onClick={() => {
                                            setCollectionToDelete(collection);
                                            setShowDeleteModal(true);
                                        }}>Delete</button>
                                    </div>
                                </>
                            )}
                            <span className="card-type">{collection.type}</span>
                        </div>
                        <div className="card-content">
                            <p className="item-count">{collection.item_count} items</p>
                            <p className="created-date">Created: {new Date(collection.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}

                {/* Add New Collection Card */}
                <div className="collection-card add-card" onClick={() => setShowAddModal(true)}>
                    <div className="add-icon">+</div>
                    <p>Add New Collection</p>
                </div>
            </div>
            {/* Add Collection Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Add New Collection</h2>
                        <form onSubmit={handleAddCollection}>
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

                            {/* Collection Type Selection */}
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

                            {/* Custom Type Input - Only shown for custom type */}
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
                                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete "{collectionToDelete.name}"?</p>
                        <p>This will also delete all items in this collection.</p>
                        <div className="button-group">
                            <button onClick={handleDelete}>Delete</button>
                            <button onClick={() => {
                                setShowDeleteModal(false);
                                setCollectionToDelete(null);
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollectionList;