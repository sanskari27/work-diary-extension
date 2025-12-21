import { Middleware } from '@reduxjs/toolkit';
import { getIsExternalSyncUpdate, updateLastSavedState } from '../../services/StorageSyncService';
import { saveStateToExtensionStorage } from '../extensionStorage';
import { RootState } from '../store';

// Debounce function to avoid saving on every action
const debounce = <T extends (...args: any[]) => void>(
	func: T,
	wait: number
): ((...args: Parameters<T>) => void) => {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	return (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
};

// List of action types that should trigger a save to extension storage
// Add more action types here as needed
const ACTIONS_TO_PERSIST = [
	'content/',
	'ui/',
	'releases/',
	'settings/',
	'todos/',
	'bookmarks/',
	'prs/',
	'brainDump/',
	'visualNotes/',
];

// Create debounced save function
const debouncedSave = debounce(
	async (state: RootState) => {
		// Save each slice separately for better granularity
		// Exclude searchQuery from ui slice when persisting
		const { searchQuery, ...uiStateToPersist } = state.ui;

		// Save all slices and track what we saved
		const savePromises = [
			{ key: 'redux:content', value: state.content },
			{ key: 'redux:ui', value: uiStateToPersist },
			{ key: 'redux:releases', value: state.releases },
			{ key: 'redux:settings', value: state.settings },
			{ key: 'redux:todos', value: state.todos },
			{ key: 'redux:bookmarks', value: state.bookmarks },
			{ key: 'redux:prs', value: state.prs },
			{ key: 'redux:brainDump', value: state.brainDump },
			{ key: 'redux:visualNotes', value: state.visualNotes },
		];

		await Promise.all(
			savePromises.map(async ({ key, value }) => {
				await saveStateToExtensionStorage(key.replace('redux:', ''), value);
				// Track what we saved to detect our own changes later
				updateLastSavedState(key, value);
			})
		);
	},
	500 // Wait 500ms after the last action before saving
);

export const extensionStorageMiddleware: Middleware<{}, RootState> =
	(store) => (next) => (action) => {
		const result = next(action);

		// Skip saving if this update came from external sync to prevent infinite loops
		if (getIsExternalSyncUpdate()) {
			return result;
		}

		// Check if this action should trigger a save
		if (
			ACTIONS_TO_PERSIST.some((pattern) =>
				(action as any).type?.startsWith?.(pattern.split('/')[0])
			)
		) {
			const state = store.getState();
			debouncedSave(state);
		}

		return result;
	};

// Keep the old name for backwards compatibility during migration
export const indexedDBMiddleware = extensionStorageMiddleware;
