import { Middleware } from '@reduxjs/toolkit';
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
];

// Create debounced save function
const debouncedSave = debounce(
	async (state: RootState) => {
		// Save each slice separately for better granularity
		// Exclude searchQuery from ui slice when persisting
		const { searchQuery, ...uiStateToPersist } = state.ui;
		await Promise.all([
			saveStateToExtensionStorage('content', state.content),
			saveStateToExtensionStorage('ui', uiStateToPersist),
			saveStateToExtensionStorage('releases', state.releases),
			saveStateToExtensionStorage('settings', state.settings),
			saveStateToExtensionStorage('todos', state.todos),
			saveStateToExtensionStorage('bookmarks', state.bookmarks),
			saveStateToExtensionStorage('prs', state.prs),
			saveStateToExtensionStorage('brainDump', state.brainDump),
		]);
	},
	500 // Wait 500ms after the last action before saving
);

export const extensionStorageMiddleware: Middleware<{}, RootState> =
	(store) => (next) => (action) => {
		const result = next(action);

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
