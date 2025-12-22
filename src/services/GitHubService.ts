import type { CiStatus, PRStatus, PullRequest, ReviewState } from '@/types/pr.d';

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';

// GraphQL Types
interface GraphQLPullRequestNode {
	number: number;
	title: string;
	url: string;
	state: 'OPEN' | 'CLOSED' | 'MERGED';
	isDraft: boolean;
	updatedAt: string;
	mergedAt: string | null;
	author: {
		login: string;
	} | null;
	headRefName: string;
	headRefOid: string;
	baseRefName: string;
	baseRefOid: string;
	reviewDecision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null;
	reviews: {
		nodes: Array<{
			state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING';
			submittedAt: string | null;
		}>;
	};
	commits: {
		nodes: Array<{
			commit: {
				statusCheckRollup: {
					state: 'SUCCESS' | 'PENDING' | 'FAILURE' | 'ERROR' | null;
					contexts: {
						nodes: Array<{
							__typename: string;
							conclusion?:
								| 'SUCCESS'
								| 'FAILURE'
								| 'NEUTRAL'
								| 'CANCELLED'
								| 'SKIPPED'
								| 'TIMED_OUT'
								| 'ACTION_REQUIRED'
								| null;
							status?:
								| 'COMPLETED'
								| 'IN_PROGRESS'
								| 'PENDING'
								| 'QUEUED'
								| 'REQUESTED'
								| 'WAITING'
								| null;
							state?: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'ERROR' | null;
						}>;
					};
				} | null;
			};
		}>;
	};
}

interface GraphQLRepositoryResponse {
	repository: {
		pullRequests: {
			nodes: GraphQLPullRequestNode[];
			pageInfo: {
				hasNextPage: boolean;
				endCursor: string | null;
			};
		};
	} | null;
}

interface GraphQLResponse {
	data: GraphQLRepositoryResponse;
	errors?: Array<{
		message: string;
		type: string;
	}>;
}

const GRAPHQL_QUERY = `
query GetPullRequests($owner: String!, $name: String!, $first: Int!, $after: String) {
  repository(owner: $owner, name: $name) {
    pullRequests(first: $first, after: $after, states: [OPEN, CLOSED, MERGED], orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        number
        title
        url
        state
        isDraft
        updatedAt
        mergedAt
        author {
          login
        }
        headRefName
        headRefOid
        baseRefName
        baseRefOid
        reviewDecision
        reviews(first: 10, states: [APPROVED, CHANGES_REQUESTED, COMMENTED]) {
          nodes {
            state
            submittedAt
          }
        }
        commits(last: 1) {
          nodes {
            commit {
              statusCheckRollup {
                state
                contexts(first: 20) {
                  nodes {
                    ... on CheckRun {
                      conclusion
                      status
                    }
                    ... on StatusContext {
                      state
                    }
                  }
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
`;

// GraphQL Helper Functions
async function githubGraphQLFetch(
	query: string,
	variables: Record<string, any>,
	token: string
): Promise<{ data: any; rateLimited: boolean; errors?: any[] }> {
	const res = await fetch(GITHUB_GRAPHQL_API, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			query,
			variables,
		}),
	});

	const remaining = res.headers.get('X-RateLimit-Remaining');
	const rateLimited = res.status === 403 && remaining === '0';

	if (!res.ok) {
		throw new Error(`GraphQL request failed: ${res.statusText}`);
	}

	const response: GraphQLResponse = await res.json();

	if (response.errors) {
		throw new Error(`GraphQL errors: ${response.errors.map((e) => e.message).join(', ')}`);
	}

	return { data: response.data, rateLimited, errors: response.errors };
}

// Map GraphQL PR status to our PRStatus type
const mapGraphQLStatus = (
	state: 'OPEN' | 'CLOSED' | 'MERGED',
	isDraft: boolean,
	mergedAt: string | null
): PRStatus => {
	if (mergedAt || state === 'MERGED') return 'merged';
	if (state === 'CLOSED') return 'closed';
	if (isDraft) return 'draft';
	return 'open';
};

// Map GraphQL review decision and reviews to ReviewState
const mapGraphQLReviewState = (
	reviewDecision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null,
	reviews: GraphQLPullRequestNode['reviews']['nodes']
): ReviewState => {
	// If reviewDecision is available, use it (more reliable)
	if (reviewDecision === 'APPROVED') return 'approved';
	if (reviewDecision === 'CHANGES_REQUESTED') return 'changes_requested';
	if (reviewDecision === 'REVIEW_REQUIRED') return 'awaiting_review';

	// Fallback to latest review
	if (!reviews.length) return 'awaiting_review';

	const latest = [...reviews]
		.filter((r) => r.submittedAt)
		.sort(
			(a, b) =>
				new Date(b.submittedAt as string).getTime() - new Date(a.submittedAt as string).getTime()
		)[0];

	if (!latest) return 'awaiting_review';

	if (latest.state === 'APPROVED') return 'approved';
	if (latest.state === 'CHANGES_REQUESTED') return 'changes_requested';
	if (latest.state === 'COMMENTED') return 'comments';
	return 'awaiting_review';
};

// Map GraphQL CI status to CiStatus
const mapGraphQLCiStatus = (
	statusCheckRollup: GraphQLPullRequestNode['commits']['nodes'][0]['commit']['statusCheckRollup']
): CiStatus => {
	if (!statusCheckRollup) return 'unknown';

	const rollupState = statusCheckRollup.state;
	if (rollupState === 'SUCCESS') return 'success';
	if (rollupState === 'PENDING') return 'pending';
	if (rollupState === 'FAILURE') return 'failure';
	if (rollupState === 'ERROR') return 'error';

	// If rollup state is null, check individual contexts
	const contexts = statusCheckRollup.contexts.nodes;
	if (!contexts.length) return 'unknown';

	// Check if any are pending
	const hasPending = contexts.some(
		(ctx) =>
			ctx.status === 'IN_PROGRESS' ||
			ctx.status === 'PENDING' ||
			ctx.status === 'QUEUED' ||
			ctx.state === 'PENDING'
	);
	if (hasPending) return 'pending';

	// Check if any failed
	const hasFailure = contexts.some(
		(ctx) =>
			ctx.conclusion === 'FAILURE' ||
			ctx.conclusion === 'TIMED_OUT' ||
			ctx.conclusion === 'CANCELLED' ||
			ctx.state === 'FAILURE' ||
			ctx.state === 'ERROR'
	);
	if (hasFailure) return 'failure';

	// Check if all succeeded
	const allSuccess = contexts.every(
		(ctx) =>
			ctx.conclusion === 'SUCCESS' ||
			ctx.conclusion === 'NEUTRAL' ||
			ctx.conclusion === 'SKIPPED' ||
			ctx.state === 'SUCCESS'
	);
	if (allSuccess) return 'success';

	return 'unknown';
};

// Map GraphQL PR node to PullRequest
const mapGraphQLPullRequest = (node: GraphQLPullRequestNode, repoFullName: string): PullRequest => {
	return {
		id: `${repoFullName}#${node.number}`,
		prUrl: node.url,
		number: node.number,
		title: node.title,
		repoFullName,
		headBranch: node.headRefName,
		headSha: node.headRefOid,
		baseBranch: node.baseRefName,
		baseSha: node.baseRefOid,
		status: mapGraphQLStatus(node.state, node.isDraft, node.mergedAt),
		reviewState: mapGraphQLReviewState(node.reviewDecision, node.reviews.nodes),
		updatedAt: node.updatedAt,
		author: node.author?.login || 'unknown',
		ciStatus: mapGraphQLCiStatus(node.commits.nodes[0]?.commit.statusCheckRollup),
	};
};

interface GetPrsForRepoParams {
	token: string;
	repoFullName: string;
	author?: string;
}

// Helper function to check if a PR's updatedAt is within the last month
const isWithinLastMonth = (updatedAt: string): boolean => {
	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
	const updatedDate = new Date(updatedAt);
	return updatedDate >= oneMonthAgo;
};

// Helper function to check if a PR was merged/closed within the last day
const isRecentlyMergedOrClosed = (node: GraphQLPullRequestNode): boolean => {
	// If it's OPEN, always include it (as long as it's within last month, checked separately)
	if (node.state === 'OPEN') {
		return true;
	}

	// For CLOSED/MERGED, check if mergedAt or updatedAt is within the last 24 hours
	const oneDayAgo = new Date();
	oneDayAgo.setHours(oneDayAgo.getHours() - 24);

	// Check mergedAt first (for merged PRs)
	if (node.mergedAt) {
		const mergedDate = new Date(node.mergedAt);
		if (mergedDate >= oneDayAgo) {
			return true;
		}
	}

	// For closed (not merged) PRs, check updatedAt
	if (node.state === 'CLOSED' && !node.mergedAt) {
		const updatedDate = new Date(node.updatedAt);
		if (updatedDate >= oneDayAgo) {
			return true;
		}
	}

	return false;
};

// GraphQL function to get PRs for a single repository with pagination
export async function getPrsForRepoGraphQL(
	params: GetPrsForRepoParams
): Promise<{ prs: PullRequest[]; rateLimited: boolean }> {
	const { token, repoFullName, author } = params;
	const [owner, name] = repoFullName.split('/');

	if (!owner || !name) {
		throw new Error(`Invalid repo full name: ${repoFullName}`);
	}

	const prs: PullRequest[] = [];
	let cursor: string | null = null;
	let hasNextPage = true;
	let rateLimited = false;

	while (hasNextPage && prs.length < 30) {
		const remaining = 30 - prs.length;
		const { data, rateLimited: limited } = await githubGraphQLFetch(
			GRAPHQL_QUERY,
			{
				owner,
				name,
				first: Math.min(remaining * 2, 100), // Fetch more to account for filtering
				after: cursor,
			},
			token
		);

		if (limited) {
			rateLimited = true;
			break;
		}

		if (!data?.repository?.pullRequests) {
			break;
		}

		const { nodes, pageInfo } = data.repository.pullRequests;

		// Filter PRs by author first (if author is specified)
		const authorFilteredNodes = author
			? nodes.filter(
					(node: GraphQLPullRequestNode) =>
						node.author?.login?.toLowerCase() === author.toLowerCase()
			  )
			: nodes;

		// Filter PRs: include all OPEN (within last month), only recent CLOSED/MERGED (within last day)
		let foundOldPR = false;
		for (const node of authorFilteredNodes) {
			// Stop if we've reached 30 PRs
			if (prs.length >= 30) {
				break;
			}

			// First check if PR is within the last month - if not, stop paginating
			if (!isWithinLastMonth(node.updatedAt)) {
				foundOldPR = true;
				break; // Stop processing this batch and stop pagination
			}

			// For OPEN PRs within last month, include them
			if (node.state === 'OPEN') {
				prs.push(mapGraphQLPullRequest(node, repoFullName));
			}
			// For CLOSED/MERGED, only include if merged/closed within last day
			else if (isRecentlyMergedOrClosed(node)) {
				prs.push(mapGraphQLPullRequest(node, repoFullName));
			}
		}

		// If we filtered by author and got no matching results in this batch, continue to next page
		if (author && authorFilteredNodes.length === 0 && nodes.length > 0) {
			hasNextPage = pageInfo.hasNextPage;
			cursor = pageInfo.endCursor;
			continue;
		}

		// If we found a PR older than 1 month or reached 30 PRs, stop paginating
		// since results are ordered by UPDATED_AT DESC
		if (foundOldPR || prs.length >= 30) {
			break;
		}

		// If we got no nodes at all, stop paginating
		if (nodes.length === 0) {
			break;
		}

		hasNextPage = pageInfo.hasNextPage;
		cursor = pageInfo.endCursor;
	}

	return { prs, rateLimited };
}

interface GetPrsForReposParams {
	token: string;
	author: string;
	repoFullNames: string[];
}

// GraphQL function to get PRs for multiple repositories
export async function getPrsForReposGraphQL(
	params: GetPrsForReposParams
): Promise<{ prs: PullRequest[]; rateLimited: boolean }> {
	const { token, repoFullNames, author } = params;

	const results = await Promise.all(
		repoFullNames.map(async (repoFullName) => getPrsForRepoGraphQL({ token, repoFullName, author }))
	);

	const prs = results.flatMap((r) => r.prs);
	const rateLimited = results.some((r) => r.rateLimited);

	return { prs, rateLimited };
}
