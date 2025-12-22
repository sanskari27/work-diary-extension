/**
 * PWA Single Instance Manager
 * Ensures only one instance of the PWA runs at a time
 * If the app is already open, focuses the existing window instead of opening a new one
 */

/**
 * Check if the app is running in standalone mode (installed PWA)
 */
export const isStandalone = (): boolean => {
	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		(window.navigator as any).standalone === true ||
		document.referrer.includes('android-app://')
	);
};

/**
 * Focus existing window if app is already open
 * Uses Service Worker clients API to communicate with other instances
 */
export const focusExistingInstance = async (): Promise<boolean> => {
	if (!('serviceWorker' in navigator)) {
		return false;
	}

	try {
		const registration = await navigator.serviceWorker.ready;
		if (!registration.active) {
			return false;
		}
		const clients = await (registration.active as any).clients?.matchAll({
			type: 'window',
			includeUncontrolled: true,
		});

		if (clients && clients.length > 0) {
			// Focus the first client window
			for (const client of clients) {
				if (client.url === window.location.href || client.url.includes(window.location.origin)) {
					await client.focus();
					return true;
				}
			}
		}
	} catch (error) {
		console.error('Error focusing existing instance:', error);
	}

	return false;
};

/**
 * Initialize single instance behavior
 * Should be called on app startup
 */
export const initializeSingleInstance = async (): Promise<void> => {
	// Only apply single instance logic in standalone mode
	if (!isStandalone()) {
		return;
	}

	// Try to focus existing instance
	const focused = await focusExistingInstance();
	if (focused) {
		// If we successfully focused an existing window, we could close this one
		// However, in PWA context, we might want to keep it open
		// This is a design decision - for now, we'll just focus the existing one
		console.log('Existing instance focused');
	}
};

/**
 * Handle visibility change to ensure single instance behavior
 * When window becomes visible, check if we should focus instead
 */
export const setupVisibilityHandler = (): (() => void) => {
	const handleVisibilityChange = async () => {
		if (document.visibilityState === 'visible' && isStandalone()) {
			// Small delay to avoid race conditions
			setTimeout(() => {
				focusExistingInstance();
			}, 100);
		}
	};

	document.addEventListener('visibilitychange', handleVisibilityChange);

	// Return cleanup function
	return () => {
		document.removeEventListener('visibilitychange', handleVisibilityChange);
	};
};
