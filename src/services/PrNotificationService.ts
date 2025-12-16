import { selectAllPrs, type PullRequest } from '@/store/slices/prsSlice';
import { addNotification } from '@/store/slices/uiSlice';
import type { RootState } from '@/store/store';
import type { Store } from '@reduxjs/toolkit';

type PrStage = 'approved' | 'merged' | 'changes_requested';

interface TrackedPrStageState {
	[prId: string]: {
		approved?: boolean;
		merged?: boolean;
		changes_requested?: boolean;
	};
}

/**
 * Service to watch PR state transitions and emit in-app notifications
 * Notifications are de-duplicated per PR per stage.
 */
export class PrNotificationService {
	private static hasRun = false;
	private store: Store<RootState>;
	private unsubscribe: (() => void) | null = null;
	private stagesByPr: TrackedPrStageState = {};

	constructor(store: Store<RootState>) {
		this.store = store;
	}

	public initialize() {
		if (PrNotificationService.hasRun) {
			return;
		}

		PrNotificationService.hasRun = true;

		// Seed initial state
		this.captureCurrentStages();

		// Subscribe to store updates
		this.unsubscribe = this.store.subscribe(() => {
			this.handleStateChange();
		});
	}

	private captureCurrentStages() {
		const state = this.store.getState();
		const prs = selectAllPrs(state);

		this.stagesByPr = {};
		prs.forEach((pr) => {
			this.stagesByPr[pr.id] = {
				approved: pr.reviewState === 'approved',
				merged: pr.status === 'merged',
				changes_requested: pr.reviewState === 'changes_requested',
			};
		});
	}

	private handleStateChange() {
		const state = this.store.getState();
		const prs = selectAllPrs(state);
		const githubSettings = state.settings.githubSettings;

		const newStagesByPr: TrackedPrStageState = {};

		const maybeNotifyStage = (pr: PullRequest, stage: PrStage) => {
			const previous = this.stagesByPr[pr.id] || {};
			const alreadyNotified = previous[stage];
			const shouldNotify =
				stage === 'approved'
					? githubSettings.notifyOnApproval
					: stage === 'merged'
					? githubSettings.notifyOnMerge
					: githubSettings.notifyOnChangesRequested;

			if (alreadyNotified || !shouldNotify) {
				return;
			}

			let message: string;
			if (stage === 'approved') {
				message = `✅ PR "${pr.title}" was approved`;
			} else if (stage === 'merged') {
				message = `🎉 PR "${pr.title}" was merged`;
			} else {
				message = `✏️ Changes were requested on PR "${pr.title}"`;
			}

			// Mark as notified immediately to prevent duplicate notifications
			// if handleStateChange is called again before the function completes
			if (!this.stagesByPr[pr.id]) {
				this.stagesByPr[pr.id] = {};
			}
			this.stagesByPr[pr.id][stage] = true;

			this.store.dispatch(
				addNotification({
					id: `pr-notification-${pr.id}-${stage}`,
					type: 'info',
					message,
				})
			);
		};

		prs.forEach((pr) => {
			const stages: TrackedPrStageState[string] = {
				approved: pr.reviewState === 'approved',
				merged: pr.status === 'merged',
				changes_requested: pr.reviewState === 'changes_requested' || pr.reviewState === 'comments',
			};
			newStagesByPr[pr.id] = stages;

			if (stages.approved) {
				maybeNotifyStage(pr, 'approved');
			}
			if (stages.merged) {
				maybeNotifyStage(pr, 'merged');
			}
			if (stages.changes_requested) {
				maybeNotifyStage(pr, 'changes_requested');
			}
		});

		this.stagesByPr = newStagesByPr;
	}

	public cleanup() {
		if (this.unsubscribe) {
			this.unsubscribe();
			this.unsubscribe = null;
		}
	}

	public static reset() {
		PrNotificationService.hasRun = false;
	}
}

export function initializePrNotifications(store: Store<RootState>) {
	const service = new PrNotificationService(store);
	service.initialize();
	return service;
}
