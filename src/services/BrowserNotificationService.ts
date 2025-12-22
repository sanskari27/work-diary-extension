import { RootState } from '@/store/store';
import { Store } from '@reduxjs/toolkit';

/**
 * Service to manage browser notifications at 12:00 PM
 * Shows notifications once per day for active reminders
 * Uses Chrome Notifications API and Alarms API to work even when extension is closed
 */
export class BrowserNotificationService {
	private store: Store<RootState>;
	private unsubscribe: (() => void) | null = null;

	constructor(store: Store<RootState>) {
		this.store = store;
	}

	/**
	 * Initialize the service - sets up 12:00 PM check using Chrome Alarms
	 */
	public initialize() {
		// Request notification permission if not already granted
		BrowserNotificationService.requestNotificationPermission();

		// Sync state to chrome.storage so background worker can access it
		this.syncStateToChromeStorage();

		// Subscribe to store changes to keep chrome.storage in sync
		this.unsubscribe = this.store.subscribe(() => {
			this.syncStateToChromeStorage();
		});

		// Schedule the daily check using Chrome Alarms (works even when extension is closed)
		this.scheduleDailyCheck();

		// Also check immediately in case we're already past 12:00 PM
		this.checkAndShowNotifications();
	}

	/**
	 * Request Chrome notification permission
	 */
	public static async requestNotificationPermission() {
		// Chrome extensions with "notifications" permission don't need explicit permission request
		// The permission is granted automatically when the extension is installed
		// However, we can check if chrome.notifications is available
		if (typeof chrome !== 'undefined' && chrome.notifications) {
			// Permission is automatically granted with manifest permission
			console.log('Chrome notifications API available');
		} else if ('Notification' in window && Notification.permission === 'default') {
			// Fallback to standard Notification API if chrome.notifications is not available
			try {
				setTimeout(async () => {
					await Notification.requestPermission();
				}, 1000);
			} catch (error) {
				console.error('Error requesting notification permission:', error);
			}
		}
	}

	/**
	 * Sync relevant state to chrome.storage.local for background worker access
	 */
	private syncStateToChromeStorage() {
		if (typeof chrome === 'undefined' || !chrome.storage) {
			return;
		}

		const state = this.store.getState();
		const dataToSync = {
			reminderPreferences: state.settings.reminderPreferences,
			notifications: state.ui.notifications,
		};

		chrome.storage.local.set(dataToSync, () => {
			if (chrome.runtime.lastError) {
				console.error('Error syncing state to chrome.storage:', chrome.runtime.lastError);
			}
		});
	}

	/**
	 * Schedule the daily check at 12:00 PM using Chrome Alarms API
	 * This works even when the extension is closed
	 */
	private scheduleDailyCheck() {
		if (typeof chrome === 'undefined' || !chrome.alarms) {
			// Fallback to setTimeout if chrome.alarms is not available
			this.scheduleDailyCheckFallback();
			return;
		}

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const noon = new Date(today);
		noon.setHours(12, 0, 0, 0);

		// If 12:00 PM has already passed today, schedule for tomorrow
		if (now >= noon) {
			noon.setDate(noon.getDate() + 1);
		}

		// Clear any existing alarm
		chrome.alarms.clear('daily-reminder-check', () => {
			// Create a one-time alarm for 12:00 PM
			chrome.alarms.create('daily-reminder-check', {
				when: noon.getTime(),
			});

			// Also send message to background worker to schedule
			if (chrome.runtime && chrome.runtime.sendMessage) {
				chrome.runtime.sendMessage({ type: 'SCHEDULE_DAILY_CHECK' });
			}
		});
	}

	/**
	 * Fallback scheduling using setTimeout (for non-extension contexts)
	 */
	private scheduleDailyCheckFallback() {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const noon = new Date(today);
		noon.setHours(12, 0, 0, 0);

		if (now >= noon) {
			noon.setDate(noon.getDate() + 1);
		}

		const msUntilNoon = noon.getTime() - now.getTime();

		setTimeout(() => {
			this.checkAndShowNotifications();
			this.scheduleDailyCheckFallback();
		}, msUntilNoon);
	}

	/**
	 * Check if it's 12:00 PM and show notifications if enabled
	 */
	private checkAndShowNotifications() {
		const state = this.store.getState();
		const { enableBrowserNotification } = state.settings.reminderPreferences;

		// Only proceed if browser notifications are enabled
		if (!enableBrowserNotification) {
			return;
		}

		// Check if it's 12:00 PM (within a 1-minute window)
		const now = new Date();
		const currentHour = now.getHours();
		const currentMinute = now.getMinutes();

		// Only show notifications after 12:00 PM
		if (currentHour < 12 || (currentHour === 12 && currentMinute < 1)) {
			return;
		}

		// Get today's date string for tracking
		const today = this.getTodayDateString();

		// Check if we've already shown notifications today
		this.hasShownNotificationsToday(today).then((hasShownToday) => {
			if (hasShownToday) {
				return;
			}

			// Get all current notifications from the store
			const notifications = state.ui.notifications;

			if (notifications.length === 0) {
				return;
			}

			// Show browser notifications for each notification
			notifications.forEach((notification, index) => {
				setTimeout(() => {
					this.showBrowserNotification(notification.message, index);
				}, index * 500); // Stagger notifications by 500ms
			});

			// Mark that we've shown notifications today
			this.markNotificationsShownToday(today);
		});
	}

	/**
	 * Show a browser notification using Chrome Notifications API
	 */
	private showBrowserNotification(message: string, _index: number) {
		// Prefer Chrome Notifications API (works even when extension is closed)
		if (typeof chrome !== 'undefined' && chrome.notifications) {
			chrome.notifications.create(
				{
					type: 'basic',
					iconUrl: chrome.runtime.getURL('icon-128.png'),
					title: 'Release Reminder',
					message: message,
					priority: 1,
				},
				(_notificationId) => {
					if (chrome.runtime.lastError) {
						console.error('Error showing Chrome notification:', chrome.runtime.lastError);
						// Fallback to standard Notification API
						this.showBrowserNotificationFallback(message);
					}
				}
			);
		} else {
			// Fallback to standard Notification API
			this.showBrowserNotificationFallback(message);
		}
	}

	/**
	 * Fallback to standard Notification API
	 */
	private showBrowserNotificationFallback(message: string) {
		if (!('Notification' in window) || Notification.permission !== 'granted') {
			return;
		}

		// Determine icon
		const icon = '/favicon.ico'; // Default icon
		const options: NotificationOptions = {
			body: message,
			icon: icon,
			badge: icon,
			tag: `reminder-${Date.now()}`, // Unique tag to prevent duplicate notifications
			requireInteraction: false,
		};

		try {
			new Notification('Release Reminder', options);
		} catch (error) {
			console.error('Error showing browser notification:', error);
		}
	}

	/**
	 * Get today's date string in YYYY-MM-DD format
	 */
	private getTodayDateString(): string {
		const today = new Date();
		return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
			today.getDate()
		).padStart(2, '0')}`;
	}

	/**
	 * Check if notifications have been shown today
	 * Uses chrome.storage for extension context, falls back to localStorage
	 */
	private async hasShownNotificationsToday(today: string): Promise<boolean> {
		const key = `browserNotificationsShown_${today}`;

		// Prefer chrome.storage (accessible by background worker)
		if (typeof chrome !== 'undefined' && chrome.storage) {
			return new Promise((resolve) => {
				chrome.storage.local.get(['browserNotificationsShown'], (data: { [key: string]: any }) => {
					const shownData = (data.browserNotificationsShown || {}) as { [key: string]: boolean };
					resolve(shownData[key] === true);
				});
			});
		}

		// Fallback to localStorage
		try {
			const stored = localStorage.getItem(key);
			return stored === 'true';
		} catch (error) {
			console.error('Error reading shown notifications from localStorage:', error);
			return false;
		}
	}

	/**
	 * Mark that notifications have been shown today
	 * Uses chrome.storage for extension context, falls back to localStorage
	 */
	private markNotificationsShownToday(today: string) {
		const key = `browserNotificationsShown_${today}`;

		// Prefer chrome.storage (accessible by background worker)
		if (typeof chrome !== 'undefined' && chrome.storage) {
			chrome.storage.local.get(['browserNotificationsShown'], (data: { [key: string]: any }) => {
				const shownData = (data.browserNotificationsShown || {}) as { [key: string]: boolean };
				shownData[key] = true;
				chrome.storage.local.set({ browserNotificationsShown: shownData }, () => {
					if (chrome.runtime.lastError) {
						console.error('Error saving to chrome.storage:', chrome.runtime.lastError);
					} else {
						// Clean up old entries (older than 7 days)
						this.cleanupOldEntries();
					}
				});
			});
			return;
		}

		// Fallback to localStorage
		try {
			localStorage.setItem(key, 'true');
			// Clean up old entries (older than 7 days)
			this.cleanupOldEntries();
		} catch (error) {
			console.error('Error saving shown notification to localStorage:', error);
		}
	}

	/**
	 * Clean up old entries older than 7 days
	 * Uses chrome.storage for extension context, falls back to localStorage
	 */
	private cleanupOldEntries() {
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		// Prefer chrome.storage
		if (typeof chrome !== 'undefined' && chrome.storage) {
			chrome.storage.local.get(['browserNotificationsShown'], (data: { [key: string]: any }) => {
				const shownData = (data.browserNotificationsShown || {}) as { [key: string]: boolean };
				const cleanedData: Record<string, boolean> = {};

				Object.keys(shownData).forEach((key) => {
					const dateString = key.replace('browserNotificationsShown_', '');
					const entryDate = new Date(dateString);
					if (entryDate >= sevenDaysAgo) {
						cleanedData[key] = shownData[key];
					}
				});

				chrome.storage.local.set({ browserNotificationsShown: cleanedData });
			});
			return;
		}

		// Fallback to localStorage
		try {
			const keysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith('browserNotificationsShown_')) {
					const dateString = key.replace('browserNotificationsShown_', '');
					const entryDate = new Date(dateString);
					if (entryDate < sevenDaysAgo) {
						keysToRemove.push(key);
					}
				}
			}

			keysToRemove.forEach((key) => localStorage.removeItem(key));
		} catch (error) {
			console.error('Error cleaning up old localStorage entries:', error);
		}
	}

	/**
	 * Cleanup alarms and subscriptions
	 */
	public cleanup() {
		// Unsubscribe from store changes
		if (this.unsubscribe) {
			this.unsubscribe();
			this.unsubscribe = null;
		}

		// Clear Chrome alarms
		if (typeof chrome !== 'undefined' && chrome.alarms) {
			chrome.alarms.clear('daily-reminder-check');
			chrome.alarms.clear('daily-reminder-check-repeating');

			// Notify background worker to clear alarms
			if (chrome.runtime && chrome.runtime.sendMessage) {
				chrome.runtime.sendMessage({ type: 'CLEAR_DAILY_CHECK' });
			}
		}
	}
}

/**
 * Initialize the browser notification service
 * Call this once after the store is created
 */
export function initializeBrowserNotifications(store: Store<RootState>) {
	const service = new BrowserNotificationService(store);
	service.initialize();
	return service;
}
