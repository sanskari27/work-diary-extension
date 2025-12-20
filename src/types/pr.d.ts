export type PRStatus = 'open' | 'draft' | 'merged' | 'closed';

export type ReviewState = 'awaiting_review' | 'changes_requested' | 'approved' | 'comments';

export type CiStatus = 'pending' | 'success' | 'failure' | 'error' | 'unknown';

export interface PullRequest {
	id: string; // global unique id (e.g. `${repoFullName}#${number}`)
	prUrl: string;
	number: number;
	title: string;
	repoFullName: string;
	headBranch: string;
	headSha: string;
	baseBranch: string;
	baseSha: string;
	status: PRStatus;
	reviewState: ReviewState;
	updatedAt: string; // ISO string
	author: string;
	ciStatus?: CiStatus;
}
