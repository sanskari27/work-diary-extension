/**
 * Date utility functions for handling date operations across the application
 */

/**
 * Check if a date is in the current month and year
 */
export const isDateInCurrentMonth = (dateString: string): boolean => {
	const date = new Date(dateString);
	const now = new Date();
	return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

/**
 * Check if a date is today or in the future
 */
export const isFutureOrToday = (dateString: string): boolean => {
	const date = new Date(dateString);
	const now = new Date();

	// Reset time to start of day for accurate comparison
	const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	return dateStart >= todayStart;
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (dateString: string): boolean => {
	return !isFutureOrToday(dateString);
};

/**
 * Format a date string to a readable format (e.g., "Dec 8, 2025")
 */
export const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

/**
 * Format a reminder delta string to a human-readable format
 * @param delta - A string like "1d", "7d", "14d", "30d"
 * @returns A formatted string like "1 day", "1 week", "2 weeks", "1 month"
 */
export const formatReminderDelta = (delta?: string): string => {
	if (!delta) return '';

	const value = parseInt(delta.slice(0, -1));

	if (value === 1) return '1 day';
	if (value === 7) return '1 week';
	if (value === 14) return '2 weeks';
	if (value === 21) return '3 weeks';
	if (value === 30) return '1 month';

	return `${value} days`;
};

/**
 * Get the start of today (midnight) as a Date object
 */
export const getTodayStart = (): Date => {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * Get the start of a given date (midnight) as a Date object
 */
export const getDateStart = (dateString: string): Date => {
	const date = new Date(dateString);
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Get current year
 */
export const getCurrentYear = (): number => {
	return new Date().getFullYear();
};

/**
 * Get current month (0-11)
 */
export const getCurrentMonth = (): number => {
	return new Date().getMonth();
};
