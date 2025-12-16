import {
	fetchPRReviewAndStatus,
	fetchPullRequestDetails,
	getPrsForRepos,
	GitHubPullRequest,
} from '@/services/GitHubService';
import {
	PullRequest,
	selectAllPrs,
	setError,
	setLastSyncedAt,
	setLoading,
	setPinnedPrs,
	setPrsInRepo,
	updatePullRequest,
} from '@/store/slices/prsSlice';
import type { AppDispatch, RootState } from '@/store/store';

const mapGitHubPullRequestResponse = (pr: GitHubPullRequest): PullRequest => ({
	id: `${pr.base.repo.full_name}#${pr.number}`,
	url: pr.url,
	number: pr.number,
	title: pr.title,
	repoFullName: pr.base.repo.full_name,
	htmlUrl: pr.html_url,
	head: {
		ref: pr.head.ref,
		sha: pr.head.sha,
	},
	base: {
		ref: pr.base.ref,
		sha: pr.base.sha,
	},
	status: pr.state,
	reviewState: 'awaiting_review',
	updatedAt: pr.updated_at,
	author: pr.user.login,
	ciStatus: 'unknown',
});

export const fetchPrReport = () => async (dispatch: AppDispatch, getState: () => RootState) => {
	let state = getState();
	const { githubSettings, templates } = state.settings;

	if (!githubSettings.username || !githubSettings.personalAccessToken) {
		dispatch(setError('GitHub username or token not configured'));
		return;
	}

	dispatch(setLoading(true));

	let records: PullRequest[] = [];
	try {
		const pinnedPrsPromises = state.prs.pinnedPrs.map(async (pr) => {
			return fetchPullRequestDetails({
				token: githubSettings.personalAccessToken,
				repoFullName: pr.repoFullName,
				number: pr.number,
			});
		});
		const prsPromises = getPrsForRepos({
			token: githubSettings.personalAccessToken,
			repoFullNames: templates.map((t) => `${githubSettings.username}/${t.repoName}`),
		});

		const [pinnedPrs, prs] = await Promise.all([await Promise.all(pinnedPrsPromises), prsPromises]);

		records = prs.map(mapGitHubPullRequestResponse);
		const pinnedPrsRecords = pinnedPrs.map(mapGitHubPullRequestResponse);
		dispatch(setPrsInRepo(records));
		dispatch(setPinnedPrs(pinnedPrsRecords));
		dispatch(setLastSyncedAt(new Date().toISOString()));
		dispatch(setError(null));
		dispatch(setLoading(false));
	} catch (error) {
		console.error('Error fetching PR report:', error);
		dispatch(setError('Failed to fetch PR report.'));
	}

	state = getState();
	const allPrs = selectAllPrs(state);

	if (allPrs.length === 0) {
		return;
	}

	const reviewsAndStatusesPromises = allPrs.map(async (pr) => {
		const { reviewState, ciStatus, rateLimited } = await fetchPRReviewAndStatus({
			token: githubSettings.personalAccessToken,
			repoFullName: pr.repoFullName,
			number: pr.number,
			headSha: pr.head?.sha,
		});
		if (rateLimited) {
			return;
		}
		dispatch(
			updatePullRequest({
				id: pr.id,
				updates: { reviewState, ciStatus },
			})
		);
	});

	try {
		await Promise.all(reviewsAndStatusesPromises);
	} catch (error) {
		console.error('Error fetching reviews and statuses:', error);
		dispatch(setError('Failed to fetch reviews and statuses.'));
	}
};
