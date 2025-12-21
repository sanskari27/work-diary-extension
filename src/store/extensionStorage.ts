/**
 * Extension Storage Service
 * Now uses IndexedDB for local data persistence.
 * Uses BroadcastChannel for cross-tab/window synchronization.
 */

import { deleteFromIndexedDB, loadStateFromIndexedDB, saveStateToIndexedDB } from './indexedDB';

// BroadcastChannel for cross-tab communication
const STORAGE_CHANNEL_NAME = 'chrome-homepage-storage-sync';
let broadcastChannel: BroadcastChannel | null = null;

/**
 * Get or create the broadcast channel for storage sync
 */
function getBroadcastChannel(): BroadcastChannel | null {
	if (typeof BroadcastChannel === 'undefined') {
		return null;
	}
	if (!broadcastChannel) {
		broadcastChannel = new BroadcastChannel(STORAGE_CHANNEL_NAME);
	}
	return broadcastChannel;
}

/**
 * Broadcast a storage change event to other tabs/windows
 */
function broadcastStorageChange(key: string, newValue: any, oldValue: any) {
	const channel = getBroadcastChannel();
	if (channel) {
		channel.postMessage({
			type: 'STORAGE_CHANGE',
			key: `redux:${key}`,
			newValue,
			oldValue,
		});
	}
}

/**
 * Save state to IndexedDB
 */
export const saveStateToExtensionStorage = async (key: string, state: any): Promise<void> => {
	try {
		// Load old value before saving to broadcast the change
		const oldValue = await loadStateFromIndexedDB(key);

		// Save to IndexedDB
		await saveStateToIndexedDB(key, state);

		// Broadcast the change to other tabs/windows
		broadcastStorageChange(key, state, oldValue);
	} catch (error) {
		console.error('Error saving to IndexedDB:', error);
	}
};

/**
 * Load state from IndexedDB
 */
export const loadStateFromExtensionStorage = async (key: string): Promise<any> => {
	try {
		return await loadStateFromIndexedDB(key);
	} catch (error) {
		console.error('Error loading from IndexedDB:', error);
		return undefined;
	}
};

/**
 * Clear all Redux state from IndexedDB
 */
export const clearExtensionStorage = async (): Promise<void> => {
	try {
		// Get all Redux keys and delete them
		const keys = [
			'content',
			'ui',
			'releases',
			'settings',
			'todos',
			'bookmarks',
			'prs',
			'brainDump',
		];
		await Promise.all(keys.map((key) => deleteFromIndexedDB(key)));
	} catch (error) {
		console.error('Error clearing IndexedDB:', error);
	}
};

/**
 * Delete specific key from IndexedDB
 */
export const deleteFromExtensionStorage = async (key: string): Promise<void> => {
	try {
		const oldValue = await loadStateFromIndexedDB(key);
		await deleteFromIndexedDB(key);
		// Broadcast the deletion
		broadcastStorageChange(key, undefined, oldValue);
	} catch (error) {
		console.error('Error deleting from IndexedDB:', error);
	}
};

/**
 * Get the broadcast channel for listening to storage changes
 * This is used by StorageSyncService
 */
export function getStorageBroadcastChannel(): BroadcastChannel | null {
	return getBroadcastChannel();
}
