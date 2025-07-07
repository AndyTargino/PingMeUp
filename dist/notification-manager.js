"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectronNotificationManager = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const events_1 = require("events");
class ElectronNotificationManager extends events_1.EventEmitter {
    constructor(defaultOptions) {
        super();
        this.notifications = new Map();
        this.idCounter = 0;
        this.defaultOptions = {
            type: 'info',
            duration: 5000,
            theme: this.detectSystemTheme(),
            clickToClose: true,
            position: 'top-right'
        };
        if (defaultOptions) {
            this.defaultOptions = { ...this.defaultOptions, ...defaultOptions };
        }
        console.log('[NOTIFICATION MANAGER] Initialized with defaults:', this.defaultOptions);
    }
    /**
     * Show a notification
     */
    async show(options) {
        const id = `notification-${++this.idCounter}`;
        const finalOptions = { ...this.defaultOptions, ...options };
        console.log(`[NOTIFICATION MANAGER] Creating notification ${id}:`, finalOptions);
        try {
            const window = await this.createNotificationWindow(id, finalOptions);
            const notification = {
                id,
                window,
                options: finalOptions,
                createdAt: new Date()
            };
            this.notifications.set(id, notification);
            this.emit('notification-created', { id, options: finalOptions });
            return id;
        }
        catch (error) {
            console.error(`[NOTIFICATION MANAGER] Failed to create notification ${id}:`, error);
            throw error;
        }
    }
    /**
     * Close a specific notification
     */
    close(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            console.log(`[NOTIFICATION MANAGER] Closing notification ${id}`);
            try {
                if (!notification.window.isDestroyed()) {
                    notification.window.close();
                }
            }
            catch (error) {
                console.error(`[NOTIFICATION MANAGER] Error closing notification ${id}:`, error);
            }
            this.notifications.delete(id);
            this.emit('notification-closed', { id });
        }
    }
    /**
     * Close all notifications
     */
    closeAll() {
        console.log('[NOTIFICATION MANAGER] Closing all notifications');
        const ids = Array.from(this.notifications.keys());
        ids.forEach(id => this.close(id));
    }
    /**
     * Get active notification count
     */
    getActiveCount() {
        return this.notifications.size;
    }
    async createNotificationWindow(id, options) {
        const { workAreaSize } = electron_1.screen.getPrimaryDisplay();
        const windowWidth = 350;
        const windowHeight = 100;
        const spacing = 10;
        // Calculate position based on existing notifications
        const { x, y } = this.calculatePosition(options.position, windowWidth, windowHeight, spacing);
        console.log(`[NOTIFICATION MANAGER] Creating window at position (${x}, ${y})`);
        const window = new electron_1.BrowserWindow({
            width: windowWidth,
            height: windowHeight,
            x,
            y,
            frame: false,
            alwaysOnTop: true,
            skipTaskbar: true,
            resizable: false,
            minimizable: false,
            maximizable: false,
            closable: true,
            show: false,
            transparent: true,
            hasShadow: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
                devTools: process.env.NODE_ENV === 'development'
            }
        });
        // Load the notification template
        const templatePath = path.join(__dirname, '../templates/notification.html');
        console.log(`[NOTIFICATION MANAGER] Loading template from: ${templatePath}`);
        try {
            await window.loadFile(templatePath);
            console.log(`[NOTIFICATION MANAGER] Template loaded successfully for ${id}`);
        }
        catch (error) {
            console.error(`[NOTIFICATION MANAGER] Failed to load template for ${id}:`, error);
            throw error;
        }
        // Setup window event handlers
        this.setupWindowHandlers(window, id, options);
        // Send notification data to renderer
        window.webContents.once('dom-ready', () => {
            console.log(`[NOTIFICATION MANAGER] DOM ready for ${id}, sending data`);
            const notificationData = {
                id,
                ...options,
                timestamp: new Date().toLocaleTimeString()
            };
            window.webContents.send('notification-data', notificationData);
            window.show();
            console.log(`[NOTIFICATION MANAGER] Notification ${id} displayed`);
        });
        // Fallback: send data after load completes
        window.webContents.once('did-finish-load', () => {
            console.log(`[NOTIFICATION MANAGER] Finished loading for ${id}, sending data as fallback`);
            const notificationData = {
                id,
                ...options,
                timestamp: new Date().toLocaleTimeString()
            };
            setTimeout(() => {
                if (!window.isDestroyed()) {
                    window.webContents.send('notification-data', notificationData);
                    if (!window.isVisible()) {
                        window.show();
                    }
                }
            }, 100);
        });
        return window;
    }
    setupWindowHandlers(window, id, options) {
        // Handle window closed
        window.on('closed', () => {
            console.log(`[NOTIFICATION MANAGER] Window closed for ${id}`);
            this.notifications.delete(id);
            this.repositionNotifications();
            this.emit('notification-closed', { id });
        });
        // Handle console messages from renderer
        window.webContents.on('console-message', (event, level, message, line, sourceId) => {
            const prefix = `[NOTIFICATION ${id}]`;
            switch (level) {
                case 0: // info
                    console.log(`${prefix} ${message}`);
                    break;
                case 1: // warning
                    console.warn(`${prefix} ${message}`);
                    break;
                case 2: // error
                    console.error(`${prefix} ${message}`);
                    break;
                default:
                    console.log(`${prefix} ${message}`);
            }
        });
        // Handle renderer crashes
        window.webContents.on('render-process-gone', (event, details) => {
            console.error(`[NOTIFICATION MANAGER] Renderer process crashed for ${id}:`, details);
            this.close(id);
        });
        // Handle page unresponsive
        window.webContents.on('unresponsive', () => {
            console.error(`[NOTIFICATION MANAGER] Page unresponsive for ${id}`);
        });
        // Handle IPC messages from renderer
        window.webContents.on('ipc-message', (event, channel, ...args) => {
            console.log(`[NOTIFICATION MANAGER] IPC message from ${id}:`, { channel, args });
            if (channel === 'notification-closed') {
                this.close(id);
            }
        });
    }
    calculatePosition(position, width, height, spacing) {
        const { workArea } = electron_1.screen.getPrimaryDisplay();
        const existingCount = this.notifications.size;
        const offset = (height + spacing) * existingCount;
        switch (position) {
            case 'top-right':
                return {
                    x: workArea.x + workArea.width - width - spacing,
                    y: workArea.y + spacing + offset
                };
            case 'top-left':
                return {
                    x: workArea.x + spacing,
                    y: workArea.y + spacing + offset
                };
            case 'bottom-right':
                return {
                    x: workArea.x + workArea.width - width - spacing,
                    y: workArea.y + workArea.height - height - spacing - offset
                };
            case 'bottom-left':
                return {
                    x: workArea.x + spacing,
                    y: workArea.y + workArea.height - height - spacing - offset
                };
            default:
                return {
                    x: workArea.x + workArea.width - width - spacing,
                    y: workArea.y + spacing + offset
                };
        }
    }
    repositionNotifications() {
        const notifications = Array.from(this.notifications.values());
        notifications.forEach((notification, index) => {
            if (!notification.window.isDestroyed()) {
                const spacing = 10;
                const { x } = this.calculatePosition(notification.options.position, 350, 100, spacing);
                const newY = this.calculatePosition(notification.options.position, 350, 100, spacing).y - (100 + spacing) * (notifications.length - 1 - index);
                notification.window.setPosition(x, newY);
            }
        });
    }
    detectSystemTheme() {
        try {
            return electron_1.nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
        }
        catch {
            return 'light';
        }
    }
    /**
     * Convenience methods for different notification types
     */
    info(title, message, duration = 5000) {
        return this.show({ title, message, type: 'info', duration });
    }
    success(title, message, duration = 5000) {
        return this.show({ title, message, type: 'success', duration });
    }
    warning(title, message, duration = 7000) {
        return this.show({ title, message, type: 'warning', duration });
    }
    error(title, message, duration = 0) {
        return this.show({ title, message, type: 'error', duration }); // No auto-close for errors
    }
}
exports.ElectronNotificationManager = ElectronNotificationManager;
//# sourceMappingURL=notification-manager.js.map