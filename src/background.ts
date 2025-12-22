/**
 * Background service worker for Chrome extension
 * Handles alarms and notifications even when extension is closed
 */

console.log('Background service worker loading...');

// Verify Chrome APIs are available
if (typeof chrome === 'undefined' || !chrome.alarms || !chrome.notifications || !chrome.storage) {
	console.error('Chrome extension APIs not available');
	throw new Error('Chrome extension APIs not available');
}

console.log('Background service worker initialized');

// Listen for alarm events (scheduled notifications)
chrome.alarms.onAlarm.addListener((alarm) => {
	try {
		if (alarm.name === 'daily-reminder-check' || alarm.name === 'daily-reminder-check-repeating') {
			checkAndShowNotifications();
		}
	} catch (error) {
		console.error('Error handling alarm:', error);
	}
});

/**
 * Check if it's time to show notifications and display them
 */
function checkAndShowNotifications() {
	// Get stored state and check if notifications should be shown
	chrome.storage.local.get(
		['reminderPreferences', 'notifications', 'browserNotificationsShown'],
		(data: { [key: string]: any }) => {
			const preferences = (data.reminderPreferences || {}) as {
				enableBrowserNotification?: boolean;
			};
			const notifications = (data.notifications || []) as Array<{ message: string }>;
			const today = getTodayDateString();
			const shownKey = `browserNotificationsShown_${today}`;

			// Check if browser notifications are enabled
			if (!preferences.enableBrowserNotification) {
				return;
			}

			// Check if we've already shown notifications today
			if (data.browserNotificationsShown?.[shownKey] === true) {
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

			// Show notifications for each active notification
			if (notifications.length > 0) {
				notifications.forEach((notification: { message: string }, index: number) => {
					setTimeout(() => {
						showChromeNotification(notification.message, index);
					}, index * 500); // Stagger notifications by 500ms
				});

				// Mark that we've shown notifications today
				const shownData = (data.browserNotificationsShown || {}) as { [key: string]: boolean };
				shownData[shownKey] = true;
				chrome.storage.local.set({ browserNotificationsShown: shownData }, () => {
					// Clean up old entries after marking
					cleanupOldEntries();
				});
			}
		}
	);
}

/**
 * Show a Chrome notification
 */
function showChromeNotification(message: string, _index: number) {
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
				console.error('Error showing notification:', chrome.runtime.lastError);
			}
		}
	);
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
	const today = new Date();
	return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
		today.getDate()
	).padStart(2, '0')}`;
}

/**
 * Storage helper: Try sync first, fallback to local
 */
async function getStorageData(
	keys: string | string[] | { [key: string]: any } | null
): Promise<any> {
	try {
		// Try sync storage first
		if (chrome.storage.sync) {
			return new Promise((resolve) => {
				chrome.storage.sync!.get(keys, (items: any) => {
					if (chrome.runtime.lastError) {
						// If sync fails, fallback to local
						chrome.storage.local.get(keys, resolve);
					} else {
						resolve(items);
					}
				});
			});
		}
		// Fallback to local if sync is not available
		return new Promise((resolve) => {
			chrome.storage.local.get(keys, resolve);
		});
	} catch (error) {
		console.error('Error getting storage data:', error);
		// Final fallback to local
		return new Promise((resolve) => {
			chrome.storage.local.get(keys, resolve);
		});
	}
}

async function setStorageData(items: { [key: string]: any }): Promise<void> {
	try {
		// Try sync storage first
		if (chrome.storage.sync) {
			return new Promise((resolve, reject) => {
				chrome.storage.sync!.set(items, () => {
					if (chrome.runtime.lastError) {
						// If sync fails (e.g., quota exceeded), fallback to local
						chrome.storage.local.set(items, () => {
							if (chrome.runtime.lastError) {
								reject(new Error(chrome.runtime.lastError.message));
							} else {
								resolve();
							}
						});
					} else {
						resolve();
					}
				});
			});
		}
		// Fallback to local if sync is not available
		return new Promise((resolve, reject) => {
			chrome.storage.local.set(items, () => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
				} else {
					resolve();
				}
			});
		});
	} catch (error) {
		console.error('Error setting storage data:', error);
		// Final fallback to local
		return new Promise((resolve, reject) => {
			chrome.storage.local.set(items, () => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
				} else {
					resolve();
				}
			});
		});
	}
}

async function removeStorageData(keys: string | string[]): Promise<void> {
	try {
		// Remove from both sync and local to ensure cleanup
		const removeFromStorage = (storage: ChromeStorageArea) => {
			return new Promise<void>((resolve) => {
				storage.remove(keys, () => {
					// Ignore errors for cleanup operations
					resolve();
				});
			});
		};

		await Promise.all([
			chrome.storage.sync ? removeFromStorage(chrome.storage.sync!) : Promise.resolve(),
			removeFromStorage(chrome.storage.local),
		]);
	} catch (error) {
		console.error('Error removing storage data:', error);
	}
}

// Listen for messages from the extension pages
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	try {
		if (message.type === 'SCHEDULE_DAILY_CHECK') {
			scheduleDailyCheck();
			sendResponse({ success: true });
		} else if (message.type === 'CLEAR_DAILY_CHECK') {
			chrome.alarms.clear('daily-reminder-check');
			sendResponse({ success: true });
		} else if (message.type === 'IMPORT_BROWSER_BOOKMARKS') {
			// Import bookmarks using the background context (has bookmarks permission)
			if (!chrome.bookmarks || !chrome.bookmarks.getTree) {
				sendResponse({
					success: false,
					error:
						'Browser bookmarks API is not available. Ensure the extension has the "bookmarks" permission.',
				});
				return true;
			}

			chrome.bookmarks.getTree((nodes: ChromeBookmarkTreeNode[]) => {
				try {
					if (chrome.runtime.lastError) {
						throw new Error(
							chrome.runtime.lastError.message || 'Failed to read browser bookmarks.'
						);
					}

					const collected: { title: string; url: string }[] = [];

					const traverse = (node: ChromeBookmarkTreeNode) => {
						if (node.url) {
							collected.push({
								title: node.title || node.url,
								url: node.url,
							});
						}
						if (node.children) {
							node.children.forEach(traverse);
						}
					};

					nodes.forEach(traverse);

					sendResponse({ success: true, bookmarks: collected });
				} catch (error) {
					console.error('Error importing browser bookmarks in background:', error);
					sendResponse({
						success: false,
						error: error instanceof Error ? error.message : 'Failed to import browser bookmarks.',
					});
				}
			});
			return true; // Keep the message channel open for async response
		} else if (message.type === 'STORAGE_GET') {
			// Handle storage get requests
			getStorageData(message.keys)
				.then((data) => {
					sendResponse({ success: true, data });
				})
				.catch((error) => {
					sendResponse({ success: false, error: error.message });
				});
			return true; // Keep the message channel open for async response
		} else if (message.type === 'STORAGE_SET') {
			// Handle storage set requests
			setStorageData(message.items)
				.then(() => {
					sendResponse({ success: true });
				})
				.catch((error) => {
					sendResponse({ success: false, error: error.message });
				});
			return true; // Keep the message channel open for async response
		} else if (message.type === 'STORAGE_REMOVE') {
			// Handle storage remove requests
			removeStorageData(message.keys)
				.then(() => {
					sendResponse({ success: true });
				})
				.catch((error) => {
					sendResponse({ success: false, error: error.message });
				});
			return true; // Keep the message channel open for async response
		}
	} catch (error) {
		console.error('Error handling message:', error);
		sendResponse({ success: false, error: String(error) });
	}
	return true; // Keep the message channel open for async response
});

/**
 * Schedule the daily check at 12:00 PM
 */
function scheduleDailyCheck() {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const noon = new Date(today);
	noon.setHours(12, 0, 0, 0);

	// If 12:00 PM has already passed today, schedule for tomorrow
	if (now >= noon) {
		noon.setDate(noon.getDate() + 1);
	}

	// Clear any existing alarms
	chrome.alarms.clear('daily-reminder-check');
	chrome.alarms.clear('daily-reminder-check-repeating');

	// Create a one-time alarm for 12:00 PM
	chrome.alarms.create('daily-reminder-check', {
		when: noon.getTime(),
	});

	// Set up a repeating alarm to check every minute starting from 11:59 AM
	// This ensures we catch the notification even if the one-time alarm fires slightly early
	const startTime = new Date(noon);
	startTime.setMinutes(59);
	startTime.setHours(11);

	// If we're past 11:59 AM today, start from 11:59 AM tomorrow
	if (now >= startTime) {
		startTime.setDate(startTime.getDate() + 1);
	}

	chrome.alarms.create('daily-reminder-check-repeating', {
		periodInMinutes: 1,
		when: startTime.getTime(),
	});
}

/**
 * Clean up old entries older than 7 days
 */
function cleanupOldEntries() {
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	chrome.storage.local.get(['browserNotificationsShown'], (data) => {
		const shownData = data.browserNotificationsShown || {};
		const cleanedData: Record<string, boolean> = {};

		Object.keys(shownData).forEach((key) => {
			const dateString = key.replace('browserNotificationsShown_', '');
			const entryDate = new Date(dateString);
			if (entryDate >= sevenDaysAgo) {
				cleanedData[key] = (shownData as { [key: string]: boolean })[key];
			}
		});

		chrome.storage.local.set({ browserNotificationsShown: cleanedData });
	});
}

// Initialize on service worker startup
chrome.runtime.onStartup.addListener(() => {
	try {
		scheduleDailyCheck();
	} catch (error) {
		console.error('Error on startup:', error);
	}
});

// Listen for storage changes and broadcast to all connected pages
chrome.storage.onChanged.addListener((changes, areaName) => {
	// Only broadcast changes from sync or local storage (not session storage)
	if (areaName === 'sync' || areaName === 'local') {
		// Filter for Redux state changes (prefixed with 'redux:')
		const reduxChanges: { [key: string]: chrome.storage.StorageChange } = {};
		for (const key in changes) {
			if (key.startsWith('redux:')) {
				reduxChanges[key] = changes[key];
			}
		}

		// If there are Redux state changes, broadcast them
		if (Object.keys(reduxChanges).length > 0) {
			// Broadcast to all connected extension pages and content scripts
			chrome.runtime.sendMessage(
				{
					type: 'STORAGE_CHANGED',
					changes: reduxChanges,
					areaName,
				},
				() => {
					// Ignore errors if no listeners are available
					// This is expected when no pages are open
					if (chrome.runtime.lastError) {
						// Silently ignore - no listeners available
					}
				}
			);
		}
	}
});

chrome.runtime.onInstalled.addListener(() => {
	try {
		scheduleDailyCheck();
	} catch (error) {
		console.error('Error on installed:', error);
	}
});
