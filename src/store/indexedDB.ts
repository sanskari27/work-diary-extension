import { DBSchema, IDBPDatabase, openDB } from 'idb';

// Define the database schema
interface AppDB extends DBSchema {
	redux: {
		key: string;
		value: any;
	};
	faviconCache: {
		key: string;
		value: { url: string; cachedAt: number };
	};
}

const DB_NAME = 'chrome-homepage-db';
const DB_VERSION = 2;
const STORE_NAME = 'redux';
const FAVICON_CACHE_STORE = 'faviconCache';

// Initialize the IndexedDB
let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

const getDB = (): Promise<IDBPDatabase<AppDB>> => {
	if (!dbPromise) {
		dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				// Create object store if it doesn't exist
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					db.createObjectStore(STORE_NAME);
				}
				// Create favicon cache store if it doesn't exist
				if (!db.objectStoreNames.contains(FAVICON_CACHE_STORE)) {
					db.createObjectStore(FAVICON_CACHE_STORE);
				}
			},
		});
	}
	return dbPromise;
};

// Save state to IndexedDB
export const saveStateToIndexedDB = async (key: string, state: any): Promise<void> => {
	try {
		const db = await getDB();
		await db.put(STORE_NAME, state, key);
	} catch (error) {
		console.error('Error saving to IndexedDB:', error);
	}
};

// Load state from IndexedDB
export const loadStateFromIndexedDB = async (key: string): Promise<any> => {
	try {
		const db = await getDB();
		return await db.get(STORE_NAME, key);
	} catch (error) {
		console.error('Error loading from IndexedDB:', error);
		return undefined;
	}
};

// Clear all data from IndexedDB
export const clearIndexedDB = async (): Promise<void> => {
	try {
		const db = await getDB();
		await db.clear(STORE_NAME);
	} catch (error) {
		console.error('Error clearing IndexedDB:', error);
	}
};

// Delete specific key from IndexedDB
export const deleteFromIndexedDB = async (key: string): Promise<void> => {
	try {
		const db = await getDB();
		await db.delete(STORE_NAME, key);
	} catch (error) {
		console.error('Error deleting from IndexedDB:', error);
	}
};

// Favicon cache utilities
export interface FaviconCacheEntry {
	url: string;
	cachedAt: number;
}

const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const getFaviconFromCache = async (domain: string): Promise<string | null> => {
	try {
		const db = await getDB();
		const cached = await db.get(FAVICON_CACHE_STORE, domain);

		if (cached) {
			// Check if cached URL is invalid (chrome://favicon/ doesn't work in newtab pages)
			if (cached.url && cached.url.startsWith('chrome://favicon/')) {
				// Invalid cached URL, remove it and return null
				await db.delete(FAVICON_CACHE_STORE, domain);
				return null;
			}

			const age = Date.now() - cached.cachedAt;
			if (age < CACHE_DURATION_MS) {
				return cached.url;
			} else {
				// Cache expired, remove it
				await db.delete(FAVICON_CACHE_STORE, domain);
			}
		}
		return null;
	} catch (error) {
		console.error('Error getting favicon from cache:', error);
		return null;
	}
};

export const saveFaviconToCache = async (domain: string, url: string): Promise<void> => {
	try {
		const db = await getDB();
		await db.put(FAVICON_CACHE_STORE, { url, cachedAt: Date.now() }, domain);
	} catch (error) {
		console.error('Error saving favicon to cache:', error);
	}
};
