import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import './CollectionPage.css';
import AddItemForm from './AddItemForm';
import ItemCard from './ItemCard';
import Sidebar from './Sidebar';
import SearchSortControls from './SearchSortControls';
import CollectionValue from './CollectionValue';


// CollectionPage Component: Main interface for individual collection management
// Core Features:
// - Displays and manages collection items with search and sort capabilities
// - Handles category management (create, edit, delete)
// - Manages item categorization
// - Provides collection description editing
// - Shows collection value for record-type collections
// State Management:
// - collection: Current collection data
// - items: Array of collection items
// - categories: Array of collection categories
// - selectedCategory: Currently selected category filter
// - searchTerm: Current search filter
// - sortOption: Current sort preference
// Dependencies:
// - Requires AddItemForm, ItemCard, Sidebar, SearchSortControls, and CollectionValue components
// - Uses React Router for navigation
// - Interfaces with API for all CRUD operations


const CollectionPage = () => {
    // Router and navigation hooks
    const { id } = useParams();
    const navigate = useNavigate();

    // Primary state management
    const [collection, setCollection] = useState(null);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    // Category management states
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [description, setDescription] = useState('');

    // Search and sort states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('title-asc');

    // Sort options configuration
    const sortOptions = [
        { value: 'title-asc', label: 'Title (A-Z)' },
        { value: 'title-desc', label: 'Title (Z-A)' },
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' }
    ];

    // Data refresh function using useCallback for memoization
    const refreshItemsAndCategories = useCallback(async () => {
        try {
            const [itemsResponse, categoriesResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/collections/${id}/items`),
                fetch(`${API_BASE_URL}/collections/${id}/categories`)
            ]);
            
            if (!itemsResponse.ok || !categoriesResponse.ok) {
                throw new Error('Failed to fetch updated data');
            }
   
            const itemsData = await itemsResponse.json();
            const categoriesData = await categoriesResponse.json();
            
            setItems(itemsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }, [id]);
    // Effect hooks for data fetching and initialization
    useEffect(() => {
        // Fetches initial collection data
        const fetchCollection = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/collections/${id}`);
                const data = await response.json();
                setCollection(data);
                setDescription(data.description || '');
            } catch (error) {
                console.error('Error fetching collection:', error);
            }
        };
        fetchCollection();
    }, [id]);

    // Refreshes items and categories when collection ID changes
    useEffect(() => {
        if (id) {
            refreshItemsAndCategories();
        }
    }, [id, refreshItemsAndCategories]);

    // Collection description update handler
    const handleDescriptionChange = async (newDescription) => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections/${id}/description`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description: newDescription }),
            });
            if (response.ok) {
                setDescription(newDescription);
            }
        } catch (error) {
            console.error('Error updating description:', error);
        }
    };

    // Category management handlers
    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/collections/${id}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newCategoryName }),
            });
            const newCategory = await response.json();
            setCategories([...categories, newCategory]);
            setNewCategoryName('');
            setShowAddCategory(false);
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };


    // Category edit and delete handlers
    const handleEditCategory = async (categoryId, newName) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/collections/${id}/categories/${categoryId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: newName }),
                }
            );
            if (response.ok) {
                refreshItemsAndCategories();
            }
        } catch (error) {
            console.error('Error editing category:', error);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/collections/${id}/categories/${categoryId}`,
                {
                    method: 'DELETE',
                }
            );
            if (response.ok) {
                refreshItemsAndCategories();
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };


    
    // Item category management handler
    const handleUpdateCategories = async (itemId, newCategories) => {
        try {
            const item = items.find(i => i.id === itemId);
            if (!item) return;

            // Remove existing categories
            const existingCategories = item.categories || [];
            await Promise.all(existingCategories.map(cat =>
                fetch(`${API_BASE_URL}/items/${itemId}/categories/${cat.id}`, {
                    method: 'DELETE',
                })
            ));

            // Add new categories
            await Promise.all(newCategories.map(categoryId =>
                fetch(`${API_BASE_URL}/items/${itemId}/categories/${categoryId}`, {
                    method: 'POST',
                })
            ));

            await refreshItemsAndCategories();
        } catch (error) {
            console.error('Error updating categories:', error);
        }
    };
    // Item management handlers
    const handleItemAdded = (newItem) => {
        // Immediately add new item to state for UI responsiveness
        const itemWithCategories = { ...newItem, categories: [] };
        setItems(currentItems => [...currentItems, itemWithCategories]);
        
        // Refresh data to ensure synchronization
        refreshItemsAndCategories();
    };
            
    const handleItemDelete = (itemId) => {
        setItems(items.filter(item => item.id !== itemId));
    };
    
    // Navigation handler
    const handleMainMenuClick = () => {
        navigate('/');
    };

    // Item filtering and sorting logic
    const filteredItems = selectedCategory
        ? items.filter(item => {
            const itemCategories = item.categories || [];
            const matchesCategory = itemCategories.some(cat => cat.id === selectedCategory);
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        : items.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const sortedItems = [...filteredItems].sort((a, b) => {
        switch (sortOption) {
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            case 'newest':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'oldest':
                return new Date(a.created_at) - new Date(b.created_at);
            default:
                return 0;
        }
    });
    return (
        <div className="collection-page">
            {/* Main Menu Navigation */}
            <button
                className="main-menu-button"
                onClick={handleMainMenuClick}
            >
                Main Menu
            </button>

            {/* Sidebar Component */}
            <Sidebar
                collectionId={id}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                showAddCategory={showAddCategory}
                setShowAddCategory={setShowAddCategory}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                collectionName={collection?.name}
                description={description}
                onDescriptionChange={handleDescriptionChange}
            />

            {/* Main Content Area */}
            <div className="collection-content">
                {/* Collection Header */}
                <div className="collection-header">
                    <h1>{collection?.name}</h1>
                    {collection && collection.type.toLowerCase() === 'records' && (
                        <CollectionValue items={items} />
                    )}
                    {collection && (
                        <AddItemForm
                            collectionType={collection.type.toLowerCase()}
                            onItemAdded={handleItemAdded}
                        />
                    )}
                </div>

                {/* Search and Sort Controls */}
                <SearchSortControls
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                    sortOptions={sortOptions}
                    searchPlaceholder="Search items..."
                />

                {/* Items Grid */}
                <div className="items-list">
                    {sortedItems.map((item, index) => (
                        <ItemCard
                            key={index}
                            item={item}
                            type={collection?.type.toLowerCase()}
                            categories={categories}
                            onUpdateCategories={handleUpdateCategories}
                            onDelete={handleItemDelete}
                            onRefresh={refreshItemsAndCategories}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CollectionPage;