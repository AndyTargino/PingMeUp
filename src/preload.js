const { contextBridge, ipcRenderer } = require('electron');

console.log('[PRELOAD] Loading preload script');

// Expose safe IPC communication to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  ipcRenderer: {
    // Send messages to main process
    send: (channel, data) => {
      const allowedChannels = [
        'notification-closed',
        'notification-clicked',
        'notification-action'
      ];
      
      if (allowedChannels.includes(channel)) {
        console.log(`[PRELOAD] Sending IPC message: ${channel}`, data);
        ipcRenderer.send(channel, data);
      } else {
        console.warn(`[PRELOAD] Blocked IPC send to unauthorized channel: ${channel}`);
      }
    },

    // Listen for messages from main process
    on: (channel, func) => {
      const allowedChannels = [
        'notification-data',
        'close-notification',
        'update-notification'
      ];
      
      if (allowedChannels.includes(channel)) {
        console.log(`[PRELOAD] Setting up IPC listener for: ${channel}`);
        ipcRenderer.on(channel, func);
      } else {
        console.warn(`[PRELOAD] Blocked IPC listener for unauthorized channel: ${channel}`);
      }
    },

    // Remove listeners
    removeAllListeners: (channel) => {
      console.log(`[PRELOAD] Removing all listeners for: ${channel}`);
      ipcRenderer.removeAllListeners(channel);
    }
  }
});

console.log('[PRELOAD] Preload script loaded successfully');