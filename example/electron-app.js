const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { ElectronNotificationManager } = require('../dist/notification-manager');

let mainWindow;
let notificationManager;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

function setupNotificationManager() {
    notificationManager = new ElectronNotificationManager({
        width: 420,
        height: 120,
        spacing: 20,
        maxVisible: 6,
        defaultDuration: 5000,
        position: 'bottom-right',
        animation: 'slide',
        enableGrouping: true,
        enableQueueing: true
    });

    // Handle notification actions
    ipcMain.handle('create-notification', async (event, data) => {
        try {
            const id = await notificationManager.create(data);
            return { success: true, id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('create-info', async (event, title, message, options) => {
        try {
            const id = await notificationManager.info(title, message, options);
            return { success: true, id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('create-success', async (event, title, message, options) => {
        try {
            const id = await notificationManager.success(title, message, options);
            return { success: true, id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('create-warning', async (event, title, message, options) => {
        try {
            const id = await notificationManager.warning(title, message, options);
            return { success: true, id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('create-error', async (event, title, message, options) => {
        try {
            const id = await notificationManager.error(title, message, options);
            return { success: true, id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('create-progress', async (event, title, message, options) => {
        try {
            const id = await notificationManager.progress(title, message, options);
            return { success: true, id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('create-achievement', async (event, title, message, options) => {
        try {
            const id = await notificationManager.achievement(title, message, options);
            return { success: true, id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('update-progress', async (event, id, progress) => {
        notificationManager.updateProgress(id, progress);
        return { success: true };
    });

    ipcMain.handle('close-notification', async (event, id) => {
        try {
            const success = await notificationManager.close(id);
            return { success };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('close-all', async () => {
        try {
            await notificationManager.closeAll();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Handle notification interactions
    ipcMain.on('reply-notification-response', (event, data) => {
        console.log('Reply notification response:', data);
        notificationManager.emit('notification-replied', data);
    });

    ipcMain.on('notification-action', (event, data) => {
        console.log('Notification action:', data);
        notificationManager.emit('notification-action', data);
    });
}

app.whenReady().then(() => {
    createWindow();
    setupNotificationManager();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});