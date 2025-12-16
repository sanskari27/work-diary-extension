import { configureStore } from '@reduxjs/toolkit';
import { loadStateFromIndexedDB } from './indexedDB';
import { indexedDBMiddleware } from './middleware/indexedDBMiddleware';
import bookmarksReducer from './slices/bookmarksSlice';
import contentReducer from './slices/contentSlice';
import prsReducer from './slices/prsSlice';
import releasesReducer from './slices/releasesSlice';
import settingsReducer, { defaultSettingsState } from './slices/settingsSlice';
import todosReducer from './slices/todosSlice';
import uiReducer from './slices/uiSlice';

// Load persisted state from IndexedDB
export const loadPersistedState = async () => {
	try {
		const [content, ui, releases, settings, todos, bookmarks, prs] = await Promise.all([
			loadStateFromIndexedDB('content'),
			loadStateFromIndexedDB('ui'),
			loadStateFromIndexedDB('releases'),
			loadStateFromIndexedDB('settings'),
			loadStateFromIndexedDB('todos'),
			loadStateFromIndexedDB('bookmarks'),
			loadStateFromIndexedDB('prs'),
		]);

		// Ensure searchQuery is not persisted - always reset to empty string
		const uiState = ui ? { ...ui, searchQuery: '' } : undefined;

		const mergedSettings = settings
			? {
					...defaultSettingsState,
					...settings,
			  }
			: undefined;

		return {
			content: content || undefined,
			ui: uiState,
			releases: releases || undefined,
			settings: mergedSettings || undefined,
			todos: todos || undefined,
			bookmarks: bookmarks || undefined,
			prs: prs || undefined,
		};
	} catch (error) {
		console.error('Error loading persisted state:', error);
		return {};
	}
};

// Create store with optional preloaded state
export const createStore = (preloadedState?: any) => {
	const store = configureStore({
		reducer: {
			// @ts-expect-error - TypeScript has issues with reducer typing when using preloadedState
			content: contentReducer,
			ui: uiReducer,
			releases: releasesReducer,
			settings: settingsReducer,
			todos: todosReducer,
			bookmarks: bookmarksReducer,
			prs: prsReducer,
		},
		preloadedState,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: {
					// Ignore these action types for serialization check
					ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
				},
			}).concat(indexedDBMiddleware as any) as any,
	});
	return store;
};

// Create the initial store
export const store = createStore();

// Infer types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
