const db = require('../db.config');

async function initializeDatabase() {
    try {
        // Collections table
        await db.run(`CREATE TABLE IF NOT EXISTS collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            description TEXT
        )`);

        // Categories table
        await db.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            collection_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (collection_id) REFERENCES collections (id)
        )`);

        // Items table
        await db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            collection_id INTEGER,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            data TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (collection_id) REFERENCES collections (id)
        )`);

        // Images table
        await db.run(`CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            image_data BLOB NOT NULL,
            is_cover INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
        )`);

        // Item_categories table
        await db.run(`CREATE TABLE IF NOT EXISTS item_categories (
            item_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            PRIMARY KEY (item_id, category_id),
            FOREIGN KEY (item_id) REFERENCES items (id),
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )`);

        // Item_photos table
        await db.run(`CREATE TABLE IF NOT EXISTS item_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            image_data BLOB NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
        )`);

        // Item_properties table
        await db.run(`CREATE TABLE IF NOT EXISTS item_properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER,
            property_name TEXT NOT NULL,
            property_value TEXT,
            FOREIGN KEY (item_id) REFERENCES items (id)
        )`);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

initializeDatabase();