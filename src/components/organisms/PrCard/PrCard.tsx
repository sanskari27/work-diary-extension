import { Text } from '@/components/atoms';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppearanceStyles } from '@/hooks/useAppearanceStyles';
import { formatRelativeTime } from '@/lib/dateUtils';
import type { PullRequest } from '@/store/slices/prsSlice';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, GitMerge, GitPullRequest } from 'lucide-react';

interface PrCardProps {
	pr: PullRequest;
}

const getStatusBadgeVariant = (status: PullRequest['status']) => {
	switch (status) {
		case 'open':
			return 'default' as const;
		case 'draft':
			return 'secondary' as const;
		case 'merged':
			return 'secondary' as const;
		case 'closed':
			return 'destructive' as const;
		default:
			return 'outline' as const;
	}
};

const getReviewBadgeVariant = (reviewState: PullRequest['reviewState']) => {
	switch (reviewState) {
		case 'approved':
			return 'default' as const;
		case 'changes_requested':
			return 'destructive' as const;
		case 'awaiting_review':
		case 'comments':
		default:
			return 'outline' as const;
	}
};

const getCiBadgeVariant = (ciStatus: PullRequest['ciStatus']) => {
	switch (ciStatus) {
		case 'success':
			return 'default' as const;
		case 'pending':
			return 'secondary' as const;
		case 'failure':
		case 'error':
			return 'destructive' as const;
		case 'unknown':
		default:
			return 'outline' as const;
	}
};

const PrCard = ({ pr }: PrCardProps) => {
	const lastUpdated = formatRelativeTime(pr.updatedAt);
	const repoName = pr.repoFullName?.split('/').slice(1).join('/') || pr.repoFullName;
	const { card } = useAppearanceStyles();

	const handleOpenInGitHub = () => {
		window.open(pr.prUrl, '_blank', 'noopener,noreferrer');
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className={`glass rounded-2xl ${card.padding} border border-glass-border hover:border-primary/40 transition-colors`}
		>
			<div className='flex items-start gap-4'>
				<div className='mt-1'>
					{pr.status === 'merged' ? (
						<GitMerge className={`${card.iconSize} text-emerald-400`} />
					) : (
						<GitPullRequest className={`${card.iconSize} text-primary`} />
					)}
				</div>

				<div className={`flex-1 ${card.spacing}`}>
					<div className='flex items-start justify-between gap-4'>
						<div className='space-y-1'>
							<div className='flex items-center gap-2'>
								<div className='flex flex-wrap items-center gap-2'>
									<Badge variant={getStatusBadgeVariant(pr.status)}>
										{pr.status === 'merged'
											? 'Merged'
											: pr.status === 'closed'
											? 'Closed'
											: pr.status === 'draft'
											? 'Draft'
											: 'Open'}
									</Badge>
									<Text className={`${card.textSize} font-semibold text-text-primary leading-snug`}>
										{pr.title}
									</Text>

									<Badge variant={getReviewBadgeVariant(pr.reviewState)}>
										{pr.reviewState === 'approved'
											? 'Approved'
											: pr.reviewState === 'changes_requested'
											? 'Changes requested'
											: pr.reviewState === 'comments'
											? 'Comments added'
											: 'Awaiting review'}
									</Badge>

									{pr.ciStatus && pr.ciStatus !== 'unknown' && (
										<Badge variant={getCiBadgeVariant(pr.ciStatus)}>
											{pr.ciStatus === 'success'
												? 'CI: Passing'
												: pr.ciStatus === 'pending'
												? 'CI: Running'
												: 'CI: Failing'}
										</Badge>
									)}
								</div>
							</div>
							<div
								className={`flex flex-wrap items-center gap-2 ${card.metaSize} text-text-secondary`}
							>
								<span className='font-mono text-text-accent'>{repoName}</span>
								<span>•</span>
								<span className='text-text-secondary/70'>#{pr.number}</span>
								<span>•</span>
								<span className='text-gray-300 flex items-center gap-1'>
									<a
										href={`https://github.com/${pr.repoFullName}/tree/${pr.baseBranch}`}
										target='_blank'
										rel='noopener noreferrer'
									>
										<span className='px-1 py-0.5 rounded-md bg-gray-500/30 text-gray-200'>
											{pr.baseBranch}
										</span>
									</a>
									<ArrowLeft className='w-4 h-4' />
									<a
										href={`https://github.com/${pr.repoFullName}/tree/${pr.headBranch}`}
										target='_blank'
										rel='noopener noreferrer'
									>
										<span className='px-1 py-0.5 rounded-md bg-gray-500/30 text-gray-200'>
											{pr.headBranch}
										</span>
									</a>
								</span>
								<span>•</span>
								<span className='text-text-secondary/70'>
									Last updated <span className='font-medium'>{lastUpdated}</span>
								</span>
							</div>
						</div>

						<div className='flex items-center gap-2'>
							<Button
								variant='outline'
								size='icon'
								onClick={handleOpenInGitHub}
								aria-label='Open pull request on GitHub'
							>
								<ExternalLink className='w-4 h-4' />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default PrCard;
