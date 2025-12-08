import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

export interface Status {
	name: string;
	checked: boolean;
}

export interface ReleaseItem {
	id: string;
	repoName: string;
	repoLink: string;
	prLink?: string;
	statuses: Status[];
	leadName?: string;
	description?: string;
}

export interface ReleaseEvent {
	id: string;
	title: string;
	date: string;
	reminderEnabled: boolean;
	reminderDelta?: string;
	items: ReleaseItem[];
	createdAt: number;
}

export interface Template {
	id: string;
	repoName: string;
	repoLink: string;
}

interface ReleasesState {
	events: ReleaseEvent[];
	templates: Template[];
	defaultStatuses: string[];
}

const DEFAULT_STATUSES = [
	'Handover Completed',
	'Support Stamping',
	'Security Stamping',
	'Deployed',
	'SIT',
	'UAT',
	'PROD',
];

const initialState: ReleasesState = {
	events: [],
	templates: [],
	defaultStatuses: DEFAULT_STATUSES,
};

const releasesSlice = createSlice({
	name: 'releases',
	initialState,
	reducers: {
		// Release Event Actions
		addReleaseEvent: (
			state,
			action: PayloadAction<Omit<ReleaseEvent, 'id' | 'createdAt' | 'items'>>
		) => {
			const newEvent: ReleaseEvent = {
				...action.payload,
				id: nanoid(),
				createdAt: Date.now(),
				items: [],
			};
			state.events.unshift(newEvent);
		},

		updateReleaseEvent: (
			state,
			action: PayloadAction<{ id: string; updates: Partial<ReleaseEvent> }>
		) => {
			const index = state.events.findIndex((e) => e.id === action.payload.id);
			if (index !== -1) {
				state.events[index] = {
					...state.events[index],
					...action.payload.updates,
				};
			}
		},

		deleteReleaseEvent: (state, action: PayloadAction<string>) => {
			state.events = state.events.filter((e) => e.id !== action.payload);
		},

		// ReleaseItem Actions
		addReleaseItem: (
			state,
			action: PayloadAction<{ eventId: string; item: Omit<ReleaseItem, 'id' | 'statuses'> }>
		) => {
			const event = state.events.find((e) => e.id === action.payload.eventId);
			if (event) {
				const newItem: ReleaseItem = {
					...action.payload.item,
					id: nanoid(),
					statuses: state.defaultStatuses.map((name) => ({ name, checked: false })),
				};
				event.items.push(newItem);
			}
		},

		updateReleaseItem: (
			state,
			action: PayloadAction<{ eventId: string; itemId: string; updates: Partial<ReleaseItem> }>
		) => {
			const event = state.events.find((e) => e.id === action.payload.eventId);
			if (event) {
				const index = event.items.findIndex((item) => item.id === action.payload.itemId);
				if (index !== -1) {
					event.items[index] = {
						...event.items[index],
						...action.payload.updates,
					};
				}
			}
		},

		deleteReleaseItem: (state, action: PayloadAction<{ eventId: string; itemId: string }>) => {
			const event = state.events.find((e) => e.id === action.payload.eventId);
			if (event) {
				event.items = event.items.filter((item) => item.id !== action.payload.itemId);
			}
		},

		toggleItemStatus: (
			state,
			action: PayloadAction<{ eventId: string; itemId: string; statusName: string }>
		) => {
			const event = state.events.find((e) => e.id === action.payload.eventId);
			if (event) {
				const item = event.items.find((item) => item.id === action.payload.itemId);
				if (item) {
					const status = item.statuses.find((s) => s.name === action.payload.statusName);
					if (status) {
						status.checked = !status.checked;
					}
				}
			}
		},

		// Template Actions
		addTemplate: (state, action: PayloadAction<Omit<Template, 'id'>>) => {
			const newTemplate: Template = {
				...action.payload,
				id: nanoid(),
			};
			state.templates.push(newTemplate);
		},

		updateTemplate: (state, action: PayloadAction<{ id: string; updates: Partial<Template> }>) => {
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

		// Default Statuses Actions
		addDefaultStatus: (state, action: PayloadAction<string>) => {
			if (!state.defaultStatuses.includes(action.payload)) {
				state.defaultStatuses.push(action.payload);
			}
		},

		removeDefaultStatus: (state, action: PayloadAction<string>) => {
			state.defaultStatuses = state.defaultStatuses.filter((s) => s !== action.payload);
		},
	},
});

export const {
	addReleaseEvent,
	updateReleaseEvent,
	deleteReleaseEvent,
	addReleaseItem,
	updateReleaseItem,
	deleteReleaseItem,
	toggleItemStatus,
	addTemplate,
	updateTemplate,
	deleteTemplate,
	addDefaultStatus,
	removeDefaultStatus,
} = releasesSlice.actions;

export default releasesSlice.reducer;
