# PingMeUp 🔔

**Professional notification system for Electron applications with 20+ notification types, rich content, animations, and cross-platform theming.**

[![npm version](https://badge.fury.io/js/pingmeup.svg)](https://badge.fury.io/js/pingmeup)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- **20+ Notification Types**: From basic info/success/warning/error to advanced achievement, weather, progress, and interactive notifications
- **Rich Content Support**: Images, achievements with confetti, weather widgets, progress bars, reply inputs
- **Cross-Platform Theming**: Native Windows, macOS, and Linux styling with automatic detection
- **Professional Animations**: Slide, bounce, zoom, flip, fade animations with accessibility support
- **Priority System**: Critical, high, normal, low priority with intelligent queuing
- **Interactive Elements**: Reply notifications, confirmation dialogs, progress controls
- **Smart Auto-Close**: Context-aware auto-closing that respects fixed and interactive notifications
- **Grouping & Badges**: Organize notifications by category with visual badges
- **Dark/Light Mode**: Automatic system color scheme detection
- **Event-Driven**: Comprehensive event system for tracking interactions and analytics
- **TypeScript**: Full TypeScript support with comprehensive type definitions

## 🚀 Quick Start

### Installation

```bash
npm install pingmeup
```

### Basic Usage

```typescript
import { ElectronNotificationManager } from 'pingmeup';

// Initialize the notification manager
const notificationManager = new ElectronNotificationManager({
    theme: 'auto', // windows, macos, linux, or auto
    position: 'bottom-right',
    maxVisible: 4
});

// Create a simple notification
await notificationManager.info('Hello!', 'This is your first PingMeUp notification');

// Create a success notification with custom options
await notificationManager.success('Task Completed', 'Your file has been uploaded successfully', {
    duration: 3000,
    animation: 'bounce'
});

// Create a progress notification
const progressId = await notificationManager.progress('Downloading...', 'Downloading important-file.zip');

// Update progress
notificationManager.updateProgress(progressId, 45);

// Create an interactive reply notification
await notificationManager.reply('Quick Reply', 'What do you think about this?', {
    placeholder: 'Type your response...'
});

// Create an achievement notification with confetti
await notificationManager.achievement('Level Up!', 'You reached level 10!', {
    level: 'Level 10',
    points: 500,
    showConfetti: true,
    animation: 'bounce'
});
```

## 📋 Notification Types

### Basic Types
- **info** - General information
- **success** - Success messages with celebration
- **warning** - Warning alerts with high priority
- **error** - Error messages requiring attention
- **custom** - Custom styled notifications

### Interactive Types
- **progress** - Progress bars with real-time updates
- **reply** - Text input for user responses
- **confirmation** - Yes/No confirmation dialogs
- **input** - Form input with validation

### Advanced Types
- **achievement** - Gamification with confetti and levels
- **update** - System/app update notifications
- **download/upload** - File transfer with progress
- **system** - System-level notifications
- **security** - Security alerts and warnings
- **reminder** - Reminders with snooze options
- **calendar** - Calendar events and meetings

### Creative Types
- **weather** - Weather information with rich data
- **celebration** - Special celebration notifications
- **loading** - Loading states with spinners
- **alert** - High-priority alerts
- **tip** - Helpful tips and hints
- **news** - News and announcements
- **promotional** - Marketing and promotional content

## 🎨 Customization

### Themes

PingMeUp automatically detects your operating system and applies the appropriate theme:

- **Windows**: Fluent Design inspired styling
- **macOS**: Apple Human Interface Guidelines styling
- **Linux**: Clean, modern styling with Ubuntu font stack

```typescript
const manager = new ElectronNotificationManager({
    theme: 'macos', // Force specific theme
    colorScheme: 'dark' // Force dark mode
});
```

### Animations

Choose from multiple animation styles:

```typescript
await manager.info('Animated!', 'This notification bounces in', {
    animation: 'bounce' // slide, fade, bounce, zoom, flip, none
});
```

### Priority System

Control notification priority and behavior:

```typescript
await manager.error('Critical Error', 'Something went wrong!', {
    priority: 'critical', // critical, high, normal, low
    requireInteraction: true, // Must be manually dismissed
    fixed: true // Never auto-closes
});
```

## 🎯 Advanced Features

### Event Handling

```typescript
// Listen to notification events
manager.on('notification-created', (id, data) => {
    console.log(`Notification ${id} created:`, data);
});

manager.on('notification-clicked', (id, data) => {
    console.log(`Notification ${id} was clicked`);
});

manager.on('notification-closed', (id) => {
    console.log(`Notification ${id} was closed`);
});

// Handle reply responses
manager.on('reply-received', (id, response) => {
    console.log(`Reply from ${id}: ${response}`);
});
```

### Grouping Notifications

```typescript
// Group related notifications
await manager.info('Group Test 1', 'Message 1', { category: 'updates' });
await manager.info('Group Test 2', 'Message 2', { category: 'updates' });

// Collapse/expand groups
manager.collapseGroup('updates');
manager.expandGroup('updates');

// Close entire groups
await manager.closeByCategory('updates');
```

### Queue Management

```typescript
// Configure queuing
const manager = new ElectronNotificationManager({
    enableQueueing: true,
    maxVisible: 3
});

// Notifications will automatically queue when limit is reached
// Higher priority notifications are shown first
```

### Statistics and Analytics

```typescript
// Get notification statistics
const stats = manager.getStats();
console.log(stats);
/*
{
    total: 150,
    shown: 145,
    dismissed: 120,
    clicked: 80,
    averageDisplayTime: 4500,
    byType: { info: 50, success: 30, error: 10, ... },
    byPriority: { normal: 100, high: 35, critical: 15 }
}
*/
```

## 🛠️ Configuration Options

```typescript
interface NotificationConfig {
    width?: number;                    // Default: 420
    height?: number;                   // Default: 120
    spacing?: number;                  // Default: 20
    maxVisible?: number;               // Default: 6
    defaultDuration?: number;          // Default: 5000ms
    theme?: NotificationTheme;         // Default: auto-detected
    position?: NotificationPosition;   // Default: 'bottom-right'
    animation?: AnimationType;         // Default: 'slide'
    sound?: NotificationSound;         // Default: { type: 'default', volume: 0.5 }
    persistent?: boolean;              // Default: false
    showInTaskbar?: boolean;           // Default: false
    enableBadges?: boolean;            // Default: true
    enableGrouping?: boolean;          // Default: true
    enableQueueing?: boolean;          // Default: true
    clickToClose?: boolean;            // Default: true
    dragToClose?: boolean;             // Default: true
    autoHideOnHover?: boolean;         // Default: false
    enableRichNotifications?: boolean; // Default: true
}
```

## 🎮 Interactive Examples

### Weather Notification
```typescript
await manager.weather('Current Weather', 'Partly cloudy with a chance of rain', {
    temperature: '24°C',
    condition: 'Partly Cloudy',
    humidity: '65%',
    location: 'New York, NY'
});
```

### Achievement with Confetti
```typescript
await manager.achievement('Achievement Unlocked!', 'You completed 100 tasks!', {
    level: 'Task Master',
    points: 1000,
    showConfetti: true,
    gradient: true,
    animation: 'bounce'
});
```

### Update Notification
```typescript
await manager.create({
    type: 'update',
    title: 'Update Available',
    message: 'Version 2.0 is ready to install',
    version: '2.0.0',
    mandatory: false,
    changelogUrl: 'https://example.com/changelog',
    actions: [
        { id: 'update', label: 'Update Now', type: 'primary' },
        { id: 'later', label: 'Later', type: 'secondary' },
        { id: 'changelog', label: 'View Changes', type: 'secondary' }
    ]
});
```

## 🔧 Integration with Electron

### Main Process Setup

```typescript
// main.ts
import { ElectronNotificationManager } from 'pingmeup';

const notificationManager = new ElectronNotificationManager();

// Handle IPC from renderer
ipcMain.handle('show-notification', async (event, type, title, message) => {
    return await notificationManager[type](title, message);
});
```

### Renderer Process

```typescript
// renderer.ts
window.electronAPI.ipcRenderer.invoke('show-notification', 'success', 'Done!', 'Task completed');
```

## 🎨 Styling and Theming

PingMeUp comes with professional styling that adapts to your operating system:

- **Backdrop filters** for modern glass effects
- **CSS custom properties** for easy customization
- **Responsive design** that works on any screen size
- **Accessibility support** with reduced motion options
- **High contrast mode** support

## 📱 Accessibility

- **Keyboard navigation** (Escape to close, Enter to confirm)
- **Screen reader friendly** with proper ARIA labels
- **Reduced motion support** for users with motion sensitivity
- **High contrast mode** support
- **Focus management** for interactive elements

## 🚀 Performance

- **Lightweight**: Minimal memory footprint
- **Efficient rendering**: GPU-accelerated animations
- **Smart queuing**: Prevents notification spam
- **Automatic cleanup**: Memory leak prevention
- **Lazy loading**: Resources loaded on demand

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern OS notification systems
- Built with TypeScript and Electron
- Design influenced by Material Design and Fluent Design principles

---

**Made with ❤️ by AndyTargino**

For more examples and detailed documentation, visit our [GitHub repository](https://github.com/AndyTargino/pingmeup).