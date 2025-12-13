import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

export interface Bookmark {
	id: string;
	name: string;
	pageUrl: string;
	createdAt: number;
}

interface BookmarksState {
	bookmarks: Bookmark[];
}

const initialState: BookmarksState = {
	bookmarks: [],
};

const bookmarksSlice = createSlice({
	name: 'bookmarks',
	initialState,
	reducers: {
		addBookmark: (state, action: PayloadAction<Omit<Bookmark, 'id' | 'createdAt'>>) => {
			const newBookmark: Bookmark = {
				...action.payload,
				id: nanoid(),
				createdAt: Date.now(),
			};
			state.bookmarks.unshift(newBookmark);
		},

		updateBookmark: (state, action: PayloadAction<{ id: string; updates: Partial<Bookmark> }>) => {
			const index = state.bookmarks.findIndex((b) => b.id === action.payload.id);
			if (index !== -1) {
				state.bookmarks[index] = {
					...state.bookmarks[index],
					...action.payload.updates,
				};
			}
		},

		deleteBookmark: (state, action: PayloadAction<string>) => {
			state.bookmarks = state.bookmarks.filter((b) => b.id !== action.payload);
		},

		setBookmarks: (state, action: PayloadAction<Bookmark[]>) => {
			state.bookmarks = action.payload;
		},
	},
});

export const { addBookmark, updateBookmark, deleteBookmark, setBookmarks } = bookmarksSlice.actions;
export default bookmarksSlice.reducer;
