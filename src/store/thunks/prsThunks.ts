import { getPrsForReposGraphQL } from '@/services/GitHubService';
import { setError, setLastSyncedAt, setLoading, setPrsInRepo } from '@/store/slices/prsSlice';
import type { AppDispatch, RootState } from '@/store/store';

export const fetchPrReport = () => async (dispatch: AppDispatch, getState: () => RootState) => {
	const state = getState();
	const { githubSettings, templates } = state.settings;

	if (!githubSettings.username || !githubSettings.personalAccessToken) {
		dispatch(setError('GitHub username or token not configured'));
		return;
	}

	dispatch(setLoading(true));

	try {
		// Fetch PRs for all repositories using GraphQL
		const { prs, rateLimited } = await getPrsForReposGraphQL({
			token: githubSettings.personalAccessToken,
			repoFullNames: templates.map((t) => `${githubSettings.username}/${t.repoName}`),
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
