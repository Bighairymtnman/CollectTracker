const express = require('express');
const router = express.Router();
const db = require('../db.config');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new collection
router.post('/', async (req, res) => {
    try {
        const { name, type, description } = req.body;
        const result = await db.run(
            'INSERT INTO collections (name, type, description) VALUES (?, ?, ?)',
            [name, type, description]
        );
        res.status(201).json({ id: result.id, name, type, description });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all collections
router.get('/', async (req, res) => {
    try {
        const collections = await db.all(`
            SELECT
                c.*,
                COUNT(i.id) as item_count
            FROM collections c
            LEFT JOIN items i ON c.id = i.collection_id
            GROUP BY c.id
        `);
        res.json(collections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update collection description
router.put('/:id/description', async (req, res) => {
    try {
        const { description } = req.body;
        await db.run(
            'UPDATE collections SET description = ? WHERE id = ?',
            [description, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update collection
router.put('/:id', async (req, res) => {
    try {
        const { name, description } = req.body;
        await db.run(
            'UPDATE collections SET name = ?, description = ? WHERE id = ?',
            [name, description, req.params.id]
        );
        const updatedCollection = await db.get(
            'SELECT * FROM collections WHERE id = ?',
            [req.params.id]
        );
        res.json(updatedCollection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete collection
router.delete('/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM items WHERE collection_id = ?', [req.params.id]);
        await db.run('DELETE FROM collections WHERE id = ?', [req.params.id]);
        res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single collection by ID
router.get('/:id', async (req, res) => {
    try {
        const collection = await db.get(
            'SELECT * FROM collections WHERE id = ?',
            [req.params.id]
        );
        
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }
        
        res.json(collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new item in collection with image support
router.post('/:collectionId/items', upload.single('coverImage'), async (req, res) => {
    try {
        const { collectionId } = req.params;
        const { title, type, description, data } = req.body;
        
        console.log('Incoming item data:', { title, type, description, data });

        const result = await db.run(
            'INSERT INTO items (collection_id, title, type, description, data) VALUES (?, ?, ?, ?, ?)',
            [collectionId, title, type, description, JSON.stringify(data)]
        );

        if (req.file) {
            await db.run(
                'INSERT INTO images (item_id, image_data, is_cover) VALUES (?, ?, 1)',
                [result.id, req.file.buffer]
            );
        }
        
        const newItem = await db.get(
            'SELECT * FROM items WHERE id = ?',
            [result.id]
        );
        
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get item image
router.get('/items/:itemId/image', async (req, res) => {
    try {
        const image = await db.get(
            'SELECT image_data FROM images WHERE item_id = ? AND is_cover = 1',
            [req.params.itemId]
        );
        
        if (image) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(image.image_data);
        } else {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});

// Delete item
router.delete('/:collectionId/items/:itemId', async (req, res) => {
    try {
        const { collectionId, itemId } = req.params;
        await db.run('DELETE FROM item_categories WHERE item_id = ?', [itemId]);
        await db.run('DELETE FROM images WHERE item_id = ?', [itemId]);
        await db.run('DELETE FROM items WHERE id = ? AND collection_id = ?', [itemId, collectionId]);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update item
router.put('/:collectionId/items/:itemId', upload.single('coverImage'), async (req, res) => {
    try {
        const { collectionId, itemId } = req.params;
        const { title, description, data } = req.body;

        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

        await db.run(
            'UPDATE items SET title = ?, description = ?, data = ? WHERE id = ? AND collection_id = ?',
            [title, description, JSON.stringify(parsedData), itemId, collectionId]
        );

        if (req.file) {
            await db.run('DELETE FROM images WHERE item_id = ? AND is_cover = 1', [itemId]);
            
            await db.run(
                'INSERT INTO images (item_id, image_data, is_cover) VALUES (?, ?, 1)',
                [itemId, req.file.buffer]
            );
        }

        const updatedItem = await db.get(
            'SELECT * FROM items WHERE id = ? AND collection_id = ?',
            [itemId, collectionId]
        );

        res.json(updatedItem);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all items for a specific collection
router.get('/:collectionId/items', async (req, res) => {
    try {
        const { collectionId } = req.params;
        const items = await db.all(
            `SELECT i.*,
            GROUP_CONCAT(ic.category_id) as category_ids,
            GROUP_CONCAT(c.name) as category_names,
            img.id as image_id
            FROM items i
            LEFT JOIN item_categories ic ON i.id = ic.item_id
            LEFT JOIN categories c ON ic.category_id = c.id
            LEFT JOIN images img ON i.id = img.item_id AND img.is_cover = 1
            WHERE i.collection_id = ?
            GROUP BY i.id`,
            [collectionId]
        );

        const formattedItems = items.map(item => ({
            ...item,
            data: item.data ? (
                typeof item.data === 'string'
                    ? JSON.parse(item.data)
                    : item.data
            ) : {},
            categories: item.category_ids
                ? item.category_ids.split(',').map((id, index) => ({
                    id: Number(id),
                    name: item.category_names.split(',')[index]
                }))
                : []
        }));

        res.json(formattedItems);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items' });
    }
});

// Get all photos for an item
router.get('/items/:itemId/photos', async (req, res) => {
    try {
        const photos = await db.all(
            'SELECT id, created_at FROM item_photos WHERE item_id = ?',
            [req.params.itemId]
        );
        res.json(photos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});

// Get specific photo
router.get('/items/:itemId/photos/:photoId', async (req, res) => {
    try {
        const photo = await db.get(
            'SELECT image_data FROM item_photos WHERE id = ? AND item_id = ?',
            [req.params.photoId, req.params.itemId]
        );
        
        if (photo) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(photo.image_data);
        } else {
            res.status(404).json({ error: 'Photo not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
});

// Upload photo
router.post('/:collectionId/items/:itemId/photos', upload.single('photo'), async (req, res) => {
    try {
        console.log('Photo upload request received');
        console.log('File:', req.file);
        console.log('Item ID:', req.params.itemId);

        if (!req.file) {
            console.log('No file detected in request');
            return res.status(400).json({ error: 'No photo uploaded' });
        }

        const result = await db.run(
            'INSERT INTO item_photos (item_id, image_data) VALUES (?, ?)',
            [req.params.itemId, req.file.buffer]
        );

        console.log('Photo uploaded successfully:', result);

        res.status(201).json({
            id: result.id,
            created_at: new Date()
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

// Delete photo
router.delete('/items/:itemId/photos/:photoId', async (req, res) => {
    try {
        const result = await db.run(
            'DELETE FROM item_photos WHERE id = ? AND item_id = ?',
            [req.params.photoId, req.params.itemId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        res.json({
            message: 'Photo deleted successfully',
            deletedPhotoId: req.params.photoId
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});

module.exports = router;