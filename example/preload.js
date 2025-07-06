const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    invoke: async (channel, ...args) => {
        const validChannels = [
            'create-notification',
            'create-info',
            'create-success', 
            'create-warning',
            'create-error',
            'create-progress',
            'create-achievement',
            'update-progress',
            'close-notification',
            'close-all'
        ];
        
        if (validChannels.includes(channel)) {
            return await ipcRenderer.invoke(channel, ...args);
        }
    },
    
    send: (channel, data) => {
        const validChannels = [
            'reply-notification-response',
            'notification-action'
        ];
        
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    }
});