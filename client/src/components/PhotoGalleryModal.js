import React, { useState, useEffect, useCallback } from 'react';
import './PhotoGalleryModal.css';
import API_BASE_URL from '../config';

// PhotoGalleryModal Component: Manages photo gallery for collection items
// Core Features:
// - Displays multiple photos in a carousel view
// - Handles photo uploads and deletions
// - Provides navigation between photos
// Props:
// - item: Current item being viewed
// - onClose: Modal close handler
// - onRefresh: Data refresh handler

const PhotoGalleryModal = ({ item, onClose, onRefresh }) => {
    // State management for photos and UI
    const [photos, setPhotos] = useState([]);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    // Fetch photos for the current item
    const fetchPhotos = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections/items/${item.id}/photos`);
            if (response.ok) {
                const data = await response.json();
                setPhotos(data);
            }
        } catch (error) {
            console.error('Error fetching photos:', error);
        }
    }, [item.id]);

    // Initialize photos on component mount
    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);
    // Handle multiple photo uploads
    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        setIsUploading(true);
        
        try {
            // Upload each photo sequentially
            for (const file of files) {
                const formData = new FormData();
                formData.append('photo', file);
                
                const response = await fetch(`${API_BASE_URL}/collections/${item.collection_id}/items/${item.id}/photos`, {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) {
                    throw new Error('Failed to upload photo');
                }
            }
            
            // Refresh photo list and parent component
            await fetchPhotos();
            onRefresh();
        } catch (error) {
            console.error('Error uploading photos:', error);
        } finally {
            setIsUploading(false);
        }
    };
    
    // Handle photo deletion
    const handleDeletePhoto = async (photoId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections/items/${item.id}/photos/${photoId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                // Adjust current photo index after deletion
                if (currentPhotoIndex > 0) {
                    setCurrentPhotoIndex(currentPhotoIndex - 1);
                }
                else if (currentPhotoIndex === photos.length - 1 && photos.length > 1) {
                    setCurrentPhotoIndex(photos.length - 2);
                }
                
                await fetchPhotos();
                onRefresh();
            }
        } catch (error) {
            console.error('Error deleting photo:', error);
        }
    };

    // Photo navigation handlers
    const nextPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    };

    const previousPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };
    return (
        <div className="photo-gallery-modal-overlay">
            <div className="photo-gallery-modal">
                {/* Modal header with title and close button */}
                <div className="modal-header">
                    <h2>Photo Gallery - {item.title}</h2>
                    <button onClick={onClose}>×</button>
                </div>

                <div className="gallery-content">
                    {photos.length > 0 ? (
                        <div className="gallery-viewer">
                            {/* Previous photo navigation button */}
                            <button
                                className="nav-button prev"
                                onClick={previousPhoto}
                                disabled={photos.length <= 1}
                            >
                                ‹
                            </button>
                            
                            {/* Current photo display */}
                            <div className="current-photo">
                                <div className="photo-counter">
                                    {currentPhotoIndex + 1} / {photos.length}
                                </div>
                                {photos[currentPhotoIndex] && (
                                    <img
                                        src={`${API_BASE_URL}/collections/items/${item.id}/photos/${photos[currentPhotoIndex].id}`}
                                        alt={`${item.title} - ${currentPhotoIndex + 1} of ${photos.length}`}
                                        onError={(e) => console.log('Image load error:', e)}
                                    />
                                )}
                                <button
                                    className="delete-photo"
                                    onClick={() => handleDeletePhoto(photos[currentPhotoIndex].id)}
                                >
                                    Delete Photo
                                </button>
                            </div>

                            {/* Next photo navigation button */}
                            <button
                                className="nav-button next"
                                onClick={nextPhoto}
                                disabled={photos.length <= 1}
                            >
                                ›
                            </button>
                        </div>
                    ) : (
                        <div className="no-photos">
                            <p>No photos in gallery</p>
                        </div>
                    )}

                    {/* Photo upload section */}
                    <div className="upload-section">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                        {isUploading && <p>Uploading...</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoGalleryModal;