import { useEffect, useRef } from 'react';

export interface UseAutoRefreshOptions {
	/**
	 * Interval in minutes between callback executions
	 */
	minutes: number;
	/**
	 * Callback function to execute at the specified interval
	 */
	callback: () => void | Promise<void>;
	/**
	 * Whether to pause when the page/tab is hidden (default: true)
	 */
	pauseOnHidden?: boolean;
	/**
	 * Whether to call the callback immediately on mount (default: true)
	 */
	immediate?: boolean;
	/**
	 * Whether the hook is enabled (default: true)
	 */
	enabled?: boolean;
}

/**
 * Hook that automatically calls a callback function at a specified interval (in minutes).
 * Handles component unmounting, page visibility changes, and other edge cases.
 *
 * @param options - Configuration options for the auto-refresh hook
 * @example
 * ```tsx
 * useAutoRefresh({
 *   minutes: 5,
 *   callback: async () => {
 *     await fetchData();
 *   }
 * });
 * ```
 */
export const useAutoRefresh = ({
	minutes,
	callback,
	pauseOnHidden = true,
	immediate = true,
	enabled = true,
}: UseAutoRefreshOptions) => {
	const intervalRef = useRef<number | null>(null);
	const timeoutRef = useRef<number | null>(null);
	const callbackRef = useRef(callback);
	const isPageVisibleRef = useRef(true);

	// Keep callback ref up to date
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	// Handle page visibility changes
	useEffect(() => {
		if (!pauseOnHidden || !enabled) return;

		const handleVisibilityChange = () => {
			const isVisible = !document.hidden;
			isPageVisibleRef.current = isVisible;

			// If page becomes visible and we have a valid interval, restart the timer
			if (isVisible && minutes > 0) {
				// Clear any existing timers
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
					timeoutRef.current = null;
				}

				// Restart the refresh cycle
				const executeCallback = async () => {
					try {
						await callbackRef.current();
					} catch (error) {
						console.error('Error in useAutoRefresh callback:', error);
					}
				};

				// Execute immediately when page becomes visible
				executeCallback();

				// Set up interval
				const intervalMs = minutes * 60 * 1000;
				intervalRef.current = setInterval(executeCallback, intervalMs);
			} else if (!isVisible) {
				// Page is hidden, clear timers
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
					timeoutRef.current = null;
				}
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [minutes, pauseOnHidden, enabled]);

	// Main effect to set up the auto-refresh
	useEffect(() => {
		// Validate inputs
		if (!enabled || minutes <= 0 || !Number.isFinite(minutes)) {
			// Clear any existing timers if disabled or invalid
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			return;
		}

		// Don't set up if page is hidden and we're pausing on hidden
		if (pauseOnHidden && document.hidden) {
			return;
		}

		const executeCallback = async () => {
			try {
				await callbackRef.current();
			} catch (error) {
				console.error('Error in useAutoRefresh callback:', error);
			}
		};

		// Execute immediately if requested
		if (immediate) {
			executeCallback();
		}

		// Set up interval
		const intervalMs = minutes * 60 * 1000;

		// Use setTimeout for the first execution if immediate is false
		// This ensures we wait the full interval before the first call
		if (!immediate) {
			timeoutRef.current = setTimeout(() => {
				executeCallback();
				// After the first timeout, switch to interval
				intervalRef.current = setInterval(executeCallback, intervalMs);
			}, intervalMs);
		} else {
			// If immediate is true, start the interval right away
			intervalRef.current = setInterval(executeCallback, intervalMs);
		}

		// Cleanup function
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [minutes, immediate, enabled, pauseOnHidden]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, []);
};

export default useAutoRefresh;
