import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

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
	content: Content | null;
	loading: boolean;
	error: string | null;
	lastFetched: number | null;
}

const initialState: ContentState = {
	content: null,
	loading: false,
	error: null,
	lastFetched: null,
};

// Async thunk to fetch content
export const fetchContent = createAsyncThunk(
	'content/fetchContent',
	async (_, { rejectWithValue }) => {
		try {
			const response = await fetch('/content.json');
			if (!response.ok) {
				throw new Error('Failed to fetch content');
			}
			const data = await response.json();
			return data;
		} catch (error) {
			return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
		}
	}
);

const contentSlice = createSlice({
	name: 'content',
	initialState,
	reducers: {
		updateGreeting: (state, action: PayloadAction<{ hello?: string; userName?: string }>) => {
			if (state.content) {
				state.content.greeting = {
					...state.content.greeting,
					...action.payload,
				};
			}
		},
		addFeature: (state, action: PayloadAction<Feature>) => {
			if (state.content) {
				state.content.features.items.push(action.payload);
			}
		},
		updateFeature: (state, action: PayloadAction<{ id: string; updates: Partial<Feature> }>) => {
			if (state.content) {
				const index = state.content.features.items.findIndex((f) => f.id === action.payload.id);
				if (index !== -1) {
					state.content.features.items[index] = {
						...state.content.features.items[index],
						...action.payload.updates,
					};
				}
			}
		},
		deleteFeature: (state, action: PayloadAction<string>) => {
			if (state.content) {
				state.content.features.items = state.content.features.items.filter(
					(f) => f.id !== action.payload
				);
			}
		},
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchContent.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchContent.fulfilled, (state, action) => {
				state.loading = false;
				state.content = action.payload;
				state.lastFetched = Date.now();
				state.error = null;
			})
			.addCase(fetchContent.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const { updateGreeting, addFeature, updateFeature, deleteFeature, clearError } =
	contentSlice.actions;

export default contentSlice.reducer;
