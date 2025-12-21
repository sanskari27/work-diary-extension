/**
 * Extension Storage Service
 * Centralized storage that uses the Chrome extension as the data store.
 * The PWA sends all read/write requests to the extension via chrome.runtime.sendMessage.
 * The extension stores data in chrome.storage.sync (with local fallback).
 */

import { sendMessage } from '../lib/chromeUtils';

// Storage key prefix for Redux state
const STORAGE_PREFIX = 'redux:';

/**
 * Check if Chrome extension APIs are available
 */
function isExtensionAvailable(): boolean {
	return (
		typeof chrome !== 'undefined' &&
		!!chrome.runtime &&
		typeof chrome.runtime.sendMessage === 'function'
	);
}

/**
 * Save state to extension storage
 */
export const saveStateToExtensionStorage = async (key: string, state: any): Promise<void> => {
	if (!isExtensionAvailable()) {
		console.warn('Chrome extension not available, cannot save to extension storage');
		return;
	}

	try {
		const storageKey = `${STORAGE_PREFIX}${key}`;
		await sendMessage({
			type: 'STORAGE_SET',
			items: {
				[storageKey]: state,
			},
		});
	} catch (error) {
		console.error('Error saving to extension storage:', error);
	}
};

/**
 * Load state from extension storage
 */
export const loadStateFromExtensionStorage = async (key: string): Promise<any> => {
	if (!isExtensionAvailable()) {
		console.warn('Chrome extension not available, cannot load from extension storage');
		return undefined;
	}

	try {
		const storageKey = `${STORAGE_PREFIX}${key}`;
		const response = await sendMessage<{ success: boolean; data?: any; error?: string }>({
			type: 'STORAGE_GET',
			keys: [storageKey],
		});

		if (response.success && response.data) {
			return response.data[storageKey];
		}
		return undefined;
	} catch (error) {
		console.error('Error loading from extension storage:', error);
		return undefined;
	}
};

/**
 * Clear all Redux state from extension storage
 */
export const clearExtensionStorage = async (): Promise<void> => {
	if (!isExtensionAvailable()) {
		console.warn('Chrome extension not available, cannot clear extension storage');
		return;
	}

	try {
		// Get all keys with the prefix
		const response = await sendMessage<{ success: boolean; data?: any; error?: string }>({
			type: 'STORAGE_GET',
			keys: null, // Get all keys
		});

		if (response.success && response.data) {
			// Find all keys that start with our prefix
			const keysToRemove = Object.keys(response.data).filter((key) =>
				key.startsWith(STORAGE_PREFIX)
			);

			if (keysToRemove.length > 0) {
				await sendMessage({
					type: 'STORAGE_REMOVE',
					keys: keysToRemove,
				});
			}
		}
	} catch (error) {
		console.error('Error clearing extension storage:', error);
	}
};

/**
 * Delete specific key from extension storage
 */
export const deleteFromExtensionStorage = async (key: string): Promise<void> => {
	if (!isExtensionAvailable()) {
		console.warn('Chrome extension not available, cannot delete from extension storage');
		return;
	}

	try {
		const storageKey = `${STORAGE_PREFIX}${key}`;
		await sendMessage({
			type: 'STORAGE_REMOVE',
			keys: [storageKey],
		});
	} catch (error) {
		console.error('Error deleting from extension storage:', error);
	}
};
