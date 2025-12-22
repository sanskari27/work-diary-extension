import { getPrsForRepos } from '@/services/GitHubService';
import {
	mergePrs,
	setError,
	setLastSyncedAt,
	setLoading,
	setPrsInRepo,
} from '@/store/slices/prsSlice';
import type { AppDispatch, RootState } from '@/store/store';

/**
 * Extracts the repo full name (owner/repo) from a GitHub repository link
 * Supports various formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - git@github.com:owner/repo.git
 * - github.com/owner/repo
 */
const extractRepoFullName = (repoLink: string): string | null => {
	try {
		// Handle git@github.com:owner/repo.git format
		if (repoLink.startsWith('git@')) {
			const match = repoLink.match(/git@[^:]+:(.+?)(?:\.git)?$/);
			return match ? match[1] : null;
		}

		// Handle https:// or http:// URLs
		const url = new URL(repoLink.startsWith('http') ? repoLink : `https://${repoLink}`);
		const pathParts = url.pathname.split('/').filter(Boolean);

		if (pathParts.length >= 2) {
			const owner = pathParts[0];
			const repo = pathParts[1].replace(/\.git$/, '');
			return `${owner}/${repo}`;
		}

		return null;
	} catch {
		return null;
	}
};

export const fetchPrReport =
	(background = false) =>
	async (dispatch: AppDispatch, getState: () => RootState) => {
		const state = getState();
		const { githubSettings, templates } = state.settings;

		if (!githubSettings.username || !githubSettings.personalAccessToken) {
			dispatch(setError('GitHub username or token not configured'));
			return;
		}

		// Show loading state only on initial load (not background refresh)
		if (!background) {
			dispatch(setLoading(true));
			dispatch(setPrsInRepo([])); // Clear existing PRs at start
		}
		// For background refresh, keep existing PRs visible and merge updates incrementally

		try {
			// Extract repo full names from repo links
			const repoFullNames = templates
				.map((t) => extractRepoFullName(t.repoLink))
				.filter((name): name is string => name !== null);

			if (repoFullNames.length === 0) {
				dispatch(setError('No valid repository links found in templates'));
				if (!background) {
					dispatch(setLoading(false));
				}
				return;
			}

			let hasRateLimit = false;

			// Fetch PRs for all repositories with callback-based progress
			// Each repo's PRs are merged immediately as they're fetched
			const { rateLimited } = await getPrsForRepos(
				githubSettings.personalAccessToken,
				githubSettings.username,
				repoFullNames,
				(newPrs, rateLimited) => {
					// Merge new PRs immediately as they come in (incremental updates)
					dispatch(mergePrs(newPrs));

					// Track rate limit status
					if (rateLimited) {
						hasRateLimit = true;
						dispatch(setError('Rate limited. Please try again later.'));
					}
				}
			);

			// Final rate limit check
			if (rateLimited || hasRateLimit) {
				dispatch(setError('Rate limited. Please try again later.'));
			} else {
				// Only clear error on successful completion if it was a rate limit error
				if (!background) {
					dispatch(setError(null));
				}
			}

			dispatch(setLastSyncedAt(new Date().toISOString()));
			if (!background) {
				dispatch(setLoading(false));
			}
		} catch (error) {
			console.error('Error fetching PR report:', error);
			dispatch(setError('Failed to fetch PR report.'));
			if (!background) {
				dispatch(setLoading(false));
			}
		}
	};
