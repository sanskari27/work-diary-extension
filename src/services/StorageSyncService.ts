/**
 * Storage Sync Service
 * Listens for storage changes from the extension and updates the Redux store
 * This enables real-time synchronization across all instances (PWA, extension pages, etc.)
 */

import { Store } from '@reduxjs/toolkit';
import { getStorageBroadcastChannel } from '../store/extensionStorage';
import { setBookmarkGroups } from '../store/slices/bookmarksSlice';
import { setEntries } from '../store/slices/brainDumpSlice';
import { setContent } from '../store/slices/contentSlice';
import { setPrsInRepo } from '../store/slices/prsSlice';
import { setReleases } from '../store/slices/releasesSlice';
import { setSettings } from '../store/slices/settingsSlice';
import { setTodos } from '../store/slices/todosSlice';
import { setSidebarOpen, setTheme } from '../store/slices/uiSlice';
import { RootState } from '../store/store';

// Map of Redux slice names to their storage keys and set actions
const SLICE_ACTIONS: Record<
	string,
	{
		storageKey: string;
		setAction: (payload: any) => any;
	}
> = {
	content: {
		storageKey: 'content',
		setAction: setContent,
	},
	ui: {
		storageKey: 'ui',
		setAction: null as any, // UI is handled specially
	},
	releases: {
		storageKey: 'releases',
		setAction: setReleases,
	},
	settings: {
		storageKey: 'settings',
		setAction: setSettings,
	},
	todos: {
		storageKey: 'todos',
		setAction: setTodos,
	},
	bookmarks: {
		storageKey: 'bookmarks',
		setAction: setBookmarkGroups,
	},
	prs: {
		storageKey: 'prs',
		setAction: setPrsInRepo,
	},
	brainDump: {
		storageKey: 'brainDump',
		setAction: setEntries,
	},
};

/**
 * Initialize the last saved state with the current store state
 * This should be called after the store is created with persisted state
 */
export function initializeLastSavedState(store: Store<RootState>) {
	const state = store.getState();
	const { searchQuery, ...uiStateToPersist } = state.ui;

	lastSavedState = {
		'redux:content': state.content,
		'redux:ui': uiStateToPersist,
		'redux:releases': state.releases,
		'redux:settings': state.settings,
		'redux:todos': state.todos,
		'redux:bookmarks': state.bookmarks,
		'redux:prs': state.prs,
		'redux:brainDump': state.brainDump,
	};

	// Mark initialization as complete after a short delay to allow store to stabilize
	if (initializationTimeout) {
		clearTimeout(initializationTimeout);
	}
	initializationTimeout = setTimeout(() => {
		isInitializing = false;
		initializationTimeout = null;
	}, 1000);
}

/**
 * Initialize storage sync service
 * Listens for storage changes via BroadcastChannel and updates the Redux store accordingly
 */
export function initializeStorageSync(store: Store<RootState>): () => void {
	// Initialize lastSavedState with current store state
	initializeLastSavedState(store);

	// Use BroadcastChannel for cross-tab/window synchronization
	let broadcastChannel: BroadcastChannel | null = null;

	if (typeof BroadcastChannel !== 'undefined') {
		broadcastChannel = getStorageBroadcastChannel();

		if (broadcastChannel) {
			const messageHandler = (event: MessageEvent) => {
				// Skip processing during initialization to prevent overwriting loaded state
				if (isInitializing) {
					return;
				}

				if (event.data && event.data.type === 'STORAGE_CHANGE') {
					const { key, newValue, oldValue } = event.data;

					// Only process Redux state changes
					if (key && key.startsWith('redux:')) {
						// Convert BroadcastChannel message to ChromeStorageChange format
						const changes: { [key: string]: ChromeStorageChange } = {
							[key]: {
								newValue,
								oldValue,
							} as ChromeStorageChange,
						};

						handleStorageChanges(changes, store, () => {
							setIsExternalSyncUpdate(true);
						});
					}
				}
			};

			broadcastChannel.addEventListener('message', messageHandler);
		}
	}

	// Cleanup function
	return () => {
		if (broadcastChannel) {
			broadcastChannel.close();
		}
	};
}

// Track the last state we saved to detect our own changes
let lastSavedState: { [key: string]: any } = {};

// Flag to prevent processing storage changes during initial load
let isInitializing = true;
let initializationTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Check if a change came from this instance by comparing with last saved state
 */
function isChangeFromThisInstance(storageKey: string, newValue: any, _oldValue: any): boolean {
	const lastSaved = lastSavedState[storageKey];
	if (!lastSaved) return false;

	// Deep compare the new value with what we last saved
	try {
		return JSON.stringify(newValue) === JSON.stringify(lastSaved);
	} catch {
		return false;
	}
}

/**
 * Update the last saved state for a key
 */
export function updateLastSavedState(key: string, value: any) {
	lastSavedState[key] = value;
}

/**
 * Handle storage changes and update the Redux store
 */
function handleStorageChanges(
	changes: { [key: string]: ChromeStorageChange },
	store: Store<RootState>,
	setUpdatingFlag: () => void
) {
	try {
		const state = store.getState();

		// Process each changed key
		for (const storageKey in changes) {
			const change = changes[storageKey];
			// Extract the slice name from the storage key (e.g., 'redux:content' -> 'content')
			const sliceName = storageKey.replace('redux:', '');

			// Check if this is a slice we manage
			const sliceConfig = SLICE_ACTIONS[sliceName];
			if (!sliceConfig) continue;

			// Get the new value
			const newValue = change.newValue;
			if (newValue === undefined) continue;

			// Check if this change came from this instance - if so, ignore it
			if (isChangeFromThisInstance(storageKey, newValue, change.oldValue)) {
				continue; // This is our own change, ignore it
			}

			// Check if the current state already matches the new value
			// If so, no need to update (prevents unnecessary re-renders)
			const currentState = (state as any)[sliceName];
			if (currentState) {
				try {
					// For slices with nested structures, compare the relevant part
					let currentValue = currentState;
					if (sliceName === 'bookmarks') {
						currentValue = currentState.groups;
					} else if (sliceName === 'brainDump') {
						currentValue = currentState.entries;
					} else if (sliceName === 'todos') {
						currentValue = currentState.todos;
					} else if (sliceName === 'prs') {
						currentValue = currentState.prsInRepo;
					}

					const newValueToCompare =
						sliceName === 'bookmarks'
							? newValue.groups
							: sliceName === 'brainDump'
							? newValue.entries
							: sliceName === 'todos'
							? newValue.todos
							: sliceName === 'prs'
							? newValue.prsInRepo
							: newValue;

					if (JSON.stringify(currentValue) === JSON.stringify(newValueToCompare)) {
						continue; // State already matches, no need to update
					}
				} catch (e) {
					// If comparison fails, proceed with update
				}
			}

			// Set flag BEFORE dispatching to prevent middleware from saving
			setUpdatingFlag();

			// Special handling for UI slice - preserve searchQuery
			if (sliceName === 'ui') {
				const currentUiState = state.ui;
				const updatedUiState = {
					...newValue,
					searchQuery: currentUiState?.searchQuery || '', // Preserve current searchQuery
				};
				// Dispatch individual UI actions
				if (updatedUiState.theme !== state.ui?.theme) {
					store.dispatch(setTheme(updatedUiState.theme));
				}
				if (updatedUiState.sidebarOpen !== state.ui?.sidebarOpen) {
					store.dispatch(setSidebarOpen(updatedUiState.sidebarOpen));
				}
				// Note: notifications and other UI state would need their own actions
				// For now, we'll handle theme and sidebar which are the main persisted UI states
			} else {
				// For other slices, dispatch the set action
				const setAction = sliceConfig.setAction;
				if (setAction) {
					// The middleware saves the entire slice state, so newValue is the full state object
					// We need to extract the appropriate data for each set action
					if (sliceName === 'bookmarks') {
						// Bookmarks state: { bookmarks: Bookmark[], groups: BookmarkGroup[] }
						// setBookmarkGroups expects: BookmarkGroup[]
						store.dispatch(setAction(newValue.groups || []));
					} else if (sliceName === 'brainDump') {
						// BrainDump state: { entries: BrainDumpEntry[] }
						// setEntries expects: BrainDumpEntry[]
						store.dispatch(setAction(newValue.entries || []));
					} else if (sliceName === 'todos') {
						// Todos state: { todos: Todo[] }
						// setTodos expects: Todo[]
						store.dispatch(setAction(newValue.todos || []));
					} else if (sliceName === 'prs') {
						// PRs state: { prsInRepo: PullRequest[], isLoading: boolean, ... }
						// setPrsInRepo expects: PullRequest[]
						store.dispatch(setAction(newValue.prsInRepo || []));
					} else {
						// For other slices (content, releases, settings), use the new value directly
						// These slices' set actions expect the entire state object
						store.dispatch(setAction(newValue));
					}
				}
			}
		}
	} catch (error) {
		console.error('Error handling storage changes:', error);
	}
}

/**
 * Flag to prevent infinite loops when updating from external sync
 * This is used by the middleware to prevent saving changes that came from sync
 */
let isExternalSyncUpdate = false;
let syncUpdateTimeout: ReturnType<typeof setTimeout> | null = null;

export function setIsExternalSyncUpdate(value: boolean) {
	if (value) {
		isExternalSyncUpdate = true;
		if (syncUpdateTimeout) {
			clearTimeout(syncUpdateTimeout);
		}
		// Reset flag after middleware debounce completes (500ms + buffer)
		syncUpdateTimeout = setTimeout(() => {
			isExternalSyncUpdate = false;
			syncUpdateTimeout = null;
		}, 1000);
	} else {
		isExternalSyncUpdate = false;
		if (syncUpdateTimeout) {
			clearTimeout(syncUpdateTimeout);
			syncUpdateTimeout = null;
		}
	}
}

export function getIsExternalSyncUpdate(): boolean {
	return isExternalSyncUpdate;
}
