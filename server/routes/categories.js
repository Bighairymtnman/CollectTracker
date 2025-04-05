const express = require('express');
const router = express.Router();
const db = require('../db.config');

// Update a category
router.put('/collections/:collectionId/categories/:categoryId', async (req, res) => {
    try {
        const result = await db.run(
            'UPDATE categories SET name = ? WHERE id = ? AND collection_id = ?',
            [req.body.name, req.params.categoryId, req.params.collectionId]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        const updatedCategory = await db.get(
            'SELECT * FROM categories WHERE id = ?',
            [req.params.categoryId]
        );
        
        res.json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a category
router.delete('/collections/:collectionId/categories/:categoryId', async (req, res) => {
    try {
        await db.run(
            'DELETE FROM item_categories WHERE category_id = ?',
            [req.params.categoryId]
        );
        
        const result = await db.run(
            'DELETE FROM categories WHERE id = ? AND collection_id = ?',
            [req.params.categoryId, req.params.collectionId]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all categories for a collection
router.get('/collections/:id/categories', async (req, res) => {
    try {
        const categories = await db.all(
            'SELECT * FROM categories WHERE collection_id = ?',
            [req.params.id]
        );
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a new category
router.post('/collections/:id/categories', async (req, res) => {
    try {
        const result = await db.run(
            'INSERT INTO categories (collection_id, name) VALUES (?, ?)',
            [req.params.id, req.body.name]
        );
        const newCategory = await db.get(
            'SELECT * FROM categories WHERE id = ?',
            [result.id]
        );
        res.json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: error.message });
    }
});

// Assign category to item
router.post('/items/:itemId/categories/:categoryId', async (req, res) => {
    try {
        const item = await db.get('SELECT id FROM items WHERE id = ?', [req.params.itemId]);
        const category = await db.get('SELECT id FROM categories WHERE id = ?', [req.params.categoryId]);

        if (!item || !category) {
            return res.status(404).json({ error: 'Item or category not found' });
        }

        const existing = await db.get(
            'SELECT * FROM item_categories WHERE item_id = ? AND category_id = ?',
            [req.params.itemId, req.params.categoryId]
        );

        if (existing) {
            return res.json({ success: true, message: 'Category already assigned to item' });
        }

        await db.run(
            'INSERT INTO item_categories (item_id, category_id) VALUES (?, ?)',
            [req.params.itemId, req.params.categoryId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error assigning category:', error);
        res.status(500).json({ error: error.message });
    }
});

// Remove category from item
router.delete('/items/:itemId/categories/:categoryId', async (req, res) => {
    try {
        const result = await db.run(
            'DELETE FROM item_categories WHERE item_id = ? AND category_id = ?',
            [req.params.itemId, req.params.categoryId]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Category assignment not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing category:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get categories for an item
router.get('/items/:itemId/categories', async (req, res) => {
    try {
        const categories = await db.all(
            `SELECT c.* FROM categories c
            JOIN item_categories ic ON c.id = ic.category_id
            WHERE ic.item_id = ?`,
            [req.params.itemId]
        );
        res.json(categories);
    } catch (error) {
        console.error('Error fetching item categories:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;