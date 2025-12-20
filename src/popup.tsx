import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider } from './components/providers/ThemeProvider';
import './index.css';
import Popup from './pages/Popup';
import { createStore, loadPersistedState } from './store/store';

// Initialize the popup with persisted state
const initPopup = async () => {
	// Load persisted state from IndexedDB
	const persistedState = await loadPersistedState();

	// Create store with persisted state
	const store = createStore(persistedState);

	// Render the popup
	const rootElement = document.getElementById('popup-root');
	if (rootElement) {
		ReactDOM.createRoot(rootElement).render(
			<React.StrictMode>
				<Provider store={store}>
					<ThemeProvider>
						<Popup />
					</ThemeProvider>
				</Provider>
			</React.StrictMode>
		);
	}
};

// Start the popup
initPopup();
