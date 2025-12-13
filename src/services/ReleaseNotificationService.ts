import { markReleaseAsArchived, ReleaseEvent } from '@/store/slices/releasesSlice';
import { addNotification, clearNotifications } from '@/store/slices/uiSlice';
import { RootState } from '@/store/store';
import { Store } from '@reduxjs/toolkit';

/**
 * Service to manage release notifications and archiving
 * This service runs once on app initialization and does not persist to IndexedDB
 */
export class ReleaseNotificationService {
	private static hasRun = false;
	private store: Store<RootState>;

	constructor(store: Store<RootState>) {
		this.store = store;
	}

	/**
	 * Initialize the service - runs all checks and updates
	 * This should be called once when the app loads
	 */
	public initialize() {
		// Ensure this only runs once per page load
		if (ReleaseNotificationService.hasRun) {
			return;
		}

		ReleaseNotificationService.hasRun = true;

		// Clear any existing notifications from previous session
		this.store.dispatch(clearNotifications());

		// Process releases
		this.archiveOldReleases();
		this.checkAndPopulateNotifications();
	}

	/**
	 * Archive releases that are older than 30 days
	 */
	private archiveOldReleases() {
		const state = this.store.getState();
		const events = state.releases.events;
		const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

		events.forEach((event) => {
			// Skip already archived events
			if (event.isArchived) {
				return;
			}

			const releaseDate = new Date(event.date).getTime();

			// If release date is older than 30 days, mark as archived
			if (releaseDate < thirtyDaysAgo) {
				this.store.dispatch(markReleaseAsArchived(event.id));
			}
		});
	}

	/**
	 * Check active releases for scheduled notifications and populate them
	 */
	private checkAndPopulateNotifications() {
		const state = this.store.getState();
		const events = state.releases.events;
		const now = Date.now();

		// Filter active (non-archived) releases with reminders enabled
		const activeEventsWithReminders = events.filter(
			(event) => !event.isArchived && event.reminderEnabled && event.reminderDelta
		);

		activeEventsWithReminders.forEach((event) => {
			const notification = this.calculateNotification(event, now);
			if (notification) {
				this.store.dispatch(addNotification(notification));
			}
		});
	}

	/**
	 * Calculate if a notification should be shown for a release event
	 */
	private calculateNotification(
		event: ReleaseEvent,
		now: number
	): { message: string; type: 'info' | 'success' | 'warning' | 'error' } | null {
		if (!event.reminderDelta) {
			return null;
		}

		const releaseDate = new Date(event.date).getTime();
		const reminderTime = this.calculateReminderTime(releaseDate, event.reminderDelta);

		// Check if we should show a notification
		// Show if current time is past the reminder time but before the release date
		if (now >= reminderTime && now < releaseDate) {
			const timeUntilRelease = releaseDate - now;
			const daysUntilRelease = Math.ceil(timeUntilRelease / (24 * 60 * 60 * 1000));
			const hoursUntilRelease = Math.ceil(timeUntilRelease / (60 * 60 * 1000));

			let message: string;
			let type: 'info' | 'success' | 'warning' | 'error' = 'info';

			if (daysUntilRelease <= 1) {
				// Less than 1 day - urgent warning
				if (hoursUntilRelease <= 1) {
					message = `⚠️ Release "${event.title}" is in less than 1 hour!`;
					type = 'error';
				} else {
					message = `⚠️ Release "${event.title}" is today in ${hoursUntilRelease} hours!`;
					type = 'warning';
				}
			} else if (daysUntilRelease <= 3) {
				// 1-3 days - warning
				message = `📅 Upcoming release "${event.title}" in ${daysUntilRelease} days`;
				type = 'warning';
			} else {
				// More than 3 days - info
				message = `📅 Reminder: Release "${event.title}" scheduled in ${daysUntilRelease} days`;
				type = 'info';
			}

			return { message, type };
		}

		// Check if release date has passed (overdue)
		if (now >= releaseDate) {
			const timeSinceRelease = now - releaseDate;
			const daysSinceRelease = Math.floor(timeSinceRelease / (24 * 60 * 60 * 1000));

			if (daysSinceRelease === 0) {
				return {
					message: `🚀 Release "${event.title}" is happening today!`,
					type: 'success',
				};
			} else if (daysSinceRelease <= 7) {
				// Show for up to 7 days after release
				return {
					message: `Release "${event.title}" was ${daysSinceRelease} day${
						daysSinceRelease > 1 ? 's' : ''
					} ago - check status`,
					type: 'info',
				};
			}
		}

		return null;
	}

	/**
	 * Calculate the reminder time based on release date and delta
	 * Delta format examples: "1 day", "2 days", "1 week", "3 hours"
	 */
	private calculateReminderTime(releaseDate: number, reminderDelta: string): number {
		// Divide the string into numeric (amount) and text (unit) parts
		const match = reminderDelta.toLowerCase().trim().match(/^(\d+)\s*([a-zA-Z]+)$/);
		if (!match) {
			// Invalid format, default to 1 day before
			return releaseDate - 24 * 60 * 60 * 1000;
		}
		const amount = parseInt(match[1], 10);
		const unit = match[2];

		if (isNaN(amount)) {
			// Invalid amount, default to 1 day before
			return releaseDate - 24 * 60 * 60 * 1000;
		}

		let milliseconds = 0;

		// Parse unit (handle both singular and plural)
		if (unit.startsWith('hour') || unit.startsWith('h')) {
			milliseconds = amount * 60 * 60 * 1000;
		} else if (unit.startsWith('day') || unit.startsWith('d')) {
			milliseconds = amount * 24 * 60 * 60 * 1000;
		} else if (unit.startsWith('week') || unit.startsWith('w')) {
			milliseconds = amount * 7 * 24 * 60 * 60 * 1000;
		} else if (unit.startsWith('minute') || unit.startsWith('m')) {
			milliseconds = amount * 60 * 1000;
		} else {
			// Unknown unit, default to 1 day before
			return releaseDate - 24 * 60 * 60 * 1000;
		}

		// Return the time to trigger the reminder (release time minus delta)
		return releaseDate - milliseconds;
	}

	/**
	 * Reset the service state (useful for testing or re-initialization)
	 */
	public static reset() {
		ReleaseNotificationService.hasRun = false;
	}
}

/**
 * Initialize the release notification service
 * Call this once after the store is created
 */
export function initializeReleaseNotifications(store: Store<RootState>) {
	const service = new ReleaseNotificationService(store);
	service.initialize();
}
