import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

export interface Bookmark {
	id: string;
	name: string;
	pageUrl: string;
	createdAt: number;
}

export interface BookmarkGroupItem {
	title: string;
	url: string;
}

export interface BookmarkGroup {
	id: string;
	name: string;
	items: BookmarkGroupItem[];
	createdAt: number;
}

interface BookmarksState {
	bookmarks: Bookmark[];
	groups: BookmarkGroup[];
}

const initialState: BookmarksState = {
	bookmarks: [],
	groups: [],
};

const bookmarksSlice = createSlice({
	name: 'bookmarks',
	initialState,
	reducers: {
		addBookmark: (state, action: PayloadAction<Omit<Bookmark, 'id' | 'createdAt'>>) => {
			// Check if a bookmark with the same URL already exists
			const existingBookmark = state.bookmarks.find(
				(b) => b.pageUrl.toLowerCase() === action.payload.pageUrl.toLowerCase()
			);

			// Only add if the URL doesn't already exist
			if (!existingBookmark) {
				const newBookmark: Bookmark = {
					...action.payload,
					id: nanoid(),
					createdAt: Date.now(),
				};
				state.bookmarks.unshift(newBookmark);
			}
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

		addBookmarkGroup: (state, action: PayloadAction<Omit<BookmarkGroup, 'id' | 'createdAt'>>) => {
			const newGroup: BookmarkGroup = {
				...action.payload,
				id: nanoid(),
				createdAt: Date.now(),
			};
			state.groups.unshift(newGroup);
		},

		updateBookmarkGroup: (
			state,
			action: PayloadAction<{ id: string; updates: Partial<BookmarkGroup> }>
		) => {
			const index = state.groups.findIndex((g) => g.id === action.payload.id);
			if (index !== -1) {
				state.groups[index] = {
					...state.groups[index],
					...action.payload.updates,
				};
			}
		},

		deleteBookmarkGroup: (state, action: PayloadAction<string>) => {
			state.groups = state.groups.filter((g) => g.id !== action.payload);
		},

		setBookmarkGroups: (state, action: PayloadAction<BookmarkGroup[]>) => {
			state.groups = action.payload || [];
		},
	},
});

export const {
	addBookmark,
	updateBookmark,
	deleteBookmark,
	setBookmarks,
	addBookmarkGroup,
	updateBookmarkGroup,
	deleteBookmarkGroup,
	setBookmarkGroups,
} = bookmarksSlice.actions;
export default bookmarksSlice.reducer;
