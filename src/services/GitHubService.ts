import type {
	CiStatus,
	PullRequest,
	PullRequestStatus,
	ReviewState,
} from '@/store/slices/prsSlice';

export interface FetchAuthoredPullRequestsParams {
	token: string;
	username: string;
	repos: string[]; // full names e.g. org/repo
	since?: string | null; // ISO timestamp
	pinnedPrIds?: string[]; // PR IDs that are pinned (to fetch even if closed/merged)
}

export interface FetchAuthoredPullRequestsResult {
	prs: PullRequest[];
	latestUpdatedAt: string | null;
	rateLimited: boolean;
}

const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubPullRequest {
	url: string;
	html_url: string;
	number: number;
	state: 'open' | 'closed';
	locked: boolean;
	title: string;
	user: { login: string };
	created_at: string;
	merged_at: string | null;
	updated_at: string;
	draft: boolean;
	head: {
		ref: string;
		sha: string;
		repo: {
			full_name: string;
		};
	};
	base: {
		ref: string;
		sha: string;
		repo: {
			full_name: string;
		};
	};
}

interface GitHubReview {
	state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | string;
	submitted_at: string | null;
}

interface GitHubCombinedStatus {
	state: 'success' | 'pending' | 'failure' | 'error';
}

const mapStatus = (pr: GitHubPullRequest): PullRequestStatus => {
	if (pr.merged_at) return 'merged';
	if (pr.state === 'closed') return 'closed';
	if (pr.draft) return 'draft';
	return 'open';
};

const mapReviewState = (reviews: GitHubReview[]): ReviewState => {
	if (!reviews.length) return 'awaiting_review';

	// Use the latest submitted review
	const latest = [...reviews]
		.filter((r) => r.submitted_at)
		.sort(
			(a, b) =>
				new Date(b.submitted_at as string).getTime() - new Date(a.submitted_at as string).getTime()
		)[0];

	if (!latest) return 'awaiting_review';

	if (latest.state === 'APPROVED') return 'approved';
	if (latest.state === 'CHANGES_REQUESTED') return 'changes_requested';
	if (latest.state === 'COMMENTED') return 'comments';
	return 'awaiting_review';
};

const mapCiStatus = (status: GitHubCombinedStatus | null): CiStatus => {
	if (!status) return 'unknown';
	if (status.state === 'success') return 'success';
	if (status.state === 'pending') return 'pending';
	if (status.state === 'failure') return 'failure';
	if (status.state === 'error') return 'error';
	return 'unknown';
};

async function githubFetch(
	url: string,
	token: string
): Promise<{ response: any; rateLimited: boolean }> {
	const res = await fetch(url, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
		},
	});

	const remaining = res.headers.get('X-RateLimit-Remaining');
	const rateLimited = res.status === 403 && remaining === '0';

	if (!res.ok) {
		throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
	}

	const response = await res.json();

	return { response, rateLimited };
}

interface GetPrsForRepoParams {
	token: string;
	repoFullName: string;
}

export async function getPrsForRepo(params: GetPrsForRepoParams): Promise<GitHubPullRequest[]> {
	const { token, repoFullName } = params;

	let page = 1;
	let prs: GitHubPullRequest[] = [];
	do {
		const url = `${GITHUB_API_BASE}/repos/${repoFullName}/pulls?state=open&sort=updated&direction=desc&per_page=50&page=${page}`;
		const { response, rateLimited } = await githubFetch(url, token);

		if (rateLimited) {
			throw new Error('Rate limited');
		}

		prs.push(...response);
		page += 1;
		if (response.length < 50) {
			break;
		}
	} while (true);

	return prs;
}

interface GetPrsForReposParams {
	token: string;
	repoFullNames: string[];
}

export async function getPrsForRepos(params: GetPrsForReposParams): Promise<GitHubPullRequest[]> {
	const { token, repoFullNames } = params;

	const prs = await Promise.all(
		repoFullNames.map(async (repoFullName) => getPrsForRepo({ token, repoFullName }))
	);

	return prs.flat();
}

interface FetchPullRequestDetailsParams {
	token: string;
	repoFullName: string;
	number: number;
	headSha?: string;
}

interface FetchPullRequestDetailsResult {
	reviewState: ReviewState;
	ciStatus: CiStatus;
	rateLimited: boolean;
}

export async function fetchPRReviewAndStatus(
	params: FetchPullRequestDetailsParams
): Promise<FetchPullRequestDetailsResult> {
	const { token, repoFullName, number, headSha } = params;

	let hitRateLimit = false;
	const reviewsUrl = `${GITHUB_API_BASE}/repos/${repoFullName}/pulls/${number}/reviews`;
	const statusUrl = headSha && `${GITHUB_API_BASE}/repos/${repoFullName}/commits/${headSha}/status`;

	const [reviewsResult, statusResult] = await Promise.all([
		githubFetch(reviewsUrl, token),
		statusUrl ? githubFetch(statusUrl, token) : Promise.resolve<any>(null),
	]);

	let reviews: GitHubReview[] = [];
	if (reviewsResult.rateLimited) {
		hitRateLimit = true;
	} else if (reviewsResult.response) {
		reviews = reviewsResult.response as GitHubReview[];
	}

	let ciStatus: CiStatus = 'unknown';
	if (statusResult) {
		if (statusResult.rateLimited) {
			hitRateLimit = true;
		} else if (statusResult.response) {
			const statusData = statusResult.response as GitHubCombinedStatus;
			if (statusResult.total_count > 0) {
				ciStatus = mapCiStatus(statusData);
			}
		}
	}

	const reviewState = mapReviewState(reviews);

	return {
		reviewState,
		ciStatus,
		rateLimited: hitRateLimit,
	};
}

interface FetchPullRequestDetails {
	token: string;
	repoFullName: string;
	number: number;
}

export async function fetchPullRequestDetails(
	params: FetchPullRequestDetails
): Promise<GitHubPullRequest> {
	const { token, repoFullName, number } = params;

	const url = `${GITHUB_API_BASE}/repos/${repoFullName}/pulls/${number}`;
	const { response, rateLimited } = await githubFetch(url, token);

	if (rateLimited) {
		throw new Error('Rate limited');
	}

	return response as GitHubPullRequest;
}