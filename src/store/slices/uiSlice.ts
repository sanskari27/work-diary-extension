import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
	theme: 'light' | 'dark' | 'system';
	sidebarOpen: boolean;
	searchQuery: string;
	notifications: Array<{
		id: string;
		message: string;
		type: 'info' | 'success' | 'warning' | 'error';
		timestamp: number;
	}>;
}

const initialState: UIState = {
	theme: 'system',
	sidebarOpen: false,
	searchQuery: '',
	notifications: [],
};

const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
			state.theme = action.payload;
		},
		toggleSidebar: (state) => {
			state.sidebarOpen = !state.sidebarOpen;
		},
		setSidebarOpen: (state, action: PayloadAction<boolean>) => {
			state.sidebarOpen = action.payload;
		},
		addNotification: (
			state,
			action: PayloadAction<{
				id?: string;
				message: string;
				type: 'info' | 'success' | 'warning' | 'error';
			}>
		) => {
			// check if the notification with the same id already exists
			if (action.payload.id && state.notifications.find((n) => n.id === action.payload.id)) {
				return;
			}
			state.notifications.push({
				id: action.payload.id || `${Date.now()}-${Math.random()}`,
				message: action.payload.message,
				type: action.payload.type,
				timestamp: Date.now(),
			});
		},
		removeNotification: (state, action: PayloadAction<string>) => {
			state.notifications = state.notifications.filter((n) => n.id !== action.payload);
		},
		clearNotifications: (state) => {
			state.notifications = [];
		},
		setSearchQuery: (state, action: PayloadAction<string>) => {
			state.searchQuery = action.payload;
		},
	},
});

export const {
	setTheme,
	toggleSidebar,
	setSidebarOpen,
	addNotification,
	removeNotification,
	clearNotifications,
	setSearchQuery,
} = uiSlice.actions;

export default uiSlice.reducer;
