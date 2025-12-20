import type { CiStatus, PRStatus, PullRequest, ReviewState } from '@/types/pr.d';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Re-export types for backward compatibility
export type { CiStatus, PullRequest, PRStatus as PullRequestStatus, ReviewState };

interface PrsState {
	prsInRepo: PullRequest[];
	isLoading: boolean;
	error: string | null;
	lastSyncedAt: string | null;
}

const initialState: PrsState = {
	prsInRepo: [],
	isLoading: false,
	error: null,
	lastSyncedAt: null,
};

const prsSlice = createSlice({
	name: 'prs',
	initialState,
	reducers: {
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},

		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},

		setLastSyncedAt: (state, action: PayloadAction<string | null>) => {
			state.lastSyncedAt = action.payload;
		},

		setPrsInRepo: (state, action: PayloadAction<PullRequest[]>) => {
			state.prsInRepo = action.payload;
		},

		updatePullRequest: (
			state,
			action: PayloadAction<{ id: string; updates: Partial<PullRequest> }>
		) => {
			state.prsInRepo = state.prsInRepo.map((p) =>
				p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
			);
		},
	},
});

export const { setLoading, setError, setLastSyncedAt, setPrsInRepo, updatePullRequest } =
	prsSlice.actions;

export default prsSlice.reducer;

// Helpers

const sortByUpdatedAtDesc = (items: PullRequest[]) =>
	[...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

// Base selectors
const selectPrsInRepoRaw = (state: RootState) => state.prs.prsInRepo;

// Memoized selectors
export const selectActivePrs = createSelector([selectPrsInRepoRaw], (prsInRepo) =>
	sortByUpdatedAtDesc(prsInRepo || [])
);

export const selectAllPrs = createSelector([selectPrsInRepoRaw], (prsInRepo) =>
	sortByUpdatedAtDesc(prsInRepo || [])
);
