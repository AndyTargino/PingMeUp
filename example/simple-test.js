const { app, BrowserWindow } = require('electron');
const { ElectronNotificationManager } = require('../dist/notification-manager');

let mainWindow;
let notificationManager;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadURL('data:text/html,<!DOCTYPE html><html><head><title>Notification Test</title></head><body><h1>Check your screen for notifications!</h1><p>Various notifications will appear automatically to test the system.</p></body></html>');
  
  // Initialize notification manager
  notificationManager = new ElectronNotificationManager({
    theme: 'windows', // or 'macos', 'linux', 'light', 'dark'
    position: 'top-right'
  });

  // Test different notification types
  setTimeout(() => testNotifications(), 1000);
}

async function testNotifications() {
  console.log('Starting notification tests...');

  try {
    // Test 1: Basic info notification (5 second default)
    await notificationManager.info(
      'Welcome!', 
      'This is a basic info notification that will auto-close in 5 seconds.'
    );

    setTimeout(async () => {
      // Test 2: Success notification
      await notificationManager.success(
        'Success!', 
        'Operation completed successfully.'
      );
    }, 1000);

    setTimeout(async () => {
      // Test 3: Warning notification (7 second default)
      await notificationManager.warning(
        'Warning', 
        'This is a warning message that stays a bit longer.'
      );
    }, 2000);

    setTimeout(async () => {
      // Test 4: Error notification (no auto-close)
      await notificationManager.error(
        'Error!', 
        'This error notification stays until you close it manually.'
      );
    }, 3000);

    setTimeout(async () => {
      // Test 5: Custom notification with no auto-close
      await notificationManager.show({
        title: 'Custom Notification',
        message: 'This notification will not auto-close (duration: 0).',
        type: 'info',
        duration: 0, // No auto-close
        icon: '🔔'
      });
    }, 4000);

    setTimeout(async () => {
      // Test 6: Quick notification
      await notificationManager.show({
        title: 'Quick Message',
        message: 'This will close in 2 seconds.',
        type: 'success',
        duration: 2000
      });
    }, 5000);

    console.log('All notification tests queued!');

  } catch (error) {
    console.error('Error during notification tests:', error);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (notificationManager) {
    notificationManager.closeAll();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle notification manager events
process.on('exit', () => {
  if (notificationManager) {
    notificationManager.closeAll();
  }
});