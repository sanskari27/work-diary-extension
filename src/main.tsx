import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.tsx';
import './index.css';
import { createStore, loadPersistedState } from './store/store';

// Initialize the app with persisted state
const initApp = async () => {
	// Load persisted state from IndexedDB
	const persistedState = await loadPersistedState();

	// Create store with persisted state
	const store = createStore(persistedState);

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
