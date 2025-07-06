const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    ipcRenderer: {
        send: (channel, data) => {
            const validChannels = [
                'reply-notification-response',
                'notification-action',
                'close-notification',
                'notification-interaction',
                'notification-error'
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        on: (channel, func) => {
            const validChannels = [
                // Core notification events
                'notification-data',
                'notification-update',
                'notification-close',
                
                // Progress events
                'progress-update',
                'progress-indeterminate',
                'progress-complete',
                'progress-error',
                
                // Animation events
                'play-animation',
                'play-close-animation',
                'animation-complete',
                
                // Sound events
                'play-sound',
                'sound-complete',
                
                // Interaction events
                'action-executed',
                'validation-result',
                
                // Legacy support
                'progress-data',
                'reply-data'
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, func);
            }
        },
        once: (channel, func) => {
            const validChannels = [
                'notification-data',
                'notification-update',
                'progress-update',
                'play-animation',
                'play-close-animation'
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.once(channel, func);
            }
        },
        removeListener: (channel, func) => {
            ipcRenderer.removeListener(channel, func);
        },
        removeAllListeners: (channel) => {
            ipcRenderer.removeAllListeners(channel);
        }
    },
    
    // Notification-specific APIs
    notification: {
        // Get notification metadata
        getMetadata: () => {
            return {
                platform: process.platform,
                version: process.versions.electron,
                timestamp: Date.now()
            };
        },
        
        // Log notification events for analytics
        logEvent: (event, data) => {
            ipcRenderer.send('notification-analytics', { event, data, timestamp: Date.now() });
        },
        
        // Get system capabilities
        getCapabilities: () => {
            return {
                supportsNotifications: true,
                supportsSound: true,
                supportsAnimations: true,
                supportsRichContent: true,
                supportsActions: true,
                maxActionsSupported: 10
            };
        }
    },
    
    // System integration
    system: {
        // Get system theme
        getTheme: () => {
            return ipcRenderer.invoke('get-system-theme');
        },
        
        // Get screen information
        getScreenInfo: () => {
            return ipcRenderer.invoke('get-screen-info');
        },
        
        // Open external URLs
        openExternal: (url) => {
            ipcRenderer.send('open-external', url);
        }
    }
});