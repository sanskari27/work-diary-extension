import { configureStore } from '@reduxjs/toolkit';
import { loadStateFromIndexedDB } from './indexedDB';
import { indexedDBMiddleware } from './middleware/indexedDBMiddleware';
import contentReducer from './slices/contentSlice';
import uiReducer from './slices/uiSlice';

// Load persisted state from IndexedDB
export const loadPersistedState = async () => {
	try {
		const [content, ui] = await Promise.all([
			loadStateFromIndexedDB('content'),
			loadStateFromIndexedDB('ui'),
		]);

		return {
			content: content || undefined,
			ui: ui || undefined,
		};
	} catch (error) {
		console.error('Error loading persisted state:', error);
		return {};
	}
};

// Create store with optional preloaded state
export const createStore = (preloadedState?: any) => {
	return configureStore({
		reducer: {
			content: contentReducer,
			ui: uiReducer,
		},
		preloadedState,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: {
					// Ignore these action types for serialization check
					ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
				},
			}).concat(indexedDBMiddleware),
	});
};

// Create the initial store
export const store = createStore();

// Infer types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
