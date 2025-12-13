import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Feature {
	id: string;
	name: string;
	description: string;
	icon: string;
	color: string;
}

export interface Content {
	greeting: {
		hello: string;
		userName: string;
	};
	features: {
		title: string;
		items: Feature[];
	};
}

interface ContentState {
	content: Content;
}

const initialState: ContentState = {
	content: {
		greeting: {
			hello: 'Hello',
			userName: 'Sir',
		},
		features: {
			title: 'Features',
			items: [
				{
					id: 'releases',
					name: 'Releases',
					description: 'Track and manage your project releases with version control',
					icon: 'rocket',
					color: 'from-purple-600 via-purple-500 to-pink-500',
				},
			],
		},
	},
};

const contentSlice = createSlice({
	name: 'content',
	initialState,
	reducers: {
		updateGreeting: (state, action: PayloadAction<{ hello?: string; userName?: string }>) => {
			state.content.greeting = {
				...state.content.greeting,
				...action.payload,
			};
		},
		addFeature: (state, action: PayloadAction<Feature>) => {
			state.content.features.items.push(action.payload);
		},
		updateFeature: (state, action: PayloadAction<{ id: string; updates: Partial<Feature> }>) => {
			const index = state.content.features.items.findIndex((f) => f.id === action.payload.id);
			if (index !== -1) {
				state.content.features.items[index] = {
					...state.content.features.items[index],
					...action.payload.updates,
				};
			}
		},
		deleteFeature: (state, action: PayloadAction<string>) => {
			state.content.features.items = state.content.features.items.filter(
				(f) => f.id !== action.payload
			);
		},
	},
});

export const { updateGreeting, addFeature, updateFeature, deleteFeature } = contentSlice.actions;

export default contentSlice.reducer;
