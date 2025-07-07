import { EventEmitter } from 'events';
export interface NotificationOptions {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
    icon?: string;
    theme?: 'light' | 'dark' | 'windows' | 'macos' | 'linux';
    clickToClose?: boolean;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}
export declare class ElectronNotificationManager extends EventEmitter {
    private notifications;
    private idCounter;
    private defaultOptions;
    constructor(defaultOptions?: Partial<NotificationOptions>);
    /**
     * Show a notification
     */
    show(options: NotificationOptions): Promise<string>;
    /**
     * Close a specific notification
     */
    close(id: string): void;
    /**
     * Close all notifications
     */
    closeAll(): void;
    /**
     * Get active notification count
     */
    getActiveCount(): number;
    private createNotificationWindow;
    private setupWindowHandlers;
    private calculatePosition;
    private repositionNotifications;
    private detectSystemTheme;
    /**
     * Convenience methods for different notification types
     */
    info(title: string, message: string, duration?: number): Promise<string>;
    success(title: string, message: string, duration?: number): Promise<string>;
    warning(title: string, message: string, duration?: number): Promise<string>;
    error(title: string, message: string, duration?: number): Promise<string>;
}
//# sourceMappingURL=notification-manager.d.ts.map