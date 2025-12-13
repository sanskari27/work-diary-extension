import { getTodoReminderTime } from '@/lib/todoUtils';
import { Todo } from '@/store/slices/todosSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { RootState } from '@/store/store';
import { Store } from '@reduxjs/toolkit';

/**
 * Service to manage todo notifications
 * This service runs once on app initialization and does not persist to IndexedDB
 */
export class TodoNotificationService {
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
		if (TodoNotificationService.hasRun) {
			return;
		}

		TodoNotificationService.hasRun = true;

		// Process todos
		this.checkAndPopulateNotifications();
	}

	/**
	 * Check active todos for scheduled notifications and populate them
	 */
	private checkAndPopulateNotifications() {
		const state = this.store.getState();
		const todos = state.todos.todos;
		const releases = state.releases.events;
		const now = Date.now();

		// Filter active (non-completed) todos with reminders enabled
		const activeTodosWithReminders = todos.filter(
			(todo) => todo.status !== 'completed' && todo.reminderEnabled
		);

		activeTodosWithReminders.forEach((todo) => {
			// Get the linked release if any
			const linkedRelease = todo.linkedReleaseId
				? releases.find((r) => r.id === todo.linkedReleaseId)
				: undefined;

			const notification = this.calculateNotification(todo, now, linkedRelease?.reminderDelta);
			if (notification) {
				this.store.dispatch(addNotification(notification));
			}
		});
	}

	/**
	 * Calculate if a notification should be shown for a todo
	 */
	private calculateNotification(
		todo: Todo,
		now: number,
		linkedReleaseReminderDelta?: string
	): { message: string; type: 'info' | 'success' | 'warning' | 'error' } | null {
		const todoDate = new Date(todo.date);
		todoDate.setHours(9, 0, 0, 0); // Default to 9 AM
		const todoDateTime = todoDate.getTime();
		const reminderTime = getTodoReminderTime(todo, linkedReleaseReminderDelta);

		if (!reminderTime) {
			return null;
		}

		const reminderTimeMs = reminderTime.getTime();

		// Check if we should show a notification
		// Show if current time is past the reminder time but before the todo due time
		if (now >= reminderTimeMs && now < todoDateTime) {
			const timeUntilDue = todoDateTime - now;
			const daysUntilDue = Math.ceil(timeUntilDue / (24 * 60 * 60 * 1000));
			const hoursUntilDue = Math.ceil(timeUntilDue / (60 * 60 * 1000));
			const minutesUntilDue = Math.ceil(timeUntilDue / (60 * 1000));

			let message: string;
			let type: 'info' | 'success' | 'warning' | 'error' = 'info';

			const urgentPrefix = todo.isUrgent ? '🔴 URGENT: ' : '✅ ';

			if (minutesUntilDue <= 15) {
				// Less than 15 minutes - critical
				message = `${urgentPrefix}Todo "${todo.title}" is due in ${minutesUntilDue} minutes!`;
				type = 'error';
			} else if (hoursUntilDue <= 1) {
				// Less than 1 hour - urgent
				message = `${urgentPrefix}Todo "${todo.title}" is due in less than 1 hour!`;
				type = 'error';
			} else if (hoursUntilDue <= 4) {
				// Less than 4 hours - warning
				message = `${urgentPrefix}Todo "${todo.title}" is due in ${hoursUntilDue} hours!`;
				type = 'warning';
			} else if (daysUntilDue <= 1) {
				// Less than 1 day - warning
				message = `${urgentPrefix}Todo "${todo.title}" is due today in ${hoursUntilDue} hours`;
				type = 'warning';
			} else if (daysUntilDue <= 3) {
				// 1-3 days - info/warning based on urgent flag
				message = `${urgentPrefix}Todo "${todo.title}" is due in ${daysUntilDue} days`;
				type = todo.isUrgent ? 'warning' : 'info';
			} else {
				// More than 3 days - info
				message = `${urgentPrefix}Reminder: Todo "${todo.title}" is due in ${daysUntilDue} days`;
				type = 'info';
			}

			return { message, type };
		}

		// Check if todo is overdue
		if (now >= todoDateTime) {
			const timeSinceDue = now - todoDateTime;
			const daysSinceDue = Math.floor(timeSinceDue / (24 * 60 * 60 * 1000));
			const hoursSinceDue = Math.floor(timeSinceDue / (60 * 60 * 1000));

			const overduePrefix = todo.isUrgent ? '🔴 OVERDUE: ' : '⚠️ ';

			if (hoursSinceDue < 24) {
				// Overdue by less than a day
				if (hoursSinceDue === 0) {
					return {
						message: `${overduePrefix}Todo "${todo.title}" is overdue!`,
						type: 'error',
					};
				}
				return {
					message: `${overduePrefix}Todo "${todo.title}" was due ${hoursSinceDue} hours ago`,
					type: 'error',
				};
			} else if (daysSinceDue <= 7) {
				// Overdue by 1-7 days
				return {
					message: `${overduePrefix}Todo "${todo.title}" was due ${daysSinceDue} day${
						daysSinceDue > 1 ? 's' : ''
					} ago`,
					type: 'error',
				};
			}
			// Don't show notifications for todos overdue by more than 7 days
		}

		return null;
	}

	/**
	 * Reset the service state (useful for testing or re-initialization)
	 */
	public static reset() {
		TodoNotificationService.hasRun = false;
	}
}

/**
 * Initialize the todo notification service
 * Call this once after the store is created
 */
export function initializeTodoNotifications(store: Store<RootState>) {
	const service = new TodoNotificationService(store);
	service.initialize();
}
