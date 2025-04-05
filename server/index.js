const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db.config');
const collectionsRouter = require('./routes/collections');
const categoriesRouter = require('./routes/categories');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Routes
app.use('/api/collections', collectionsRouter);
app.use('/api', categoriesRouter);

// Basic test route
app.get('/test', (req, res) => {
    res.json({ message: "Server is running!" });
});

// Database test route
app.get('/db-test', async (req, res) => {
    try {
        const result = await db.get('SELECT 1');
        res.json({ message: "Database connected successfully!", result });
    } catch (error) {
        res.status(500).json({ message: "Database connection failed", error: error.message });
    }
});

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});