import { Button } from '@/components/ui/button';
import { useAppearanceStyles } from '@/hooks/useAppearanceStyles';
import { RefreshCw } from 'lucide-react';

interface PrFiltersBarProps {
	onRefresh: () => void;
	lastSyncedAt: string | null;
}

const PrFiltersBar = ({ onRefresh, lastSyncedAt }: PrFiltersBarProps) => {
	const { page: spacing } = useAppearanceStyles();
	const formattedLastSynced =
		lastSyncedAt &&
		new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	return (
		<div
			className={`glass rounded-2xl border border-glass-border px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between ${
				spacing.sectionGap ?? 'gap-3'
			}`}
		>
			<div />
			<div className='flex flex-wrap items-center gap-3 md:justify-end'>
				<Button
					variant='outline'
					size='sm'
					onClick={onRefresh}
					className='inline-flex items-center gap-2'
				>
					<RefreshCw className='w-4 h-4' />
					<span>Refresh</span>
				</Button>

				{formattedLastSynced && (
					<span className='text-xs text-text-secondary/80'>
						Last synced at <span className='font-medium'>{formattedLastSynced}</span>
					</span>
				)}
			</div>
		</div>
	);
};

export default PrFiltersBar;
