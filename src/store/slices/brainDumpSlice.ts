import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

export interface BrainDumpEntry {
	id: string;
	content: string;
	timestamp: number;
}

interface BrainDumpState {
	entries: BrainDumpEntry[];
}

const initialState: BrainDumpState = {
	entries: [],
};

const brainDumpSlice = createSlice({
	name: 'brainDump',
	initialState,
	reducers: {
		addEntry: (state, action: PayloadAction<{ content: string }>) => {
			const newEntry: BrainDumpEntry = {
				id: nanoid(),
				content: action.payload.content.trim(),
				timestamp: Date.now(),
			};
			state.entries.unshift(newEntry);
		},

		updateEntry: (
			state,
			action: PayloadAction<{ id: string; updates: Partial<BrainDumpEntry> }>
		) => {
			const index = state.entries.findIndex((e) => e.id === action.payload.id);
			if (index !== -1) {
				state.entries[index] = {
					...state.entries[index],
					...action.payload.updates,
				};
			}
		},

		deleteEntry: (state, action: PayloadAction<string>) => {
			state.entries = state.entries.filter((e) => e.id !== action.payload);
		},

		setEntries: (state, action: PayloadAction<BrainDumpEntry[]>) => {
			state.entries = action.payload;
		},
	},
});

export const { addEntry, updateEntry, deleteEntry, setEntries } = brainDumpSlice.actions;
export default brainDumpSlice.reducer;
