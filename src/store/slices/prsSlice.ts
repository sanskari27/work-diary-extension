import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export type PullRequestStatus = 'open' | 'draft' | 'merged' | 'closed';

export type ReviewState = 'awaiting_review' | 'changes_requested' | 'approved' | 'comments';

export type CiStatus = 'pending' | 'success' | 'failure' | 'error' | 'unknown';

export interface PullRequest {
	id: string; // global unique id (e.g. `${repoFullName}#${number}`)
	url: string;
	number: number;
	title: string;
	repoFullName: string;
	htmlUrl: string;
	head?: {
		ref: string;
		sha: string;
	};
	base?: {
		ref: string;
		sha: string;
	};
	status: PullRequestStatus;
	reviewState: ReviewState;
	updatedAt: string; // ISO string
	author: string;
	ciStatus?: CiStatus;
}

interface PrsState {
	prsInRepo: PullRequest[];
	isLoading: boolean;
	error: string | null;
	lastSyncedAt: string | null;
	pinnedPrs: PullRequest[];
}

const initialState: PrsState = {
	prsInRepo: [],
	isLoading: false,
	error: null,
	lastSyncedAt: null,
	pinnedPrs: [],
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
		setPinnedPrs: (state, action: PayloadAction<PullRequest[]>) => {
			state.pinnedPrs = action.payload;
		},

		togglePin: (state, action: PayloadAction<string>) => {
			const pr = state.pinnedPrs.find((p) => p.id === action.payload);
			if (pr) {
				state.pinnedPrs = state.pinnedPrs.filter((p) => p.id !== action.payload);
			} else {
				state.pinnedPrs = [
					state.prsInRepo.find((p) => p.id === action.payload)!,
					...state.pinnedPrs,
				];
			}
		},

		updatePullRequest: (
			state,
			action: PayloadAction<{ id: string; updates: Partial<PullRequest> }>
		) => {
			// Check if the PR is pinned and update it if it is pinned, otherwise update the PR in the repo
			state.pinnedPrs = state.pinnedPrs.map((p) =>
				p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
			);
			state.prsInRepo = state.prsInRepo.map((p) =>
				p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
			);
		},
	},
});

export const {
	setLoading,
	setError,
	setLastSyncedAt,
	setPrsInRepo,
	setPinnedPrs,
	togglePin,
	updatePullRequest,
} = prsSlice.actions;

export default prsSlice.reducer;

// Helpers

const sortByUpdatedAtDesc = (items: PullRequest[]) =>
	[...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

// Base selectors
const selectPinnedPrsRaw = (state: RootState) => state.prs.pinnedPrs;
const selectPrsInRepoRaw = (state: RootState) => state.prs.prsInRepo;

// Memoized selectors
export const selectPinnedPrs = createSelector([selectPinnedPrsRaw], (pinnedPrs) =>
	sortByUpdatedAtDesc(pinnedPrs || [])
);

export const selectActivePrs = createSelector([selectPrsInRepoRaw], (prsInRepo) =>
	sortByUpdatedAtDesc(prsInRepo || [])
);

export const selectAllPrs = createSelector(
	[selectPinnedPrsRaw, selectPrsInRepoRaw],
	(pinnedPrs, prsInRepo) =>
		sortByUpdatedAtDesc([...(pinnedPrs || []), ...(prsInRepo || [])]).filter(
			(p, index, self) => index === self.findIndex((t) => t.id === p.id)
		)
);

export const selectPinnedPrsMap = createSelector([selectPinnedPrsRaw], (pinnedPrs) => {
	const map = new Map<string, PullRequest>();
	pinnedPrs.forEach((p) => {
		map.set(p.id, p);
	});
	return map;
});
