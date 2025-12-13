import { Middleware } from '@reduxjs/toolkit';
import { saveStateToIndexedDB } from '../indexedDB';
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

// List of action types that should trigger a save to IndexedDB
// Add more action types here as needed
const ACTIONS_TO_PERSIST = ['content/', 'ui/', 'releases/', 'settings/', 'todos/', 'bookmarks/'];

// Create debounced save function
const debouncedSave = debounce(
	async (state: RootState) => {
		// Save each slice separately for better granularity
		// Exclude searchQuery from ui slice when persisting
		const { searchQuery, ...uiStateToPersist } = state.ui;
		await Promise.all([
			saveStateToIndexedDB('content', state.content),
			saveStateToIndexedDB('ui', uiStateToPersist),
			saveStateToIndexedDB('releases', state.releases),
			saveStateToIndexedDB('settings', state.settings),
			saveStateToIndexedDB('todos', state.todos),
			saveStateToIndexedDB('bookmarks', state.bookmarks),
		]);
	},
	500 // Wait 500ms after the last action before saving
);

export const indexedDBMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
	const result = next(action);

	// Check if this action should trigger a save
	if (
		ACTIONS_TO_PERSIST.some((pattern) => (action as any).type?.startsWith?.(pattern.split('/')[0]))
	) {
		const state = store.getState();
		debouncedSave(state);
	}

	return result;
};
