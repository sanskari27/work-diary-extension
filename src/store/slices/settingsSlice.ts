import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

// Template for repo elements
export interface PreSavedTemplate {
	id: string;
	name: string;
	repoName: string;
	repoLink: string;
	prLinkFormat?: string;
	leadName?: string;
	defaultStatuses?: string[];
}

// Custom Status
export interface CustomStatus {
	id: string;
	name: string;
	isDefault: boolean; // Default statuses cannot be deleted
	isVisible: boolean;
	order: number;
}

// Reminder Preferences
export interface ReminderPreferences {
	defaultReminderDelta: string; // e.g., "1d", "2h"
	defaultReminderEnabled: boolean;
}

// Release Event Defaults
export interface ReleaseEventDefaults {
	titlePrefix: string;
	defaultStatusesIncluded: string[];
	defaultReminderEnabled: boolean;
	defaultDelta: string;
	defaultSorting: 'a-z' | 'newest-first' | 'status-based';
}

// Appearance Settings
export interface AppearanceSettings {
	theme: 'light' | 'dark' | 'system';
	compactMode: boolean;
	showStatusCheckboxes: boolean;
	showLeadSection: boolean;
	showDescriptionSection: boolean;
	showPRLinkField: boolean;
	cardSize: 'small' | 'medium' | 'large';
	minimalMode: boolean;
	greetingName: string;
}

// Settings State
interface SettingsState {
	templates: PreSavedTemplate[];
	customStatuses: CustomStatus[];
	reminderPreferences: ReminderPreferences;
	releaseEventDefaults: ReleaseEventDefaults;
	appearanceSettings: AppearanceSettings;
}

// Default statuses that cannot be deleted
const DEFAULT_STATUSES = [
	'Handover Completed',
	'Support Stamping',
	'Security Stamping',
	'SIT Deployed',
	'UAT Deployed',
	'PROD Deployed',
];

const initialState: SettingsState = {
	templates: [],
	customStatuses: DEFAULT_STATUSES.map((name, index) => ({
		id: nanoid(),
		name,
		isDefault: true,
		isVisible: true,
		order: index,
	})),
	reminderPreferences: {
		defaultReminderDelta: '1d',
		defaultReminderEnabled: true,
	},
	releaseEventDefaults: {
		titlePrefix: 'Release - ',
		defaultStatusesIncluded: DEFAULT_STATUSES,
		defaultReminderEnabled: true,
		defaultDelta: '1d',
		defaultSorting: 'newest-first',
	},
	appearanceSettings: {
		theme: 'system',
		compactMode: false,
		showStatusCheckboxes: true,
		showLeadSection: true,
		showDescriptionSection: true,
		showPRLinkField: true,
		cardSize: 'medium',
		minimalMode: false,
		greetingName: '',
	},
};

const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		// Template Actions
		addTemplate: (state, action: PayloadAction<Omit<PreSavedTemplate, 'id'>>) => {
			const newTemplate: PreSavedTemplate = {
				...action.payload,
				id: nanoid(),
			};
			state.templates.push(newTemplate);
		},

		updateTemplate: (
			state,
			action: PayloadAction<{ id: string; updates: Partial<PreSavedTemplate> }>
		) => {
			const index = state.templates.findIndex((t) => t.id === action.payload.id);
			if (index !== -1) {
				state.templates[index] = {
					...state.templates[index],
					...action.payload.updates,
				};
			}
		},

		deleteTemplate: (state, action: PayloadAction<string>) => {
			state.templates = state.templates.filter((t) => t.id !== action.payload);
		},

		// Custom Status Actions
		addCustomStatus: (state, action: PayloadAction<string>) => {
			const newStatus: CustomStatus = {
				id: nanoid(),
				name: action.payload,
				isDefault: false,
				isVisible: true,
				order: state.customStatuses.length,
			};
			state.customStatuses.push(newStatus);
		},

		updateCustomStatus: (
			state,
			action: PayloadAction<{ id: string; updates: Partial<CustomStatus> }>
		) => {
			const index = state.customStatuses.findIndex((s) => s.id === action.payload.id);
			if (index !== -1) {
				state.customStatuses[index] = {
					...state.customStatuses[index],
					...action.payload.updates,
				};
			}
		},

		deleteCustomStatus: (state, action: PayloadAction<string>) => {
			// Only allow deletion of non-default statuses
			state.customStatuses = state.customStatuses.filter(
				(s) => s.id !== action.payload || s.isDefault
			);
		},

		toggleStatusVisibility: (state, action: PayloadAction<string>) => {
			const status = state.customStatuses.find((s) => s.id === action.payload);
			if (status) {
				status.isVisible = !status.isVisible;
			}
		},

		reorderStatuses: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
			const { fromIndex, toIndex } = action.payload;
			const [moved] = state.customStatuses.splice(fromIndex, 1);
			state.customStatuses.splice(toIndex, 0, moved);
			// Update order numbers
			state.customStatuses.forEach((status, index) => {
				status.order = index;
			});
		},

		// Reminder Preferences Actions
		updateReminderPreferences: (state, action: PayloadAction<Partial<ReminderPreferences>>) => {
			state.reminderPreferences = {
				...state.reminderPreferences,
				...action.payload,
			};
		},

		// Release Event Defaults Actions
		updateReleaseEventDefaults: (state, action: PayloadAction<Partial<ReleaseEventDefaults>>) => {
			state.releaseEventDefaults = {
				...state.releaseEventDefaults,
				...action.payload,
			};
		},

		// Appearance Settings Actions
		updateAppearanceSettings: (state, action: PayloadAction<Partial<AppearanceSettings>>) => {
			state.appearanceSettings = {
				...state.appearanceSettings,
				...action.payload,
			};
		},

		// Reset to Defaults
		resetSettings: () => initialState,
	},
});

export const {
	addTemplate,
	updateTemplate,
	deleteTemplate,
	addCustomStatus,
	updateCustomStatus,
	deleteCustomStatus,
	toggleStatusVisibility,
	reorderStatuses,
	updateReminderPreferences,
	updateReleaseEventDefaults,
	updateAppearanceSettings,
	resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
