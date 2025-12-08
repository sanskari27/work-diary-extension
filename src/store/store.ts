import { configureStore } from '@reduxjs/toolkit';
import { loadStateFromIndexedDB } from './indexedDB';
import { indexedDBMiddleware } from './middleware/indexedDBMiddleware';
import contentReducer from './slices/contentSlice';
import uiReducer from './slices/uiSlice';
import releasesReducer from './slices/releasesSlice';

// Load persisted state from IndexedDB
export const loadPersistedState = async () => {
	try {
		const [content, ui, releases] = await Promise.all([
			loadStateFromIndexedDB('content'),
			loadStateFromIndexedDB('ui'),
			loadStateFromIndexedDB('releases'),
		]);

		return {
			content: content || undefined,
			ui: ui || undefined,
			releases: releases || undefined,
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
