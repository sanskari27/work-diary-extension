import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.tsx';
import './index.css';
import { initializeBrowserNotifications } from './services/BrowserNotificationService';
import { initializeReleaseNotifications } from './services/ReleaseNotificationService';
import { initializeStorageSync } from './services/StorageSyncService';
import { initializeTodoNotifications } from './services/TodoNotificationService';
import { createStore, loadPersistedState } from './store/store';
import { initializeSingleInstance, setupVisibilityHandler } from './utils/pwaInstanceManager';

// Initialize the app with persisted state
const initApp = async () => {
	// Load persisted state from extension storage
	const persistedState = await loadPersistedState();

	// Create store with persisted state
	const store = createStore(persistedState);

	// Initialize storage sync to listen for changes from other instances
	// This also initializes lastSavedState with the current store state
	initializeStorageSync(store);

	// Initialize notification services (runs once on app load)
	initializeReleaseNotifications(store);
	initializeTodoNotifications(store);
	initializeBrowserNotifications(store);

	// Initialize PWA single instance behavior
	await initializeSingleInstance();
	setupVisibilityHandler();

	// Render the app
	ReactDOM.createRoot(document.getElementById('root')!).render(
		<React.StrictMode>
			<Provider store={store}>
				<App />
			</Provider>
		</React.StrictMode>
	);
};

// Start the app
initApp();
