// Export store and types
export { createStore, loadPersistedState, store } from './store';
export type { AppDispatch, RootState } from './store';

// Export hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Export content slice actions and types
export { addFeature, deleteFeature, updateFeature, updateGreeting } from './slices/contentSlice';
export type { Content, Feature } from './slices/contentSlice';

// Export UI slice actions
export {
	addNotification,
	clearNotifications,
	removeNotification,
	setSidebarOpen,
	setTheme,
	toggleSidebar,
} from './slices/uiSlice';

// Export IndexedDB utilities
export {
	clearIndexedDB,
	deleteFromIndexedDB,
	loadStateFromIndexedDB,
	saveStateToIndexedDB,
} from './indexedDB';

// Export PR slice types and selectors
export { selectActivePrs, selectAllPrs } from './slices/prsSlice';
export type { CiStatus, PullRequest, PullRequestStatus, ReviewState } from './slices/prsSlice';
