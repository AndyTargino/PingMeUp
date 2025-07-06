export type NotificationType = 
  // Basic types
  | 'info' | 'success' | 'warning' | 'error' | 'custom'
  // Interactive types
  | 'progress' | 'reply' | 'confirmation' | 'input'
  // Advanced types
  | 'achievement' | 'update' | 'download' | 'upload'
  | 'system' | 'security' | 'reminder' | 'calendar'
  // Creative types
  | 'loading' | 'celebration' | 'weather' | 'notification'
  | 'alert' | 'tip' | 'news' | 'promotional';

export type NotificationTheme = 'windows' | 'macos' | 'linux' | 'custom';

export type ColorScheme = 'light' | 'dark' | 'auto';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export type NotificationPosition = 
  | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  | 'top-center' | 'bottom-center' | 'center';

export type AnimationType = 
  | 'slide' | 'fade' | 'bounce' | 'zoom' | 'flip' | 'none';

export type SoundType = 
  | 'default' | 'success' | 'error' | 'warning' | 'info'
  | 'custom' | 'none';

export interface NotificationAction {
  id: string;
  label: string;
  type?: 'primary' | 'secondary' | 'danger';
  icon?: string;
  callback?: () => void;
}

export interface NotificationSound {
  type: SoundType;
  volume?: number; // 0-1
  customPath?: string;
}

export interface NotificationBadge {
  count?: number;
  color?: string;
  icon?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface BaseNotificationData {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  subtitle?: string;
  icon?: string;
  image?: string; // For rich notifications
  timestamp?: string;
  duration?: number;
  fixed?: boolean;
  persistent?: boolean; // Survives app restart
  priority?: NotificationPriority;
  theme?: NotificationTheme;
  colorScheme?: ColorScheme;
  animation?: AnimationType;
  sound?: NotificationSound;
  badge?: NotificationBadge;
  actions?: NotificationAction[];
  category?: string; // For grouping
  tag?: string; // For replacing notifications
  requireInteraction?: boolean; // Must be manually dismissed
  silent?: boolean; // No sound
  renotify?: boolean; // Vibrate/sound again if replacing
  data?: any; // Custom payload
  processed_by?: string;
}

export interface ProgressNotificationData extends BaseNotificationData {
  type: 'progress' | 'download' | 'upload' | 'loading';
  progress?: number;
  progressText?: string;
  indeterminate?: boolean; // Spinning progress
  showCancel?: boolean;
  showPause?: boolean;
  speed?: string; // e.g., "1.2 MB/s"
  timeRemaining?: string; // e.g., "2 minutes remaining"
}

export interface ReplyNotificationData extends BaseNotificationData {
  type: 'reply' | 'input';
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  inputType?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  validation?: RegExp;
}

export interface ConfirmationNotificationData extends BaseNotificationData {
  type: 'confirmation';
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean; // Red confirm button for dangerous actions
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface AchievementNotificationData extends BaseNotificationData {
  type: 'achievement' | 'celebration';
  level?: string;
  points?: number;
  showConfetti?: boolean;
  gradient?: boolean;
}

export interface UpdateNotificationData extends BaseNotificationData {
  type: 'update' | 'system';
  version?: string;
  changelogUrl?: string;
  mandatory?: boolean;
  downloadUrl?: string;
}

export interface ReminderNotificationData extends BaseNotificationData {
  type: 'reminder' | 'calendar';
  dueDate?: Date;
  snoozeOptions?: number[]; // Minutes to snooze
  location?: string;
  attendees?: string[];
}

export interface WeatherNotificationData extends BaseNotificationData {
  type: 'weather';
  temperature?: string;
  condition?: string;
  humidity?: string;
  location?: string;
  forecast?: string;
}

export type NotificationData = 
  | BaseNotificationData 
  | ProgressNotificationData 
  | ReplyNotificationData
  | ConfirmationNotificationData
  | AchievementNotificationData
  | UpdateNotificationData
  | ReminderNotificationData
  | WeatherNotificationData;

export interface NotificationConfig {
  width?: number;
  height?: number;
  spacing?: number;
  maxVisible?: number;
  defaultDuration?: number;
  theme?: NotificationTheme;
  position?: NotificationPosition;
  animation?: AnimationType;
  sound?: NotificationSound;
  persistent?: boolean;
  showInTaskbar?: boolean;
  enableBadges?: boolean;
  enableGrouping?: boolean;
  enableQueueing?: boolean;
  clickToClose?: boolean;
  dragToClose?: boolean;
  autoHideOnHover?: boolean;
  enableRichNotifications?: boolean;
}

export interface NotificationWindow {
  id: string;
  window: any; // BrowserWindow
  data: NotificationData;
  height: number;
  type: NotificationType;
  priority: NotificationPriority;
  createdAt: Date;
  lastShown: Date;
  interactionCount: number;
}

export interface NotificationGroup {
  category: string;
  notifications: NotificationWindow[];
  collapsed: boolean;
  badge?: NotificationBadge;
}

export interface NotificationQueue {
  high: NotificationData[];
  normal: NotificationData[];
  low: NotificationData[];
  critical: NotificationData[];
}

export interface NotificationStats {
  total: number;
  shown: number;
  dismissed: number;
  clicked: number;
  averageDisplayTime: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

export interface NotificationManager {
  // Core methods
  create(data: NotificationData): Promise<string>;
  update(id: string, data: Partial<NotificationData>): Promise<boolean>;
  close(id: string): Promise<boolean>;
  closeAll(): Promise<void>;
  closeByCategory(category: string): Promise<void>;
  closeByType(type: NotificationType): Promise<void>;
  
  // Progress methods
  updateProgress(id: string, progress: number): void;
  setProgressIndeterminate(id: string, indeterminate: boolean): void;
  
  // Queue methods
  queueNotification(data: NotificationData): Promise<string>;
  processQueue(): Promise<void>;
  clearQueue(): void;
  
  // Group methods
  createGroup(category: string): void;
  collapseGroup(category: string): void;
  expandGroup(category: string): void;
  
  // State methods
  getActive(): NotificationWindow[];
  getByCategory(category: string): NotificationWindow[];
  getStats(): NotificationStats;
  
  // Configuration
  updateConfig(config: Partial<NotificationConfig>): void;
  getConfig(): NotificationConfig;
  
  // Events
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  emit(event: string, ...args: any[]): void;
}