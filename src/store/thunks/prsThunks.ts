import { getPrsForReposGraphQL } from '@/services/GitHubService';
import { setError, setLastSyncedAt, setLoading, setPrsInRepo } from '@/store/slices/prsSlice';
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

export const fetchPrReport = () => async (dispatch: AppDispatch, getState: () => RootState) => {
	const state = getState();
	const { githubSettings, templates } = state.settings;

	if (!githubSettings.username || !githubSettings.personalAccessToken) {
		dispatch(setError('GitHub username or token not configured'));
		return;
	}

	dispatch(setLoading(true));

	try {
		// Extract repo full names from repo links
		const repoFullNames = templates
			.map((t) => extractRepoFullName(t.repoLink))
			.filter((name): name is string => name !== null);

		if (repoFullNames.length === 0) {
			dispatch(setError('No valid repository links found in templates'));
			dispatch(setLoading(false));
			return;
		}

		// Fetch PRs for all repositories using GraphQL
		const { prs, rateLimited } = await getPrsForReposGraphQL({
			token: githubSettings.personalAccessToken,
			author: githubSettings.username,
			repoFullNames,
		});

		if (rateLimited) {
			dispatch(setError('Rate limited. Please try again later.'));
		}

		dispatch(setPrsInRepo(prs));
		dispatch(setLastSyncedAt(new Date().toISOString()));
		dispatch(setError(null));
		dispatch(setLoading(false));
	} catch (error) {
		console.error('Error fetching PR report:', error);
		dispatch(setError('Failed to fetch PR report.'));
		dispatch(setLoading(false));
	}
};
