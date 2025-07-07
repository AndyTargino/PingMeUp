# PingMeUp 🔔

Professional notification system for Electron applications with native OS-like experience.

## Features

- 🎨 **Native-like design** - Matches Windows, macOS, and Linux notification styles
- ⚡ **Simple API** - Easy to use with minimal configuration
- 🎯 **Multiple types** - Info, success, warning, error notifications
- ⏱️ **Customizable duration** - 5-second default, customizable, or persistent notifications
- 🎨 **Theme support** - Light/dark themes with automatic system detection
- 📍 **Positioning** - Top/bottom, left/right positioning options
- 🔍 **Real-time debugging** - Comprehensive console logging for troubleshooting
- 🏗️ **TypeScript support** - Full type definitions included

## Installation

```bash
npm install pingmeup
# or
yarn add pingmeup
```

## Quick Start

```javascript
const { ElectronNotificationManager } = require('pingmeup');

// Initialize the notification manager
const notificationManager = new ElectronNotificationManager();

// Show different types of notifications
await notificationManager.info('Hello!', 'This is an info notification');
await notificationManager.success('Success!', 'Operation completed');
await notificationManager.warning('Warning!', 'Something needs attention');
await notificationManager.error('Error!', 'Something went wrong');
```

## API Reference

### Constructor

```javascript
const notificationManager = new ElectronNotificationManager(defaultOptions);
```

**Default Options:**
- `type`: `'info'` - Default notification type
- `duration`: `5000` - Default duration in milliseconds (0 = no auto-close)
- `theme`: Auto-detected system theme (`'light'` | `'dark'` | `'windows'` | `'macos'` | `'linux'`)
- `clickToClose`: `true` - Allow click to close
- `position`: `'top-right'` - Default position

### Methods

#### `show(options)` - Show Custom Notification

```javascript
const id = await notificationManager.show({
  title: 'Custom Title',
  message: 'Custom message',
  type: 'info', // 'info' | 'success' | 'warning' | 'error'
  duration: 5000, // milliseconds, 0 = no auto-close
  icon: '🔔', // Custom emoji or icon
  theme: 'dark', // 'light' | 'dark' | 'windows' | 'macos' | 'linux'
  clickToClose: true,
  position: 'top-right' // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
});
```

#### Convenience Methods

```javascript
// Info notification (5 seconds)
await notificationManager.info(title, message, duration?);

// Success notification (5 seconds)
await notificationManager.success(title, message, duration?);

// Warning notification (7 seconds)
await notificationManager.warning(title, message, duration?);

// Error notification (no auto-close)
await notificationManager.error(title, message, duration?);
```

#### Management Methods

```javascript
// Close specific notification
notificationManager.close(id);

// Close all notifications
notificationManager.closeAll();

// Get active notification count
const count = notificationManager.getActiveCount();
```

## Examples

### Basic Usage

```javascript
const { app, BrowserWindow } = require('electron');
const { ElectronNotificationManager } = require('pingmeup');

let notificationManager;

app.whenReady().then(() => {
  // Initialize with custom defaults
  notificationManager = new ElectronNotificationManager({
    theme: 'windows',
    position: 'top-right',
    duration: 4000
  });

  // Show welcome notification
  notificationManager.info(
    'Welcome!', 
    'Application started successfully'
  );
});
```

### Advanced Usage

```javascript
// Long-running operation with progress
const id = await notificationManager.show({
  title: 'Processing...',
  message: 'This may take a while',
  type: 'info',
  duration: 0, // Don't auto-close
  clickToClose: false
});

// Update notification when done
setTimeout(() => {
  notificationManager.close(id);
  notificationManager.success('Done!', 'Processing completed');
}, 5000);
```

### Different Themes

```javascript
// Windows style
notificationManager.show({
  title: 'Windows Style',
  message: 'Square corners, Segoe UI font',
  theme: 'windows'
});

// macOS style  
notificationManager.show({
  title: 'macOS Style',
  message: 'Rounded corners, SF Pro font',
  theme: 'macos'
});

// Linux style
notificationManager.show({
  title: 'Linux Style',
  message: 'Ubuntu font, moderate rounding',
  theme: 'linux'
});
```

## Debugging

All operations are logged to the console with prefixed tags:

```
[NOTIFICATION MANAGER] Initialized with defaults: {...}
[NOTIFICATION MANAGER] Creating notification notification-1: {...}
[NOTIFICATION notification-1] Template loaded successfully
[NOTIFICATION notification-1] Setting up notification with data: {...}
[NOTIFICATION notification-1] Auto-close set for 5000ms
```

## Error Handling

The system includes comprehensive error handling:

```javascript
try {
  await notificationManager.show({
    title: 'Test',
    message: 'Test message'
  });
} catch (error) {
  console.error('Failed to show notification:', error);
}
```

## Testing

Run the included example to test the notification system:

```bash
cd example
node simple-test.js
```

This will show various notification types with different durations and settings.

## Requirements

- Electron 20.0.0 or higher
- Node.js 16.0.0 or higher

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues and questions:
- 🐛 [Report bugs](https://github.com/andytargino/pingmeup/issues)
- 💬 [Discussions](https://github.com/andytargino/pingmeup/discussions)
- 📧 Email: andytargino@outlook.com