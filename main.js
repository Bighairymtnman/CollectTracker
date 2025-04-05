const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const log = require('electron-log');

// Configure electron-log
log.transports.file.level = 'info';
log.transports.console.level = 'info';

const isDev = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || 3456;
const ROOT_PATH = app.getAppPath();

// Configure all paths based on environment
const BUILD_PATH = isDev
    ? path.join(ROOT_PATH, 'client', 'build')
    : path.join(process.resourcesPath);

const SERVER_PATH = isDev
    ? path.join(ROOT_PATH, 'server')
    : path.join(__dirname, './server');

const DB_PATH = isDev
    ? path.join(ROOT_PATH, 'database')
    : path.join(app.getPath('userData'), 'database');

// Log all paths for debugging
log.info('Current directory:', __dirname);
log.info('Root Path:', ROOT_PATH);
log.info('Build Path:', BUILD_PATH);
log.info('Server Path:', SERVER_PATH);
log.info('DB Path:', DB_PATH);

// Ensure database directory exists
if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
}

// Load environment variables
require('dotenv').config({ path: path.join(SERVER_PATH, '.env') });

// Create Express app with expanded limits
const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json({limit: '50mb'}));
expressApp.use(express.urlencoded({limit: '50mb', extended: true}));

// Enhanced static file serving
expressApp.use(express.static(BUILD_PATH, {
    setHeaders: (res, filepath) => {
        if (filepath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));

// Import routes using SERVER_PATH
const collectionsRoutes = require(path.join(SERVER_PATH, 'routes', 'collections'));
const categoriesRoutes = require(path.join(SERVER_PATH, 'routes', 'categories'));

// Use routes
expressApp.use('/api/collections', collectionsRoutes);
expressApp.use('/api', categoriesRoutes);

// Enhanced catch-all route
expressApp.get('*', (req, res) => {
    const indexPath = path.join(BUILD_PATH, 'index.html');
    log.info('Serving index.html from:', indexPath);
    res.sendFile(indexPath);
});

// Start Express server with enhanced logging
const server = expressApp.listen(PORT, () => {
    log.info(`Server starting...`);
    log.info(`Attempting to listen on port ${PORT}`);
    log.info(`Server successfully running on port ${PORT}`);
    log.info('Build Path:', BUILD_PATH);
    log.info('Server Path:', SERVER_PATH);
    log.info('Database Path:', DB_PATH);
});

function createWindow() {
    log.info('Creating Electron window...');
    log.info('Loading URL:', `http://localhost:${PORT}`);
    log.info('Checking index.html at:', path.join(BUILD_PATH, 'index.html'));
    log.info('File exists:', fs.existsSync(path.join(BUILD_PATH, 'index.html')));

    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
        
    });    
    
    mainWindow.loadURL(`http://localhost:${PORT}`);
}

app.whenReady().then(() => {
    log.info('Electron app ready...');
    setTimeout(createWindow, 3000);
});

app.on('window-all-closed', () => {
    server.close();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Export collection handler
ipcMain.handle('export-collection', async (event, collection) => {
    const { filePath } = await dialog.showSaveDialog({
        defaultPath: `${collection.name}.json`,
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (filePath) {
        fs.writeFileSync(filePath, JSON.stringify(collection, null, 2));
        return true;
    }
    return false;
});

// Import collection handler
ipcMain.handle('import-collection', async () => {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (filePaths.length > 0) {
        const data = fs.readFileSync(filePaths[0], 'utf8');
        return JSON.parse(data);
    }
    return null;
});