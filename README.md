# Electron Notifications

A unified, cross-platform notification system for Electron applications with support for multiple notification types, themes, and OS-specific styling.

## Features

- **Unified Interface**: Single component handles all notification types
- **Multiple Types**: Basic, Progress, and Reply notifications
- **Cross-Platform Themes**: Windows, macOS, and Linux styling
- **Dark Mode Support**: Automatic system theme detection
- **TypeScript Support**: Full type definitions included
- **Customizable**: Flexible configuration options
- **Standalone**: Can be used as a separate npm package

## Installation

```bash
npm install @your-org/electron-notifications
```

## Quick Start

```typescript
import { ElectronNotificationManager } from '@your-org/electron-notifications';

// Create manager instance
const notifications = new ElectronNotificationManager({
  theme: 'windows', // or 'macos', 'linux'
  maxVisible: 4,
  position: 'bottom-right'
});

// Show basic notification
await notifications.info('Hello', 'This is a notification!');

// Show progress notification
const progressId = await notifications.progress('Processing', 'Please wait...');
notifications.updateProgress(progressId, 50);

// Show reply notification
await notifications.reply('Input Required', 'Please enter your name:', {
  placeholder: 'Your name here...'
});
```

## Notification Types

### Basic Notifications
- `info` - Information messages
- `success` - Success confirmations
- `warning` - Warning alerts
- `error` - Error messages
- `custom` - Custom notifications

### Progress Notifications
Show progress bars with real-time updates:

```typescript
const id = await notifications.progress('Uploading', 'File upload in progress...');
notifications.updateProgress(id, 25);
notifications.updateProgress(id, 50);
notifications.updateProgress(id, 100); // Auto-completes and closes
```

### Reply Notifications
Interactive notifications that accept user input:

```typescript
const id = await notifications.reply('Question', 'What is your favorite color?', {
  placeholder: 'Enter color...',
  buttonLabels: {
    send: 'Submit',
    cancel: 'Skip'
  }
});
```

## Configuration

```typescript
const notifications = new ElectronNotificationManager({
  width: 380,           // Notification width
  height: 100,          // Base notification height
  spacing: 20,          // Spacing between notifications
  maxVisible: 4,        // Maximum visible notifications
  defaultDuration: 5000, // Auto-close duration (ms)
  theme: 'windows',     // Theme: 'windows', 'macos', 'linux'
  position: 'bottom-right' // Position: 'top-left', 'top-right', 'bottom-left', 'bottom-right'
});
```

## Themes

The package automatically detects the operating system and applies appropriate styling:

- **Windows**: Modern Fluent Design inspired
- **macOS**: Native macOS appearance
- **Linux**: Clean, minimalist design

Dark mode is automatically detected and applied based on system preferences.

## API Reference

### ElectronNotificationManager

#### Methods

- `create(data: NotificationData): Promise<string>` - Create a notification
- `updateProgress(id: string, progress: number): void` - Update progress notification
- `close(id: string): void` - Close specific notification
- `closeAll(): void` - Close all notifications
- `getActive(): NotificationWindow[]` - Get active notifications

#### Convenience Methods

- `info(title, message, options?)` - Show info notification
- `success(title, message, options?)` - Show success notification
- `warning(title, message, options?)` - Show warning notification
- `error(title, message, options?)` - Show error notification
- `progress(title, message, options?)` - Show progress notification
- `reply(title, message, options?)` - Show reply notification

## Integration with Electron

### Main Process

```typescript
import { app, ipcMain } from 'electron';
import { ElectronNotificationManager } from '@your-org/electron-notifications';

const notifications = new ElectronNotificationManager();

// Handle IPC requests
ipcMain.handle('show-notification', async (event, type, title, message, options) => {
  return await notifications[type](title, message, options);
});

ipcMain.on('update-progress', (event, id, progress) => {
  notifications.updateProgress(id, progress);
});
```

### Preload Script

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (type, title, message, options) => 
    ipcRenderer.invoke('show-notification', type, title, message, options),
  updateProgress: (id, progress) => 
    ipcRenderer.send('update-progress', id, progress)
});
```

### Renderer Process

```typescript
// Show notification from renderer
await window.electronAPI.showNotification('success', 'Done!', 'Task completed successfully');
```

## Development

### Building the Package

```bash
npm run build
```

### Publishing

```bash
npm publish
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Changelog

### 1.0.0
- Initial release
- Unified notification system
- Support for basic, progress, and reply notifications
- Cross-platform themes
- Dark mode support
- TypeScript definitions