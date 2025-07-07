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
    constructor(config = {}) {
        super();
        this.windows = new Map();
        this.groups = new Map();
        this.notificationQueue = { high: [], normal: [], low: [], critical: [] };
        this.idCounter = 0;
        this.processingQueue = false;
        this.config = {
            width: config.width || 420,
            height: config.height || 120,
            spacing: config.spacing || 20,
            maxVisible: config.maxVisible || 6,
            defaultDuration: config.defaultDuration || 5000,
            theme: config.theme || this.detectSystemTheme(),
            position: config.position || 'bottom-right',
            animation: config.animation || 'slide',
            sound: config.sound || { type: 'default', volume: 0.5 },
            persistent: config.persistent || false,
            showInTaskbar: config.showInTaskbar || false,
            enableBadges: config.enableBadges || true,
            enableGrouping: config.enableGrouping || true,
            enableQueueing: config.enableQueueing || true,
            clickToClose: config.clickToClose !== false,
            dragToClose: config.dragToClose || true,
            autoHideOnHover: config.autoHideOnHover || false,
            enableRichNotifications: config.enableRichNotifications !== false
        };
        this.stats = {
            total: 0,
            shown: 0,
            dismissed: 0,
            clicked: 0,
            averageDisplayTime: 0,
            byType: {},
            byPriority: {}
        };
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        // Handle system theme changes
        electron_1.nativeTheme.on('updated', () => {
            this.updateAllWindowsTheme();
        });
        // Handle screen changes
        electron_1.screen.on('display-metrics-changed', () => {
            this.repositionAllWindows();
        });
    }
    detectSystemTheme() {
        const platform = process.platform;
        switch (platform) {
            case 'darwin': return 'macos';
            case 'win32': return 'windows';
            default: return 'linux';
        }
    }
    getSystemColorScheme() {
        return electron_1.nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    }
    generateId() {
        return `notification-${++this.idCounter}-${Date.now()}`;
    }
    calculateNotificationHeight(data) {
        let baseHeight = this.config.height;
        // Adjust height based on content
        if (data.subtitle)
            baseHeight += 20;
        if (data.image)
            baseHeight += 100;
        if (data.actions && data.actions.length > 0)
            baseHeight += 40;
        switch (data.type) {
            case 'progress':
            case 'download':
            case 'upload':
            case 'loading':
                baseHeight += 30;
                break;
            case 'reply':
            case 'input':
                baseHeight += data.multiline ? 80 : 50;
                break;
            case 'confirmation':
                baseHeight += 40;
                break;
            case 'achievement':
            case 'celebration':
                baseHeight += 60;
                break;
            case 'weather':
                baseHeight += 40;
                break;
        }
        return Math.min(baseHeight, 400); // Maximum height
    }
    calculatePosition(height, priority) {
        const display = electron_1.screen.getPrimaryDisplay();
        const { width: screenWidth, height: screenHeight } = display.workAreaSize;
        const { x: screenX, y: screenY } = display.workArea;
        const visibleWindows = Array.from(this.windows.values())
            .filter(win => win.window && !win.window.isDestroyed() && win.window.isVisible())
            .sort((a, b) => {
            // Sort by priority, then by creation time
            const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return a.createdAt.getTime() - b.createdAt.getTime();
        });
        let cumulativeHeight = 0;
        visibleWindows.forEach(win => {
            cumulativeHeight += win.height + this.config.spacing;
        });
        let x, y;
        switch (this.config.position) {
            case 'top-left':
                x = screenX + this.config.spacing;
                y = screenY + this.config.spacing + cumulativeHeight;
                break;
            case 'top-right':
                x = screenX + screenWidth - this.config.width - this.config.spacing;
                y = screenY + this.config.spacing + cumulativeHeight;
                break;
            case 'top-center':
                x = screenX + (screenWidth - this.config.width) / 2;
                y = screenY + this.config.spacing + cumulativeHeight;
                break;
            case 'bottom-left':
                x = screenX + this.config.spacing;
                y = screenY + screenHeight - height - this.config.spacing - cumulativeHeight;
                break;
            case 'bottom-center':
                x = screenX + (screenWidth - this.config.width) / 2;
                y = screenY + screenHeight - height - this.config.spacing - cumulativeHeight;
                break;
            case 'center':
                x = screenX + (screenWidth - this.config.width) / 2;
                y = screenY + (screenHeight - height) / 2;
                break;
            case 'bottom-right':
            default:
                x = screenX + screenWidth - this.config.width - this.config.spacing;
                y = screenY + screenHeight - height - this.config.spacing - cumulativeHeight;
                break;
        }
        return { x, y };
    }
    repositionAllWindows() {
        const visibleWindows = Array.from(this.windows.values())
            .filter(win => win.window && !win.window.isDestroyed() && win.window.isVisible())
            .sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return a.createdAt.getTime() - b.createdAt.getTime();
        });
        let cumulativeHeight = 0;
        visibleWindows.forEach(win => {
            const position = this.calculatePosition(win.height, win.priority);
            win.window.setPosition(position.x, position.y);
            cumulativeHeight += win.height + this.config.spacing;
        });
    }
    updateAllWindowsTheme() {
        this.windows.forEach(notification => {
            if (notification.window && !notification.window.isDestroyed()) {
                const updatedData = {
                    ...notification.data,
                    theme: this.config.theme,
                    colorScheme: this.getSystemColorScheme()
                };
                notification.window.webContents.send('notification-update', updatedData);
            }
        });
    }
    playSound(data) {
        if (data.silent || !data.sound || data.sound.type === 'none')
            return;
        // Implementation would depend on your sound system
        // This is a placeholder for sound playing logic
        console.log(`Playing sound: ${data.sound.type} at volume ${data.sound.volume}`);
        this.emit('sound-played', { type: data.sound.type, volume: data.sound.volume });
    }
    shouldAutoClose(data) {
        // Fixed notifications never auto-close
        if (data.fixed || data.persistent || data.requireInteraction) {
            return false;
        }
        // Critical priority notifications require interaction
        if (data.priority === 'critical') {
            return false;
        }
        // Interactive types that should not auto-close
        const interactiveTypes = [
            'progress', 'reply', 'input', 'confirmation',
            'download', 'upload', 'loading'
        ];
        return !interactiveTypes.includes(data.type);
    }
    updateStats(action, data) {
        switch (action) {
            case 'created':
                this.stats.total++;
                if (data) {
                    this.stats.byType[data.type] = (this.stats.byType[data.type] || 0) + 1;
                    this.stats.byPriority[data.priority || 'normal'] =
                        (this.stats.byPriority[data.priority || 'normal'] || 0) + 1;
                }
                break;
            case 'shown':
                this.stats.shown++;
                break;
            case 'dismissed':
                this.stats.dismissed++;
                break;
            case 'clicked':
                this.stats.clicked++;
                break;
        }
        this.emit('stats-updated', this.stats);
    }
    async create(data) {
        const id = data.id || this.generateId();
        const priority = data.priority || 'normal';
        const height = this.calculateNotificationHeight(data);
        // Enhanced notification data with defaults
        const notificationData = {
            ...data,
            id,
            theme: data.theme || this.config.theme,
            colorScheme: data.colorScheme || this.getSystemColorScheme(),
            duration: data.duration ?? this.config.defaultDuration,
            timestamp: data.timestamp || new Date().toLocaleTimeString().slice(0, 5),
            priority,
            animation: data.animation || this.config.animation,
            sound: data.sound || this.config.sound
        };
        // Handle grouping
        if (this.config.enableGrouping && data.category) {
            if (!this.groups.has(data.category)) {
                this.groups.set(data.category, {
                    category: data.category,
                    notifications: [],
                    collapsed: false
                });
            }
        }
        // Check if we should queue this notification
        if (this.config.enableQueueing && this.getVisibleCount() >= this.config.maxVisible) {
            return this.queueNotification(notificationData);
        }
        // Replace notification with same tag
        if (data.tag) {
            const existing = Array.from(this.windows.values())
                .find(win => win.data.tag === data.tag);
            if (existing) {
                await this.close(existing.id);
            }
        }
        const position = this.calculatePosition(height, priority);
        const window = new electron_1.BrowserWindow({
            width: this.config.width,
            height: height,
            x: position.x,
            y: position.y,
            show: false,
            frame: false,
            alwaysOnTop: true,
            skipTaskbar: !this.config.showInTaskbar,
            resizable: false,
            transparent: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, '../src/preload.js')
            }
        });
        // Load the unified notification template
        const templatePath = path.join(__dirname, '../templates/notification.html');
        console.log('Loading template from:', templatePath);
        await window.loadFile(templatePath);
        // Send notification data when ready
        window.webContents.once('dom-ready', () => {
            window.webContents.send('notification-data', notificationData);
            this.playSound(notificationData);
            this.updateStats('shown');
        });
        // Handle window events
        window.on('closed', () => {
            this.windows.delete(id);
            this.updateStats('dismissed');
            this.repositionAllWindows();
            this.processQueue();
            this.emit('notification-closed', id);
        });
        window.webContents.on('dom-ready', () => {
            this.updateStats('clicked');
            this.emit('notification-clicked', id, notificationData);
            if (this.config.clickToClose && this.shouldAutoClose(notificationData)) {
                this.close(id);
            }
        });
        // Store window reference
        const notificationWindow = {
            id,
            window,
            data: notificationData,
            height,
            type: data.type,
            priority,
            createdAt: new Date(),
            lastShown: new Date(),
            interactionCount: 0
        };
        this.windows.set(id, notificationWindow);
        // Add to group if applicable
        if (this.config.enableGrouping && data.category) {
            const group = this.groups.get(data.category);
            group.notifications.push(notificationWindow);
        }
        // Show window with animation
        this.showWindowWithAnimation(window, notificationData.animation || 'slide');
        this.repositionAllWindows();
        // Auto-close logic
        if (this.shouldAutoClose(notificationData)) {
            setTimeout(() => {
                this.close(id);
            }, notificationData.duration);
        }
        this.updateStats('created', notificationData);
        this.emit('notification-created', id, notificationData);
        return id;
    }
    showWindowWithAnimation(window, animation) {
        window.show();
        // Send animation command to renderer
        window.webContents.send('play-animation', animation);
    }
    getVisibleCount() {
        return Array.from(this.windows.values())
            .filter(win => win.window && !win.window.isDestroyed() && win.window.isVisible()).length;
    }
    async update(id, data) {
        const notification = this.windows.get(id);
        if (!notification || notification.window.isDestroyed()) {
            return false;
        }
        // Update stored data
        notification.data = { ...notification.data, ...data };
        // Send update to renderer
        notification.window.webContents.send('notification-update', notification.data);
        this.emit('notification-updated', id, notification.data);
        return true;
    }
    async close(id) {
        const notification = this.windows.get(id);
        if (!notification || notification.window.isDestroyed()) {
            return false;
        }
        // Play close animation
        notification.window.webContents.send('play-close-animation');
        // Close after animation
        setTimeout(() => {
            if (!notification.window.isDestroyed()) {
                notification.window.close();
            }
        }, 300);
        return true;
    }
    async closeAll() {
        const promises = Array.from(this.windows.keys()).map(id => this.close(id));
        await Promise.all(promises);
        this.windows.clear();
        this.groups.clear();
        this.clearQueue();
    }
    async closeByCategory(category) {
        const group = this.groups.get(category);
        if (!group)
            return;
        const promises = group.notifications.map(n => this.close(n.id));
        await Promise.all(promises);
        this.groups.delete(category);
    }
    async closeByType(type) {
        const notifications = Array.from(this.windows.values())
            .filter(n => n.data.type === type);
        const promises = notifications.map(n => this.close(n.id));
        await Promise.all(promises);
    }
    updateProgress(id, progress) {
        const notification = this.windows.get(id);
        if (notification && !notification.window.isDestroyed()) {
            notification.window.webContents.send('progress-update', progress);
            this.emit('progress-updated', id, progress);
        }
    }
    setProgressIndeterminate(id, indeterminate) {
        const notification = this.windows.get(id);
        if (notification && !notification.window.isDestroyed()) {
            notification.window.webContents.send('progress-indeterminate', indeterminate);
        }
    }
    async queueNotification(data) {
        const priority = data.priority || 'normal';
        const id = data.id || this.generateId();
        data.id = id;
        this.notificationQueue[priority].push(data);
        this.emit('notification-queued', id, data);
        return id;
    }
    async processQueue() {
        if (this.processingQueue || this.getVisibleCount() >= this.config.maxVisible) {
            return;
        }
        this.processingQueue = true;
        // Process critical priority first, then high, normal, then low
        const priorities = ['critical', 'high', 'normal', 'low'];
        for (const priority of priorities) {
            while (this.notificationQueue[priority].length > 0 && this.getVisibleCount() < this.config.maxVisible) {
                const data = this.notificationQueue[priority].shift();
                await this.create(data);
            }
        }
        this.processingQueue = false;
    }
    clearQueue() {
        this.notificationQueue.critical = [];
        this.notificationQueue.high = [];
        this.notificationQueue.normal = [];
        this.notificationQueue.low = [];
        this.emit('queue-cleared');
    }
    createGroup(category) {
        if (!this.groups.has(category)) {
            this.groups.set(category, {
                category,
                notifications: [],
                collapsed: false
            });
        }
    }
    collapseGroup(category) {
        const group = this.groups.get(category);
        if (group) {
            group.collapsed = true;
            // Hide notifications except the first one
            group.notifications.slice(1).forEach(n => {
                if (n.window && !n.window.isDestroyed()) {
                    n.window.hide();
                }
            });
        }
    }
    expandGroup(category) {
        const group = this.groups.get(category);
        if (group) {
            group.collapsed = false;
            // Show all notifications in group
            group.notifications.forEach(n => {
                if (n.window && !n.window.isDestroyed()) {
                    n.window.show();
                }
            });
            this.repositionAllWindows();
        }
    }
    getActive() {
        return Array.from(this.windows.values()).filter(win => win.window && !win.window.isDestroyed());
    }
    getByCategory(category) {
        const group = this.groups.get(category);
        return group ? group.notifications : [];
    }
    getStats() {
        return { ...this.stats };
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.emit('config-updated', this.config);
        // Apply immediate changes
        if (config.theme) {
            this.updateAllWindowsTheme();
        }
    }
    getConfig() {
        return { ...this.config };
    }
    // Convenience methods with enhanced functionality
    async info(title, message, options) {
        return this.create({
            ...options,
            type: 'info',
            title,
            message,
            icon: options?.icon || '&#x2139;'
        });
    }
    async success(title, message, options) {
        return this.create({
            ...options,
            type: 'success',
            title,
            message,
            icon: options?.icon || '&#x2714;',
            sound: options?.sound || { type: 'success', volume: 0.6 }
        });
    }
    async warning(title, message, options) {
        return this.create({
            ...options,
            type: 'warning',
            title,
            message,
            icon: options?.icon || '&#x26A0;',
            priority: options?.priority || 'high'
        });
    }
    async error(title, message, options) {
        return this.create({
            ...options,
            type: 'error',
            title,
            message,
            icon: options?.icon || '&#x1F6AB;',
            priority: options?.priority || 'critical',
            requireInteraction: options?.requireInteraction !== false,
            sound: options?.sound || { type: 'error', volume: 0.8 }
        });
    }
    async progress(title, message, options) {
        return this.create({
            ...options,
            type: 'progress',
            title,
            message,
            icon: options?.icon || '&#x1F552;',
            fixed: true // Progress notifications are always fixed
        });
    }
    async reply(title, message, options) {
        return this.create({
            ...options,
            type: 'reply',
            title,
            message,
            icon: options?.icon || '&#x1F4DD;',
            requireInteraction: true // Reply notifications require interaction
        });
    }
    // New notification types
    async achievement(title, message, options) {
        return this.create({
            ...options,
            type: 'achievement',
            title,
            message,
            icon: options?.icon || '&#x1F3C6;',
            animation: options?.animation || 'bounce',
            sound: options?.sound || { type: 'success', volume: 0.7 },
            duration: options?.duration || 8000
        });
    }
    async download(title, message, options) {
        return this.create({
            ...options,
            type: 'download',
            title,
            message,
            icon: options?.icon || '&#x2B07;',
            fixed: true,
            showCancel: true
        });
    }
    async confirmation(title, message, options) {
        return this.create({
            ...options,
            type: 'confirmation',
            title,
            message,
            icon: options?.icon || '&#x2753;',
            requireInteraction: true,
            actions: options?.actions || [
                { id: 'confirm', label: 'Confirm', type: 'primary' },
                { id: 'cancel', label: 'Cancel', type: 'secondary' }
            ]
        });
    }
    async reminder(title, message, options) {
        return this.create({
            ...options,
            type: 'reminder',
            title,
            message,
            icon: options?.icon || '&#x23F0;',
            priority: options?.priority || 'high',
            requireInteraction: true,
            actions: options?.actions || [
                { id: 'snooze', label: 'Snooze', type: 'secondary' },
                { id: 'dismiss', label: 'Dismiss', type: 'primary' }
            ]
        });
    }
    async weather(title, message, options) {
        return this.create({
            ...options,
            type: 'weather',
            title,
            message,
            icon: options?.icon || '&#x2601;',
            category: 'weather'
        });
    }
}
exports.ElectronNotificationManager = ElectronNotificationManager;
//# sourceMappingURL=notification-manager.js.map