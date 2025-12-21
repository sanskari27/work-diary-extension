/**
 * Chrome Extension API Utilities
 * Centralized helper functions for Chrome Extension APIs
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface Tab {
	id: number;
	title: string;
	url: string;
	windowId?: number;
	active?: boolean;
}

export interface ChromeError {
	message: string;
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Get the last Chrome runtime error if any
 */
export function getChromeError(): ChromeError | null {
	if (typeof chrome === 'undefined' || !chrome.runtime?.lastError) {
		return null;
	}
	return {
		message: chrome.runtime.lastError.message || 'Unknown Chrome API error',
	};
}

/**
 * Check if Chrome APIs are available
 */
export function isChromeAvailable(): boolean {
	return typeof chrome !== 'undefined';
}

// ============================================================================
// Tabs API
// ============================================================================

/**
 * Query tabs matching the given query info
 */
export function queryTabs(queryInfo: {
	active?: boolean;
	currentWindow?: boolean;
	[key: string]: any;
}): Promise<ChromeTabsTab[]> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.tabs) {
			reject(new Error('Chrome tabs API is not available'));
			return;
		}

		chrome.tabs.query(queryInfo, (tabs) => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve(tabs);
		});
	});
}

/**
 * Get the current active tab
 */
export async function getCurrentTab(): Promise<Tab | null> {
	try {
		const tabs = await queryTabs({ active: true, currentWindow: true });
		if (tabs.length === 0 || !tabs[0]) {
			return null;
		}

		const tab = tabs[0];
		// Remove notification count from title (e.g., "(3) Title" or "Title (3)")
		const rawTitle = tab.title || 'Untitled';
		const cleanTitle = rawTitle.replace(/^\(\d+\)\s*/, '').replace(/\s*\(\d+\)$/, '');

		return {
			id: tab.id!,
			title: cleanTitle,
			url: tab.url || '',
			windowId: tab.windowId,
			active: tab.active,
		};
	} catch (error) {
		console.error('Error getting current tab:', error);
		return null;
	}
}

/**
 * Get all tabs in the current window
 */
export async function getCurrentWindowTabs(): Promise<Tab[]> {
	try {
		const chromeTabs = await queryTabs({ currentWindow: true });
		return chromeTabs
			.filter(
				(tab) =>
					tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')
			)
			.map((tab) => ({
				id: tab.id!,
				title: (tab.title || 'Untitled').replace(/^\(\d+\)\s*/, '').replace(/\s*\(\d+\)$/, ''),
				url: tab.url || '',
				windowId: tab.windowId,
				active: tab.active,
			}));
	} catch (error) {
		console.error('Error getting current window tabs:', error);
		return [];
	}
}

/**
 * Create a new tab
 */
export function createTab(createProperties: {
	windowId?: number;
	url?: string;
	active?: boolean;
	[key: string]: any;
}): Promise<ChromeTabsTab | undefined> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.tabs) {
			reject(new Error('Chrome tabs API is not available'));
			return;
		}

		chrome.tabs.create(createProperties, (tab) => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve(tab);
		});
	});
}

/**
 * Group tabs together
 */
export function groupTabs(options: {
	tabIds: number[];
	createProperties?: { windowId?: number };
	groupId?: number;
}): Promise<number> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.tabs) {
			reject(new Error('Chrome tabs API is not available'));
			return;
		}

		chrome.tabs.group(options, (groupId) => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve(groupId);
		});
	});
}

/**
 * Get the TAB_GROUP_ID_NONE constant
 */
export function getTabGroupIdNone(): number {
	if (!isChromeAvailable() || !chrome.tabs) {
		return -1;
	}
	return chrome.tabs.TAB_GROUP_ID_NONE;
}

// ============================================================================
// Windows API
// ============================================================================

/**
 * Create a new window with the given URLs
 */
export function createWindow(createData: {
	url?: string | string[];
	[key: string]: any;
}): Promise<any> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.windows) {
			reject(new Error('Chrome windows API is not available'));
			return;
		}

		chrome.windows.create(createData, (window) => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve(window);
		});
	});
}

// ============================================================================
// Tab Groups API
// ============================================================================

/**
 * Update a tab group
 */
export function updateTabGroup(
	groupId: number,
	updateProperties: { title?: string; color?: string; [key: string]: any }
): Promise<any> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.tabGroups) {
			reject(new Error('Chrome tabGroups API is not available'));
			return;
		}

		chrome.tabGroups.update(groupId, updateProperties, (group) => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve(group);
		});
	});
}

// ============================================================================
// Runtime API
// ============================================================================

/**
 * Send a message to the background script
 */
export function sendMessage<T = any>(message: any): Promise<T> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.runtime?.sendMessage) {
			reject(new Error('Chrome runtime API is not available'));
			return;
		}

		chrome.runtime.sendMessage(message, (response: T) => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve(response);
		});
	});
}

/**
 * Get the URL for a resource in the extension
 */
export function getExtensionURL(path: string): string {
	if (!isChromeAvailable() || !chrome.runtime?.getURL) {
		throw new Error('Chrome runtime API is not available');
	}
	return chrome.runtime.getURL(path);
}

// ============================================================================
// Storage API
// ============================================================================

/**
 * Get data from Chrome storage
 */
export function getStorageData<T = any>(
	keys: string | string[] | { [key: string]: any } | null
): Promise<T> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.storage?.local) {
			reject(new Error('Chrome storage API is not available'));
			return;
		}

		chrome.storage.local.get(keys, (items: T) => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve(items);
		});
	});
}

/**
 * Set data in Chrome storage
 */
export function setStorageData(items: { [key: string]: any }): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.storage?.local) {
			reject(new Error('Chrome storage API is not available'));
			return;
		}

		chrome.storage.local.set(items, () => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve();
		});
	});
}

/**
 * Remove data from Chrome storage
 */
export function removeStorageData(keys: string | string[]): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.storage?.local) {
			reject(new Error('Chrome storage API is not available'));
			return;
		}

		chrome.storage.local.remove(keys, () => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve();
		});
	});
}

/**
 * Clear all data from Chrome storage
 */
export function clearStorage(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.storage?.local) {
			reject(new Error('Chrome storage API is not available'));
			return;
		}

		chrome.storage.local.clear(() => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve();
		});
	});
}

// ============================================================================
// Bookmarks API
// ============================================================================

/**
 * Get the browser bookmarks tree
 */
export function getBookmarksTree(): Promise<ChromeBookmarkTreeNode[]> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.bookmarks?.getTree) {
			reject(
				new Error(
					'Browser bookmarks API is not available. Ensure the extension has the "bookmarks" permission.'
				)
			);
			return;
		}

		chrome.bookmarks.getTree((nodes: ChromeBookmarkTreeNode[]) => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message || 'Failed to read browser bookmarks.'));
				return;
			}
			resolve(nodes);
		});
	});
}

// ============================================================================
// Notifications API
// ============================================================================

/**
 * Create a Chrome notification
 */
export function createNotification(options: ChromeNotificationsOptions | string): Promise<string> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.notifications) {
			reject(new Error('Chrome notifications API is not available'));
			return;
		}

		chrome.notifications.create(options, (notificationId) => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve(notificationId);
		});
	});
}

// ============================================================================
// Alarms API
// ============================================================================

/**
 * Create a Chrome alarm
 */
export function createAlarm(
	nameOrInfo: string | ChromeAlarmCreateInfo,
	alarmInfo?: ChromeAlarmCreateInfo
): void {
	if (!isChromeAvailable() || !chrome.alarms) {
		throw new Error('Chrome alarms API is not available');
	}

	if (typeof nameOrInfo === 'string') {
		if (!alarmInfo) {
			throw new Error('Alarm info is required when name is provided');
		}
		chrome.alarms.create(nameOrInfo, alarmInfo);
	} else {
		chrome.alarms.create(nameOrInfo);
	}
}

/**
 * Clear a Chrome alarm
 */
export function clearAlarm(name?: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.alarms) {
			reject(new Error('Chrome alarms API is not available'));
			return;
		}

		chrome.alarms.clear(name, (wasCleared) => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve(wasCleared);
		});
	});
}

/**
 * Get all Chrome alarms
 */
export function getAllAlarms(): Promise<ChromeAlarm[]> {
	return new Promise((resolve, reject) => {
		if (!isChromeAvailable() || !chrome.alarms) {
			reject(new Error('Chrome alarms API is not available'));
			return;
		}

		chrome.alarms.getAll((alarms) => {
			const error = getChromeError();
			if (error) {
				reject(new Error(error.message));
				return;
			}
			resolve(alarms);
		});
	});
}

// ============================================================================
// Notifications Permission
// ============================================================================

/**
 * Check if Chrome notifications API is available
 */
export function isChromeNotificationsAvailable(): boolean {
	return isChromeAvailable() && typeof chrome.notifications !== 'undefined';
}

/**
 * Get notification permission status
 * Returns 'granted' for Chrome extensions with notifications permission,
 * or falls back to standard Notification API permission
 */
export function getNotificationPermission(): 'granted' | 'denied' | 'default' {
	if (isChromeNotificationsAvailable()) {
		// Chrome extensions with "notifications" permission in manifest have permission granted
		return 'granted';
	} else if (typeof window !== 'undefined' && 'Notification' in window) {
		// Fallback to standard Notification API
		return Notification.permission as 'granted' | 'denied' | 'default';
	}
	return 'default';
}

// ============================================================================
// Helper Functions for Common Operations
// ============================================================================

/**
 * Open URLs in a new window
 */
export async function openUrlsInNewWindow(urls: string[]): Promise<void> {
	try {
		await createWindow({ url: urls });
	} catch (error) {
		console.error('Error creating window:', error);
		throw error;
	}
}

/**
 * Open URLs in current window as a tab group
 */
export async function openUrlsAsTabGroup(
	urls: string[],
	groupName?: string,
	groupColor: string = 'blue'
): Promise<void> {
	if (urls.length === 0) return;

	try {
		// Get current window
		const currentTabs = await queryTabs({ currentWindow: true, active: true });
		if (currentTabs.length === 0) {
			// Fallback: if no current window, open in new window
			await openUrlsInNewWindow(urls);
			return;
		}

		const currentWindowId = currentTabs[0].windowId!;

		// Create first tab
		const firstTab = await createTab({
			windowId: currentWindowId,
			url: urls[0],
			active: true,
		});

		if (!firstTab?.id) {
			throw new Error('Failed to create first tab');
		}

		// Create remaining tabs
		const remainingUrls = urls.slice(1);
		if (remainingUrls.length === 0) {
			// Only one tab, no need to group
			return;
		}

		const createTabPromises = remainingUrls.map((url) =>
			createTab({ windowId: currentWindowId, url })
		);

		const remainingTabs = await Promise.all(createTabPromises);
		const validTabIds = [
			firstTab.id,
			...remainingTabs
				.map((tab) => tab?.id)
				.filter((id): id is number => id !== undefined && id > 0),
		];

		if (validTabIds.length > 1) {
			// Group all tabs together
			const groupId = await groupTabs({
				tabIds: validTabIds,
				createProperties: {
					windowId: currentWindowId,
				},
			});

			// Update group title if possible
			if (groupId !== getTabGroupIdNone() && groupName) {
				await updateTabGroup(groupId, {
					title: groupName,
					color: groupColor,
				});
			}
		}
	} catch (error) {
		console.error('Error opening URLs as tab group:', error);
		throw error;
	}
}
