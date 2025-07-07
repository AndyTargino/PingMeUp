import { BrowserWindow, screen, nativeTheme } from 'electron';
import * as path from 'path';
import { EventEmitter } from 'events';

// Simplified interfaces
export interface NotificationOptions {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number; // milliseconds, 0 = no auto-close
  icon?: string;
  theme?: 'light' | 'dark' | 'windows' | 'macos' | 'linux';
  clickToClose?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface ActiveNotification {
  id: string;
  window: BrowserWindow;
  options: NotificationOptions;
  createdAt: Date;
}

export class ElectronNotificationManager extends EventEmitter {
  private notifications: Map<string, ActiveNotification> = new Map();
  private idCounter = 0;
  private defaultOptions: Partial<NotificationOptions> = {
    type: 'info',
    duration: 5000,
    theme: this.detectSystemTheme(),
    clickToClose: true,
    position: 'top-right'
  };

  constructor(defaultOptions?: Partial<NotificationOptions>) {
    super();
    if (defaultOptions) {
      this.defaultOptions = { ...this.defaultOptions, ...defaultOptions };
    }
    
    console.log('[NOTIFICATION MANAGER] Initialized with defaults:', this.defaultOptions);
  }

  /**
   * Show a notification
   */
  async show(options: NotificationOptions): Promise<string> {
    const id = `notification-${++this.idCounter}`;
    const finalOptions = { ...this.defaultOptions, ...options };
    
    console.log(`[NOTIFICATION MANAGER] Creating notification ${id}:`, finalOptions);

    try {
      const window = await this.createNotificationWindow(id, finalOptions);
      
      const notification: ActiveNotification = {
        id,
        window,
        options: finalOptions,
        createdAt: new Date()
      };

      this.notifications.set(id, notification);
      this.emit('notification-created', { id, options: finalOptions });

      return id;
    } catch (error) {
      console.error(`[NOTIFICATION MANAGER] Failed to create notification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Close a specific notification
   */
  close(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      console.log(`[NOTIFICATION MANAGER] Closing notification ${id}`);
      try {
        if (!notification.window.isDestroyed()) {
          notification.window.close();
        }
      } catch (error) {
        console.error(`[NOTIFICATION MANAGER] Error closing notification ${id}:`, error);
      }
      this.notifications.delete(id);
      this.emit('notification-closed', { id });
    }
  }

  /**
   * Close all notifications
   */
  closeAll(): void {
    console.log('[NOTIFICATION MANAGER] Closing all notifications');
    const ids = Array.from(this.notifications.keys());
    ids.forEach(id => this.close(id));
  }

  /**
   * Get active notification count
   */
  getActiveCount(): number {
    return this.notifications.size;
  }

  private async createNotificationWindow(id: string, options: NotificationOptions): Promise<BrowserWindow> {
    const { workAreaSize } = screen.getPrimaryDisplay();
    const windowWidth = 350;
    const windowHeight = 100;
    const spacing = 10;
    
    // Calculate position based on existing notifications
    const { x, y } = this.calculatePosition(options.position!, windowWidth, windowHeight, spacing);

    console.log(`[NOTIFICATION MANAGER] Creating window at position (${x}, ${y})`);

    const window = new BrowserWindow({
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
    } catch (error) {
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

  private setupWindowHandlers(window: BrowserWindow, id: string, options: NotificationOptions): void {
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

  private calculatePosition(position: string, width: number, height: number, spacing: number): { x: number; y: number } {
    const { workArea } = screen.getPrimaryDisplay();
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

  private repositionNotifications(): void {
    const notifications = Array.from(this.notifications.values());
    
    notifications.forEach((notification, index) => {
      if (!notification.window.isDestroyed()) {
        const spacing = 10;
        const { x } = this.calculatePosition(
          notification.options.position!,
          350,
          100,
          spacing
        );
        
        const newY = this.calculatePosition(
          notification.options.position!,
          350,
          100,
          spacing
        ).y - (100 + spacing) * (notifications.length - 1 - index);
        
        notification.window.setPosition(x, newY);
      }
    });
  }

  private detectSystemTheme(): 'light' | 'dark' {
    try {
      return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  /**
   * Convenience methods for different notification types
   */
  info(title: string, message: string, duration = 5000): Promise<string> {
    return this.show({ title, message, type: 'info', duration });
  }

  success(title: string, message: string, duration = 5000): Promise<string> {
    return this.show({ title, message, type: 'success', duration });
  }

  warning(title: string, message: string, duration = 7000): Promise<string> {
    return this.show({ title, message, type: 'warning', duration });
  }

  error(title: string, message: string, duration = 0): Promise<string> {
    return this.show({ title, message, type: 'error', duration }); // No auto-close for errors
  }
}