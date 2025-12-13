import { RootState } from '@/store/store';
import { Store } from '@reduxjs/toolkit';

/**
 * Service to manage browser notifications at 12:00 PM
 * Shows notifications once per day for active reminders
 */
export class BrowserNotificationService {
	private store: Store<RootState>;
	private checkInterval: number | null = null;
	private dailyCheckTimeout: number | null = null;

	constructor(store: Store<RootState>) {
		this.store = store;
	}

	/**
	 * Initialize the service - sets up 12:00 PM check
	 */
	public initialize() {
		// Request notification permission if not already granted
		BrowserNotificationService.requestNotificationPermission();

		// Set up the 12:00 PM check
		this.scheduleDailyCheck();

		// Check every minute to see if we've reached 12:00 PM
		this.checkInterval = window.setInterval(() => {
			this.checkAndShowNotifications();
		}, 60000); // Check every minute

		// Also check immediately in case we're already past 12:00 PM
		this.checkAndShowNotifications();
	}

	/**
	 * Request browser notification permission
	 */
	public static async requestNotificationPermission() {
		if ('Notification' in window && Notification.permission === 'default') {
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
	 * Schedule the daily check at 12:00 PM
	 */
	private scheduleDailyCheck() {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const noon = new Date(today);
		noon.setHours(12, 0, 0, 0);

		// If 12:00 PM has already passed today, schedule for tomorrow
		if (now >= noon) {
			noon.setDate(noon.getDate() + 1);
		}

		const msUntilNoon = noon.getTime() - now.getTime();

		// Clear any existing timeout
		if (this.dailyCheckTimeout !== null) {
			window.clearTimeout(this.dailyCheckTimeout);
		}

		// Set timeout to check at 12:00 PM
		this.dailyCheckTimeout = window.setTimeout(() => {
			this.checkAndShowNotifications();
			// Schedule next day's check
			this.scheduleDailyCheck();
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

		// Check if notifications are supported
		if (!('Notification' in window)) {
			return;
		}

		// Check if permission is granted
		if (Notification.permission !== 'granted') {
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
		const hasShownToday = this.hasShownNotificationsToday(today);
		if (hasShownToday) {
			return;
		}

		// Get all current notifications from the store
		const notifications = state.ui.notifications;

		if (notifications.length === 0) {
			return;
		}

		// Show browser notifications for each notification
		notifications.forEach((notification) => {
			this.showBrowserNotification(notification.message);
		});

		// Mark that we've shown notifications today
		this.markNotificationsShownToday(today);
	}

	/**
	 * Show a browser notification
	 */
	private showBrowserNotification(message: string) {
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
	 */
	private hasShownNotificationsToday(today: string): boolean {
		try {
			const key = `browserNotificationsShown_${today}`;
			const stored = localStorage.getItem(key);
			return stored === 'true';
		} catch (error) {
			console.error('Error reading shown notifications from localStorage:', error);
			return false;
		}
	}

	/**
	 * Mark that notifications have been shown today
	 */
	private markNotificationsShownToday(today: string) {
		try {
			const key = `browserNotificationsShown_${today}`;
			localStorage.setItem(key, 'true');

			// Clean up old entries (older than 7 days)
			this.cleanupOldEntries();
		} catch (error) {
			console.error('Error saving shown notification to localStorage:', error);
		}
	}

	/**
	 * Clean up localStorage entries older than 7 days
	 */
	private cleanupOldEntries() {
		try {
			const keysToRemove: string[] = [];
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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
	 * Cleanup intervals and timeouts
	 */
	public cleanup() {
		if (this.checkInterval !== null) {
			window.clearInterval(this.checkInterval);
			this.checkInterval = null;
		}
		if (this.dailyCheckTimeout !== null) {
			window.clearTimeout(this.dailyCheckTimeout);
			this.dailyCheckTimeout = null;
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
