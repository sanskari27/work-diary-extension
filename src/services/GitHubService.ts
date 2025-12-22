import type { PRStatus, PullRequest, ReviewState } from '@/types/pr.d';

// Constants
const GITHUB_REST_API = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Start with 1 second delay
const MAX_PR_PER_REPO = 30;
const CONCURRENCY_LIMIT = 5; // parallel repo processing
const PER_PAGE = 100;

// REST API Types
interface GitHubPullRequest {
	number: number;
	title: string;
	html_url: string;
	state: 'open' | 'closed';
	draft: boolean;
	updated_at: string;
	merged_at: string | null;
	user: {
		login: string;
	} | null;
	head: {
		ref: string;
		sha: string;
	};
	base: {
		ref: string;
		sha: string;
	};
}

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Robust API request wrapper with timeout and retry logic
async function githubApiRequest(
	url: string,
	token: string,
	retryCount = 0
): Promise<{ data: any; rateLimited: boolean }> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const res = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
			},
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		const remaining = res.headers.get('X-RateLimit-Remaining');
		const rateLimited = res.status === 403 && remaining === '0';

		if (!res.ok) {
			// Retry on server errors (5xx) or timeout-like errors
			if ((res.status >= 500 || res.status === 408) && retryCount < MAX_RETRIES) {
				const delayMs = RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
				await delay(delayMs);
				return githubApiRequest(url, token, retryCount + 1);
			}
			throw new Error(`REST API request failed: ${res.statusText}`);
		}

		const data = await res.json();
		return { data, rateLimited };
	} catch (error: any) {
		clearTimeout(timeoutId);

		// Retry on timeout or network errors
		if (
			(error.name === 'AbortError' ||
				error.message?.includes('timeout') ||
				error.message?.includes('network')) &&
			retryCount < MAX_RETRIES
		) {
			const delayMs = RETRY_DELAY_MS * Math.pow(2, retryCount);
			await delay(delayMs);
			return githubApiRequest(url, token, retryCount + 1);
		}

		throw error;
	}
}

// Map REST API PR status to our PRStatus type
const mapRestStatus = (
	state: 'open' | 'closed',
	isDraft: boolean,
	mergedAt: string | null
): PRStatus => {
	if (mergedAt) return 'merged';
	if (state === 'closed') return 'closed';
	if (isDraft) return 'draft';
	return 'open';
};

// Map REST API PR to ReviewState (default to awaiting_review, skip fetching)
const mapRestReviewState = (): ReviewState => {
	return 'awaiting_review';
};

// Map REST API PR to PullRequest
const mapGitHubPrToPullRequest = (pr: GitHubPullRequest, repoFullName: string): PullRequest => {
	return {
		id: `${repoFullName}#${pr.number}`,
		prUrl: pr.html_url,
		number: pr.number,
		title: pr.title,
		repoFullName,
		headBranch: pr.head.ref,
		headSha: pr.head.sha,
		baseBranch: pr.base.ref,
		baseSha: pr.base.sha,
		status: mapRestStatus(pr.state, pr.draft, pr.merged_at),
		reviewState: mapRestReviewState(),
		updatedAt: pr.updated_at,
		author: pr.user?.login || 'unknown',
		ciStatus: undefined, // Skip fetching CI status
	};
};

// Helper function to check if a PR's updatedAt is within the last month
const isWithinLastMonth = (updatedAt: string): boolean => {
	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
	const updatedDate = new Date(updatedAt);
	return updatedDate >= oneMonthAgo;
};

// Helper function to check if a PR was merged/closed within the last day
const isRecentlyMergedOrClosed = (pr: GitHubPullRequest): boolean => {
	// If it's OPEN, always include it (as long as it's within last month, checked separately)
	if (pr.state === 'open') {
		return true;
	}

	// For CLOSED, check if mergedAt or updatedAt is within the last 24 hours
	const oneDayAgo = new Date();
	oneDayAgo.setHours(oneDayAgo.getHours() - 24);

	// Check mergedAt first (for merged PRs)
	if (pr.merged_at) {
		const mergedDate = new Date(pr.merged_at);
		if (mergedDate >= oneDayAgo) {
			return true;
		}
	}

	// For closed (not merged) PRs, check updatedAt
	if (pr.state === 'closed' && !pr.merged_at) {
		const updatedDate = new Date(pr.updated_at);
		if (updatedDate >= oneDayAgo) {
			return true;
		}
	}

	return false;
};

// Fetch PRs for a single repository with pagination and early stopping
async function fetchPrsForRepo(
	token: string,
	repoFullName: string,
	author: string
): Promise<{ prs: PullRequest[]; rateLimited: boolean }> {
	const [owner, name] = repoFullName.split('/');

	if (!owner || !name) {
		throw new Error(`Invalid repo full name: ${repoFullName}`);
	}

	const prs: PullRequest[] = [];
	let page = 1;
	let rateLimited = false;
	let totalPrsChecked = 0; // Track total PRs checked (before author filtering)

	// Continue until we've checked MAX_PR_PER_REPO total PRs from the repo
	while (totalPrsChecked < MAX_PR_PER_REPO) {
		// Build URL with query parameters (no author filter - we'll filter client-side)
		const params = new URLSearchParams({
			state: 'all', // Get all states (open, closed)
			per_page: PER_PAGE.toString(),
			page: page.toString(),
			sort: 'updated',
			direction: 'desc',
		});

		const url = `${GITHUB_REST_API}/repos/${owner}/${name}/pulls?${params.toString()}`;

		const { data, rateLimited: limited } = await githubApiRequest(url, token);

		if (limited) {
			rateLimited = true;
			break;
		}

		if (!Array.isArray(data) || data.length === 0) {
			break;
		}

		// Filter PRs: include all OPEN (within last month), only recent CLOSED/MERGED (within last day)
		let foundOldPR = false;
		for (const pr of data) {
			// Stop if we've checked enough total PRs
			if (totalPrsChecked >= MAX_PR_PER_REPO) {
				break;
			}

			totalPrsChecked++; // Count this PR as checked

			// First check if PR is within the last month - if not, stop paginating
			if (!isWithinLastMonth(pr.updated_at)) {
				foundOldPR = true;
				break; // Stop processing this batch and stop pagination
			}

			// Filter by author
			if (author && pr.user?.login?.toLowerCase() !== author.toLowerCase()) {
				continue; // Skip PRs not by the author, but still count them as checked
			}

			// For OPEN PRs within last month, include them
			if (pr.state === 'open') {
				prs.push(mapGitHubPrToPullRequest(pr, repoFullName));
			}
			// For CLOSED/MERGED, only include if merged/closed within last day
			else if (isRecentlyMergedOrClosed(pr)) {
				prs.push(mapGitHubPrToPullRequest(pr, repoFullName));
			}
		}

		// If we found a PR older than 1 month or checked enough total PRs, stop paginating
		// since results are ordered by UPDATED_AT DESC
		if (foundOldPR || totalPrsChecked >= MAX_PR_PER_REPO) {
			break;
		}

		// If we got fewer results than requested, we've reached the end
		if (data.length < PER_PAGE) {
			break;
		}

		page++;
	}

	return { prs, rateLimited };
}

// Process repos with concurrency control
async function processReposWithConcurrency<T>(
	items: T[],
	concurrency: number,
	processor: (item: T) => Promise<{ prs: PullRequest[]; rateLimited: boolean }>
): Promise<Array<{ prs: PullRequest[]; rateLimited: boolean }>> {
	const results: Array<{ prs: PullRequest[]; rateLimited: boolean }> = [];
	const executing: Set<Promise<void>> = new Set();

	for (const item of items) {
		// Wait if we've reached concurrency limit
		if (executing.size >= concurrency) {
			await Promise.race(executing);
		}

		const promise = processor(item)
			.then((result) => {
				results.push(result);
			})
			.finally(() => {
				executing.delete(promise);
			});

		executing.add(promise);
	}

	// Wait for all remaining promises to complete
	await Promise.all(executing);
	return results;
}

// Main exported function: Get PRs for multiple repositories with callback-based progress
export async function getPrsForRepos(
	token: string,
	author: string,
	repoFullNames: string[],
	onProgress: (prs: PullRequest[], rateLimited: boolean) => void
): Promise<{ rateLimited: boolean }> {
	if (repoFullNames.length === 0) {
		return { rateLimited: false };
	}

	let overallRateLimited = false;

	// Process repos with concurrency control
	const results = await processReposWithConcurrency(
		repoFullNames,
		CONCURRENCY_LIMIT,
		async (repoFullName) => {
			try {
				const result = await fetchPrsForRepo(token, repoFullName, author);

				// Call callback with PRs from this repo as soon as they're fetched
				if (result.prs.length > 0 || result.rateLimited) {
					onProgress(result.prs, result.rateLimited);
				}

				return result;
			} catch (error) {
				console.error(`Error fetching PRs for ${repoFullName}:`, error);
				// Continue with other repos even if one fails
				return { prs: [], rateLimited: false };
			}
		}
	);

	// Determine overall rate limit status
	overallRateLimited = results.some((r) => r.rateLimited);

	return { rateLimited: overallRateLimited };
}
