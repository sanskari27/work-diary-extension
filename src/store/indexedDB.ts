import { DBSchema, IDBPDatabase, openDB } from 'idb';

// Define the database schema
interface AppDB extends DBSchema {
	redux: {
		key: string;
		value: any;
	};
}

const DB_NAME = 'chrome-homepage-db';
const DB_VERSION = 1;
const STORE_NAME = 'redux';

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
