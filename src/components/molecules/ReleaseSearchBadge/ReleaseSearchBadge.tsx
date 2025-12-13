import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { ReleaseEvent, ReleaseItem } from '@/store/slices/releasesSlice';
import { Calendar, Link2 } from 'lucide-react';

interface ReleaseSearchBadgeProps {
	release: ReleaseEvent | ReleaseItem;
	className?: string;
}

const ReleaseSearchBadge = ({ release, className }: ReleaseSearchBadgeProps) => {
	const compactMode = useAppSelector((state) => state.settings.appearanceSettings.compactMode);
	// Check if it's a ReleaseEvent or ReleaseItem
	const isReleaseEvent = 'title' in release && 'items' in release;

	if (isReleaseEvent) {
		const event = release as ReleaseEvent;
		return (
			<div className={cn('flex items-center', compactMode ? 'gap-1.5' : 'gap-2', className)}>
				<div className='flex-shrink-0'>
					<Calendar
						className={cn('text-text-accent', compactMode ? 'w-3.5 h-3.5' : 'w-4 h-4')}
					/>
				</div>
				<div className='flex-1 min-w-0'>
					<div
						className={cn(
							'font-medium text-white truncate',
							compactMode ? 'text-[10px]' : 'text-xs'
						)}
						title={event.title}
					>
						{event.title}
					</div>
					<div
						className={cn(
							'text-text-secondary/60',
							compactMode ? 'text-[9px]' : 'text-[10px]'
						)}
					>
						Release • {new Date(event.date).toLocaleDateString()}
					</div>
				</div>
			</div>
		);
	} else {
		const item = release as ReleaseItem;
		return (
			<div className={cn('flex items-center', compactMode ? 'gap-1.5' : 'gap-2', className)}>
				<div className='flex-shrink-0'>
					<Link2
						className={cn('text-text-accent', compactMode ? 'w-3.5 h-3.5' : 'w-4 h-4')}
					/>
				</div>
				<div className='flex-1 min-w-0'>
					<div
						className={cn(
							'font-medium text-white truncate',
							compactMode ? 'text-[10px]' : 'text-xs'
						)}
						title={item.repoName}
					>
						{item.repoName}
					</div>
					<div
						className={cn(
							'text-text-secondary/60 truncate',
							compactMode ? 'text-[9px]' : 'text-[10px]'
						)}
					>
						{item.description || 'Release Item'}
						{item.leadName && ` • ${item.leadName}`}
					</div>
				</div>
			</div>
		);
	}
};

export default ReleaseSearchBadge;
