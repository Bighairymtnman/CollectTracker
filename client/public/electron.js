const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: true,
            maxHttpBufferSize: 50 * 1024 * 1024 // 50MB limit for uploads
        }
    });

    // Update the development URL to port 5000
    win.loadURL(
        isDev
            ? 'http://localhost:5000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );
}

// Rest of the code remains the same
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});