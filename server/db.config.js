const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const getAppPath = () => {
    if (process.env.NODE_ENV === 'development') {
        return __dirname;
    }
    try {
        const { app } = require('electron');
        return app.getPath('userData');
    } catch {
        return __dirname;
    }
};


// Ensure database directory exists
const dbDirectory = path.join(getAppPath(), 'database');
if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(path.join(dbDirectory, 'collecttracker.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Create tables if they don't exist
        db.run(`CREATE TABLE IF NOT EXISTS collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            collection_id INTEGER,
            title TEXT NOT NULL,
            type TEXT,
            description TEXT,
            data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (collection_id) REFERENCES collections(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            collection_id INTEGER,
            name TEXT NOT NULL,
            FOREIGN KEY (collection_id) REFERENCES collections(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS item_categories (
            item_id INTEGER,
            category_id INTEGER,
            PRIMARY KEY (item_id, category_id),
            FOREIGN KEY (item_id) REFERENCES items(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER,
            image_data BLOB,
            is_cover BOOLEAN DEFAULT 0,
            FOREIGN KEY (item_id) REFERENCES items(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS item_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER,
            image_data BLOB,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items(id)
        )`);
    });
}

// Wrap SQLite methods in promises for async/await support
const dbAsync = {
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    },
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
};

module.exports = dbAsync;