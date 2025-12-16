import { StatusAlert, Text } from '@/components/atoms';
import { PrCard } from '@/components/organisms';
import { PageLayout } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { useAppearanceStyles } from '@/hooks/useAppearanceStyles';
import useAutoRefresh from '@/hooks/useAutoRefresh';
import { formatRelativeTime } from '@/lib/dateUtils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAllPrs, selectPinnedPrsMap, togglePin } from '@/store/slices/prsSlice';
import { fetchPrReport } from '@/store/thunks/prsThunks';
import { motion } from 'framer-motion';
import { GitPullRequest } from 'lucide-react';
import { useCallback } from 'react';

const ActivePrsPage = () => {
	const dispatch = useAppDispatch();
	const { appearance, page: spacing } = useAppearanceStyles();
	const { isLoading, error, lastSyncedAt } = useAppSelector((state) => state.prs);
	const githubSettings = useAppSelector((state) => state.settings.githubSettings || {});
	const prsToRender = useAppSelector(selectAllPrs);
	const pinnedPrsMap = useAppSelector(selectPinnedPrsMap);

	const handleRefresh = useCallback(() => {
		if (!githubSettings.username || !githubSettings.personalAccessToken) {
			return;
		}
		dispatch(fetchPrReport());
	}, [dispatch, githubSettings.username, githubSettings.personalAccessToken]);

	useAutoRefresh({
		minutes: githubSettings.prRefreshIntervalMinutes,
		callback: handleRefresh,
	});

	// // Initial fetch on page load if GitHub is configured
	// useEffect(() => {
	// 	if (githubSettings.username && githubSettings.personalAccessToken) {
	// 		dispatch(fetchPrReport());
	// 	}
	// }, [dispatch, githubSettings.username, githubSettings.personalAccessToken]);

	// // Auto-refresh scheduler with simple backoff on rate-limit errors
	// const backoffMultiplierRef = useRef(1);

	// useEffect(() => {
	// 	if (!githubSettings.username || !githubSettings.personalAccessToken) {
	// 		return;
	// 	}

	// 	const baseMinutes = githubSettings.prRefreshIntervalMinutes || 10;

	// 	const scheduleRefresh = () => {
	// 		const intervalMinutes = baseMinutes * backoffMultiplierRef.current;
	// 		const intervalMs = intervalMinutes * 60 * 1000;

	// 		const id = window.setInterval(() => {
	// 			dispatch(fetchPrReport()).then(() => {
	// 				// On successful refresh, reset backoff
	// 				if (!error) {
	// 					backoffMultiplierRef.current = 1;
	// 				}
	// 			});
	// 		}, intervalMs);

	// 		return id;
	// 	};

	// 	const intervalId = scheduleRefresh();

	// 	return () => {
	// 		window.clearInterval(intervalId);
	// 	};
	// }, [
	// 	dispatch,
	// 	githubSettings.username,
	// 	githubSettings.personalAccessToken,
	// 	githubSettings.prRefreshIntervalMinutes,
	// 	error,
	// ]);

	const handleTogglePin = (id: string) => {
		dispatch(togglePin(id));
	};

	const showSetupState =
		!githubSettings.username ||
		!githubSettings.personalAccessToken ||
		!githubSettings.username.trim();

	const formattedLastSynced = lastSyncedAt ? formatRelativeTime(lastSyncedAt) : null;

	return (
		<PageLayout>
			<div className={`min-h-screen ${spacing.padding} flex flex-col`}>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className='max-w-6xl mx-auto w-full flex-1 flex flex-col gap-6'
				>
					{/* Header */}
					<div className='flex items-center justify-between gap-4'>
						<div className='flex items-center gap-4'>
							{!appearance.minimalMode && (
								<motion.div
									animate={{
										rotate: [0, 8, -8, 0],
										scale: [1, 1.05, 1],
									}}
									transition={{
										duration: 3,
										repeat: Infinity,
										ease: 'easeInOut',
									}}
									className={`${
										appearance.compactMode ? 'p-3' : 'p-4'
									} rounded-2xl bg-icon-gradient`}
								>
									<GitPullRequest className='w-7 h-7 text-white' />
								</motion.div>
							)}
							<div className='space-y-1'>
								<Text
									variant='h1'
									className={`${spacing.titleSize} font-black bg-clip-text text-transparent bg-gradient-text`}
								>
									Active PRs
								</Text>
								{formattedLastSynced && (
									<p className='text-xs text-text-secondary'>
										Last synced <span className='font-medium'>{formattedLastSynced}</span>
									</p>
								)}
							</div>
						</div>

						<Button variant='gradient' size='sm' onClick={handleRefresh} disabled={isLoading}>
							{isLoading ? 'Refreshing…' : 'Refresh now'}
						</Button>
					</div>

					{/* Setup state */}
					{showSetupState && (
						<StatusAlert
							type='error'
							message='Configure your GitHub username and personal access token in Settings → GitHub to start tracking your active PRs.'
						/>
					)}

					{/* Error state */}
					{error && !showSetupState && (
						<StatusAlert type='error' message={error} className='mt-2' />
					)}

					{/* Content */}
					<div className='flex-1 mt-2'>
						{isLoading && prsToRender.length === 0 ? (
							<div className='flex items-center justify-center h-64'>
								<p className='text-text-secondary'>Loading your pull requests…</p>
							</div>
						) : prsToRender.length > 0 ? (
							<div className='space-y-3'>
								{prsToRender.map((pr) => (
									<PrCard
										key={pr.id}
										pr={pr}
										isPinned={pinnedPrsMap.has(pr.id)}
										onTogglePin={handleTogglePin}
									/>
								))}
							</div>
						) : (
							<div className='glass-strong rounded-3xl p-10 border border-white/20 flex items-center justify-center'>
								<div className='text-center space-y-3 max-w-md'>
									<Text variant='h3' className='text-text-primary font-semibold'>
										No pull requests to show
									</Text>
									<p className='text-sm text-text-secondary'>
										Once you open pull requests in the repositories configured under your templates,
										they&apos;ll automatically appear here.
									</p>
								</div>
							</div>
						)}
					</div>
				</motion.div>
			</div>
		</PageLayout>
	);
};

export default ActivePrsPage;
